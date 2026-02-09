"""Application services for swipe flows and lightweight matching."""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime
from typing import cast
from uuid import uuid4

from ..domain import (
    Decision,
    HostId,
    Listing,
    ListingId,
    ListingStatus,
    Match,
    MatchStatus,
    SeekerId,
    SeekerProfile,
    Swipe,
    SwipeId,
    UserId,
)
from ..errors import NotFound, Validation
from ..ports.uow import UnitOfWork
from .matches import generate_match_id
from .models import RecommendationPage, SwipeCmd
from .ports import MatchEngine


class SwipeService:
    """Coordinates swipe decisions, queues, and resulting matches."""

    def __init__(self, uow: UnitOfWork, engine: MatchEngine) -> None:
        self._uow = uow
        self._engine = engine

    # ------------------------------------------------------------------
    # QUEUES
    # ------------------------------------------------------------------
    def queue_for_seeker(
        self,
        seeker_id: SeekerId,
        *,
        limit: int = 20,
    ) -> list[ListingId]:
        """Return a deterministic list of ListingIds for a seeker.

        This is kept for backwards-compatibility with existing callers.
        Internally we rely on the same logic as the page-based API.
        """
        page = self.queue_page_for_seeker(seeker_id, limit=limit)
        return page.items

    def queue_page_for_seeker(
        self,
        seeker_id: SeekerId,
        *,
        limit: int = 20,
    ) -> RecommendationPage:
        """Return a RecommendationPage of listings for the given seeker.

        Ordering is deterministic: we sort by ListingId when falling back
        to generic search results, and we stabilize engine output as well.
        """
        seeker = self._uow.seekers.get(seeker_id)
        if seeker is None:
            raise NotFound(f"seeker profile {seeker_id} not found")

        # Try engine-driven recommendations first
        recommendations = list(self._engine.recommendations_for(seeker, limit=limit))
        listing_ids: list[ListingId] = []

        if recommendations:
            # Ensure deterministic ordering in case the engine is non-deterministic
            for item in recommendations[:limit]:
                listing_id = self._extract_listing_id(item)
                if listing_id is not None:
                    listing_ids.append(listing_id)
            listing_ids.sort(key=lambda lid: str(lid))
            return RecommendationPage(items=listing_ids, next_cursor=None)

        # Fallback: generic search over published listings
        page = self._uow.listings.search(
            status=ListingStatus.PUBLISHED.value,
            limit=limit,
            offset=0,
        )
        for item in page.items:
            listing_id = self._extract_listing_id(item)
            if listing_id is not None:
                listing_ids.append(listing_id)

        listing_ids.sort(key=lambda lid: str(lid))
        return RecommendationPage(items=listing_ids[:limit], next_cursor=None)

    def queue_for_host(
        self,
        listing_id: ListingId,
        *,
        limit: int = 20,
    ) -> list[SeekerId]:
        """Return a deterministic list of seeker IDs relevant to a listing."""
        listing = self._uow.listings.get(listing_id)
        if listing is None:
            raise NotFound(f"listing {listing_id} not found")

        page = self._uow.seekers.search(limit=limit, offset=0)
        candidates: list[tuple[SeekerProfile, float]] = []

        for item in page.items:
            if isinstance(item, SeekerProfile) and not item.hidden:
                score = self._engine.score_pair(item, listing)
                candidates.append((item, score))

        # Deterministic ordering: sort by score desc, then seeker_id for ties
        candidates.sort(key=lambda entry: (-entry[1], str(entry[0].id)))
        return [candidate.id for candidate, _ in candidates[:limit]]

    # ------------------------------------------------------------------
    # SWIPE RECORDING / UNDO
    # ------------------------------------------------------------------
    def record(self, cmd: SwipeCmd) -> Swipe:
        """Record a swipe decision, enforcing idempotency.

        A user may not create duplicate swipes for the same (user_id,
        target_id, decision) triple. Such attempts raise Validation.
        """
        decision = self._parse_decision(cmd.decision)
        timestamp = datetime.now(tz=UTC)

        # Compute idempotency key *before* creating the Swipe
        idempotency_key = Swipe.make_idempotency_key(
            cmd.user_id,
            cmd.target_id,
            decision,
        )

        self._uow.begin()
        try:
            # Expectation: swipes repo implements get_by_idempotency_key(key: str)
            existing = self._uow.swipes.get_by_idempotency_key(idempotency_key)
            if existing is not None:
                raise Validation(
                    "Duplicate swipe for this user/target/decision; "
                    "operation is idempotent.",
                )

            swipe = Swipe(
                id=SwipeId(str(uuid4())),
                user_id=cmd.user_id,
                target_id=cmd.target_id,
                decision=decision,
                created_at=timestamp,
            )

            self._uow.swipes.append(swipe)

            if decision == Decision.LIKE:
                self._maybe_create_match(cmd.user_id, cmd.target_id)
        except Validation:
            self._uow.rollback()
            raise
        except (ValueError, TypeError) as exc:
            self._uow.rollback()
            raise Validation(str(exc)) from exc
        except Exception:
            self._uow.rollback()
            raise
        else:
            self._uow.commit()
            return swipe

    def undo_last(self, user_id: UserId) -> Swipe | None:
        """Undo the last swipe for a user and return the removed Swipe.

        After undoing, queues should effectively reflect the previous
        state (e.g., a listing becomes visible again to a seeker).
        """
        self._uow.begin()
        try:
            swipe = self._uow.swipes.undo_last(user_id)
        except Exception:
            self._uow.rollback()
            raise
        else:
            self._uow.commit()
            return swipe

    # ------------------------------------------------------------------
    # MATCHES
    # ------------------------------------------------------------------
    def my_matches(
        self,
        user_id: UserId,
        *,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Match]:
        page = self._uow.matches.for_user(user_id, limit=limit, offset=offset)
        matches: list[Match] = []
        for item in page.items:
            if isinstance(item, Match):
                matches.append(item)
        return matches

    # ------------------------------------------------------------------
    # HELPERS
    # ------------------------------------------------------------------
    def _parse_decision(self, raw: str) -> Decision:
        normalized = raw.strip().lower()
        if normalized == "like":
            return Decision.LIKE
        if normalized == "pass":
            return Decision.PASS
        raise Validation("decision must be 'like' or 'pass'")

    def _extract_listing_id(self, item: object) -> ListingId | None:
        if isinstance(item, Listing):
            listing = cast(Listing, item)  # type: ignore[redundant-cast]
            return listing.id
        if isinstance(item, str):
            return ListingId(item)
        return None

    def _maybe_create_match(self, liker: UserId, target_id: str) -> None:
        listing = self._uow.listings.get(ListingId(target_id))
        if listing is not None:
            seeker = self._uow.seekers.get(SeekerId(str(liker)))
            if seeker is None:
                return
            self._ensure_match(seeker, listing)
            return

        seeker = self._uow.seekers.get(SeekerId(target_id))
        if seeker is None:
            return

        host_listings = self._uow.hosts.listing_ids_for_host(HostId(str(liker)))
        for listing_id in host_listings:
            host_listing = self._uow.listings.get(self._as_listing_id(listing_id))
            if host_listing is not None:
                self._ensure_match(seeker, host_listing)
                break


def _ensure_match(self, seeker: SeekerProfile, listing: Listing) -> None:
    existing = self._uow.matches.for_pair(seeker.id, listing.id)

    # 1. CALCULATE SCORE
    score = self._engine.score_pair(seeker, listing)

    if existing is None:
        # 2. GENERATE DETERMINISTIC ID
        match_id = generate_match_id(seeker.id, listing.id)

        match = Match(
            id=match_id,
            seeker_id=seeker.id,
            listing_id=listing.id,
            status=MatchStatus.PENDING,
            score=score,
            matched_at=None,
        )
        self._uow.matches.upsert(
            seeker_id=str(match.seeker_id),
            listing_id=str(match.listing_id),
            status=match.status.value,
            score=match.score,
        )
        return

    if existing.status == MatchStatus.MUTUAL:
        return

    # 3. UPDATE EXISTING MATCH
    updated = replace(
        existing,
        status=MatchStatus.MUTUAL,
        score=score,
        matched_at=datetime.now(tz=UTC),
    )
    self._uow.matches.upsert(
        seeker_id=str(updated.seeker_id),
        listing_id=str(updated.listing_id),
        status=updated.status.value,
        score=updated.score,
    )

    def _as_listing_id(self, value: ListingId | str) -> ListingId:
        return ListingId(str(value))


__all__ = ["SwipeService"]
