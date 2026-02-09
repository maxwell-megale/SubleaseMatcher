"""Services for match scoring, generation, and retrieval."""

from __future__ import annotations

import uuid
from collections.abc import Sequence
from decimal import Decimal

from ..domain import (
    Listing,
    ListingId,
    Match,
    MatchId,
    SeekerId,
    SeekerProfile,
    UserId,
)
from ..ports.repos import ListingRepo
from ..ports.uow import UnitOfWork


def generate_match_id(seeker_id: SeekerId, listing_id: ListingId) -> MatchId:
    """Generate a deterministic UUID v5 based on seeker and listing IDs."""
    namespace = uuid.NAMESPACE_DNS
    unique_string = f"{seeker_id}:{listing_id}"
    generated = uuid.uuid5(namespace, unique_string)
    return MatchId(str(generated))


class SimpleMatchEngine:
    """A basic scoring engine based on City and Budget fit."""

    def __init__(self, listings: ListingRepo) -> None:
        self._listings = listings

    def recommendations_for(
        self,
        seeker: SeekerProfile,
        *,
        limit: int = 20,
    ) -> Sequence[ListingId]:
        """Return listings matching the seeker's city, ranked by budget fit."""
        if not seeker.city:
            return []

        # Fetch candidates (simple city filter first)
        page = self._listings.search(city=seeker.city, limit=limit * 2, offset=0)

        candidates = []
        for item in page.items:
            # Depending on repo implementation, item might be Listing or dict.
            # We assume Listing domain object here based on ports.
            if isinstance(item, Listing):
                score = self.score_pair(seeker, item)
                if score > 0:
                    candidates.append((item.id, score))

        # Sort by score desc
        candidates.sort(key=lambda x: x[1], reverse=True)
        return [cid for cid, _ in candidates[:limit]]

    def score_pair(self, seeker: SeekerProfile, listing: Listing) -> float:
        """Scores match on [0,1]: 0.5 for City + 0.5 for Budget."""
        # 1. City Check
        s_city = seeker.city.strip().lower() if seeker.city else ""
        l_city = listing.city.strip().lower()
        if s_city != l_city:
            return 0.0

        score = 0.5

        # 2. Budget Check
        if not seeker.budget_max or not listing.price_per_month:
            return score + 0.5  # Optimistic if data missing

        max_b = seeker.budget_max.amount
        price = listing.price_per_month.amount

        if price <= max_b:
            return 1.0

        # Decay: 0.1 penalty per $100 over
        # Ensure Decimal math
        penalty = ((price - max_b) / Decimal("100")) * Decimal("0.1")
        budget_points = max(Decimal("0.0"), Decimal("0.5") - penalty)

        return float(round(Decimal(str(score)) + budget_points, 2))


class MatchService:
    def __init__(self, uow: UnitOfWork) -> None:
        self._uow = uow

    def get_my_matches(self, user_id: UserId) -> list[Match]:
        """Returns matches sorted by Score (Desc)."""
        page = self._uow.matches.for_user(user_id, limit=100)

        matches = []
        for item in page.items:
            if isinstance(item, Match):
                matches.append(item)

        # Sort desc by score, break ties with ID
        matches.sort(key=lambda m: (-1 * (m.score or 0), str(m.id)))
        return matches
