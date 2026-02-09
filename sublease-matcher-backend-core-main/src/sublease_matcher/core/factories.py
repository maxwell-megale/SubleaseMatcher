"""Deterministic factory helpers for demos and adapter testing."""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from .domain import (
    Decision,
    HostId,
    Listing,
    ListingId,
    ListingStatus,
    Match,
    MatchId,
    MatchStatus,
    Money,
    Role,
    RoommateId,
    RoommateProfile,
    SeekerId,
    SeekerProfile,
    Swipe,
    SwipeId,
    UserAccount,
    UserId,
)


def make_demo_user(uid: str = "user-1") -> UserAccount:
    """Return a sample user with the seeker role."""

    return UserAccount(
        id=UserId(uid),
        email=f"{uid}@example.edu",
        first_name="Demo",
        last_name="User",
        roles=(Role.SEEKER,),
    )


def make_demo_seeker() -> SeekerProfile:
    """Return a sample seeker profile covering common fields."""

    return SeekerProfile(
        id=SeekerId("seeker-1"),
        user_id=UserId("user-1"),
        bio="Demo bio",
        available_from=date(2025, 8, 15),
        available_to=None,
        budget_min=Money(Decimal("500")),
        budget_max=Money(Decimal("800")),
        city="Eau Claire",
        interests=("coding",),
        contact_email="s1@example.edu",
        hidden=False,
    )


def make_demo_listing() -> Listing:
    """Return a sample published listing owned by a demo host."""

    return Listing(
        id=ListingId("listing-1"),
        host_id=HostId("host-1"),
        title="Room near Water St",
        price_per_month=Money(Decimal("650")),
        city="Eau Claire",
        state="WI",
        available_from=date(2025, 8, 15),
        available_to=None,
        status=ListingStatus.PUBLISHED,
        contact_email="h1@example.edu",
        bio=None,
        roommates=(),
        roommates_count=0,
    )


def make_demo_listing_with_roommates(
    roommate_count: int = 1,
    *,
    listing_id: str = "listing-roommates-1",
    host_id: str = "host-roommates-1",
) -> Listing:
    """Return a draft listing that already includes roommate profiles."""

    if roommate_count < 1:
        raise ValueError("roommate_count must be at least 1.")

    roommates = tuple(
        RoommateProfile(
            id=RoommateId(f"roommate-{index + 1}"),
            name=f"Roommate {index + 1}",
            sleeping_habits="early bird" if index % 2 == 0 else "night owl",
            gender=None,
            pronouns="they/them",
            interests=("music", "hiking"),
            major_minor="Computer Science",
        )
        for index in range(roommate_count)
    )
    today = date.today()

    return Listing(
        id=ListingId(listing_id),
        host_id=HostId(host_id),
        title="Downtown shared loft",
        price_per_month=Money(Decimal("725")),
        city="Eau Claire",
        state="WI",
        available_from=today,
        available_to=today + timedelta(days=120),
        status=ListingStatus.DRAFT,
        contact_email="roommates@example.edu",
        bio="Large unit with friendly roommates included.",
        roommates=roommates,
        roommates_count=len(roommates),
    )


def make_demo_swipe() -> Swipe:
    """Return a sample swipe action."""

    return Swipe(
        id=SwipeId("sw-1"),
        user_id=UserId("user-1"),
        target_id="listing-1",
        decision=Decision.LIKE,
        created_at=datetime.now(tz=UTC),
    )


def make_demo_match() -> Match:
    """Return a sample mutual match between the demo seeker and listing."""

    return Match(
        id=MatchId("match-1"),
        seeker_id=SeekerId("seeker-1"),
        listing_id=ListingId("listing-1"),
        status=MatchStatus.MUTUAL,
        score=0.5,
        matched_at=datetime.now(tz=UTC),
    )


__all__ = [
    "make_demo_user",
    "make_demo_seeker",
    "make_demo_listing",
    "make_demo_listing_with_roommates",
    "make_demo_swipe",
    "make_demo_match",
]
