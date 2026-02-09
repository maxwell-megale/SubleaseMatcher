from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import uuid4

from sublease_matcher.core.domain import (
    Decision,
    Listing,
    ListingId,
    ListingStatus,
    Money,
    SeekerId,
    Swipe,
    UserId,
)
from sublease_matcher.core.errors import Validation
from sublease_matcher.core.services.models import RecommendationPage, SwipeCmd
from sublease_matcher.core.services.swipes import SwipeService

# -------------------------------------------------------------------
# Simple in-memory helpers for testing
# -------------------------------------------------------------------


@dataclass
class _Page:
    items: list[object]


@dataclass
class DummySeeker:
    """Minimal object that behaves like a seeker for SwipeService."""

    id: SeekerId
    user_id: UserId
    hidden: bool = False


class FakeSeekerRepo:
    def __init__(self) -> None:
        self._by_id: dict[SeekerId, DummySeeker] = {}

    def add(self, seeker: DummySeeker) -> None:
        self._by_id[seeker.id] = seeker

    def get(self, seeker_id: SeekerId) -> DummySeeker | None:
        return self._by_id.get(seeker_id)

    def search(self, *, limit: int, offset: int = 0) -> _Page:
        items = list(self._by_id.values())[offset : offset + limit]
        return _Page(items=items)


class FakeListingRepo:
    def __init__(self) -> None:
        self._by_id: dict[ListingId, Listing] = {}

    def add(self, listing: Listing) -> None:
        self._by_id[listing.id] = listing

    def get(self, listing_id: ListingId) -> Listing | None:
        return self._by_id.get(listing_id)

    def search(
        self, *, status: str | None = None, limit: int, offset: int = 0
    ) -> _Page:
        items: list[Listing] = list(self._by_id.values())
        if status is not None:
            items = [l for l in items if l.status == ListingStatus.PUBLISHED]
        items = items[offset : offset + limit]
        return _Page(items=items)


class FakeHostRepo:
    def listing_ids_for_host(self, host_id: UserId) -> list[ListingId]:
        return []


class FakeMatchRepo:
    def for_user(self, user_id: UserId, *, limit: int, offset: int = 0) -> _Page:
        return _Page(items=[])

    def for_pair(self, seeker_id: SeekerId, listing_id: ListingId) -> object | None:
        return None

    def upsert(self, match: object) -> None:
        pass


class FakeSwipeRepo:
    def __init__(self) -> None:
        self._swipes: list[Swipe] = []
        self._by_key: dict[str, Swipe] = {}

    def append(self, swipe: Swipe) -> None:
        self._swipes.append(swipe)
        self._by_key[swipe.idempotency_key] = swipe

    def get_by_idempotency_key(self, key: str) -> Swipe | None:
        return self._by_key.get(key)

    def undo_last(self, user_id: UserId) -> Swipe | None:
        for idx in range(len(self._swipes) - 1, -1, -1):
            s = self._swipes[idx]
            if s.user_id == user_id:
                removed = self._swipes.pop(idx)
                self._by_key.pop(removed.idempotency_key, None)
                return removed
        return None


class FakeUserRepo:
    def get(self, user_id: UserId) -> object | None:
        return None


class FakeMatchEngine:
    """Simple match engine stub."""

    def recommendations_for(self, seeker: object, *, limit: int = 20):
        return []  # force fallback to listing search

    def score_pair(self, seeker: object, listing: Listing) -> float:
        return 0.5


class FakeUnitOfWork:
    """Minimal in-memory implementation of the UnitOfWork protocol."""

    def __init__(self) -> None:
        self.users = FakeUserRepo()
        self.seekers = FakeSeekerRepo()
        self.hosts = FakeHostRepo()
        self.listings = FakeListingRepo()
        self.swipes = FakeSwipeRepo()
        self.matches = FakeMatchRepo()

    def begin(self) -> None:
        pass

    def commit(self) -> None:
        pass

    def rollback(self) -> None:
        pass

    def __enter__(self) -> FakeUnitOfWork:
        self.begin()
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        if exc is not None:
            self.rollback()
        else:
            self.commit()


# -------------------------------------------------------------------
# Test helpers
# -------------------------------------------------------------------


def make_demo_seeker() -> DummySeeker:
    return DummySeeker(
        id=SeekerId(str(uuid4())),
        user_id=UserId(str(uuid4())),
        hidden=False,
    )


def make_demo_listing() -> Listing:
    return Listing(
        id=ListingId(str(uuid4())),
        host_id=UserId(str(uuid4())),
        title="Demo Listing",
        price_per_month=Money(750),
        city="Eau Claire",
        state="WI",
        available_from=None,
        available_to=None,
        status=ListingStatus.PUBLISHED,
        contact_email="host@example.com",
        bio=None,
    )


# -------------------------------------------------------------------
# Actual tests
# -------------------------------------------------------------------


def smoke_swipe_record_and_undo() -> None:
    print("=== Running SwipeService smoke test ===")

    uow = FakeUnitOfWork()
    engine = FakeMatchEngine()
    service = SwipeService(uow, engine)

    seeker = make_demo_seeker()
    listing = make_demo_listing()

    uow.seekers.add(seeker)
    uow.listings.add(listing)

    # 1. initial queue
    print("\n[1] Initial queue for seeker:")
    initial_queue = service.queue_for_seeker(seeker.id)
    print("Queue:", initial_queue)

    # 2. record LIKE
    print("\n[2] Recording LIKE swipe:")
    cmd = SwipeCmd(
        user_id=seeker.id,
        target_id=str(listing.id),
        decision="like",
    )
    swipe = service.record(cmd)
    print("Swipe recorded:", swipe)

    # 3. undo
    print("\n[3] Undo last swipe:")
    undone = service.undo_last(seeker.id)
    print("Undone:", undone)

    # 4. queue restored
    print("\n[4] Queue after undo:")
    restored_queue = service.queue_for_seeker(seeker.id)
    print("Queue:", restored_queue)

    print("\n=== Smoke test complete ===")


def test_idempotent_swipes() -> None:
    print("\n=== Running idempotency test ===")
    uow = FakeUnitOfWork()
    engine = FakeMatchEngine()
    service = SwipeService(uow, engine)

    seeker = make_demo_seeker()
    listing = make_demo_listing()
    uow.seekers.add(seeker)
    uow.listings.add(listing)

    cmd = SwipeCmd(
        user_id=seeker.id,
        target_id=str(listing.id),
        decision="like",
    )

    swipe1 = service.record(cmd)
    print("First swipe OK:", swipe1)

    try:
        service.record(cmd)
        print("ERROR: duplicate swipe accepted")
    except Validation:
        print("Second swipe correctly raised Validation ✅")


def test_swipe_domain_idempotency() -> None:
    print("\n=== Running Swipe domain idempotency test ===")
    user_id = UserId(str(uuid4()))
    target_id = "listing-123"
    decision = Decision.LIKE

    swipe = Swipe(
        id="swipe-1",
        user_id=user_id,
        target_id=target_id,
        decision=decision,
        created_at=datetime.now(UTC),
    )

    key1 = swipe.idempotency_key
    key2 = Swipe.make_idempotency_key(user_id, target_id, decision)

    print("Key instance:", key1)
    print("Key static:  ", key2)

    assert key1 == key2
    print("Swipe domain idempotency ✅")


def test_recommendation_page_model() -> None:
    print("\n=== Running RecommendationPage model test ===")
    lid1 = ListingId("listing-1")
    lid2 = ListingId("listing-2")

    page = RecommendationPage(
        items=[lid1, lid2],
        next_cursor="cursor-xyz",
    )

    print("Items:", page.items)
    print("Cursor:", page.next_cursor)

    assert page.items == [lid1, lid2]
    assert page.next_cursor == "cursor-xyz"
    print("RecommendationPage model ✅")


# -------------------------------------------------------------------
# Main
# -------------------------------------------------------------------

if __name__ == "__main__":
    smoke_swipe_record_and_undo()
    test_idempotent_swipes()
    test_swipe_domain_idempotency()
    test_recommendation_page_model()
