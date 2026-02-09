from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from ..domain import HostId, ListingId, UserId

_SENTINEL = object()


@dataclass(slots=True, frozen=True)
class UpdateSeekerCmd:
    """Data required to create or update a seeker profile."""

    user_id: UserId
    bio: str | None | object = _SENTINEL
    available_from: date | None | object = _SENTINEL
    available_to: date | None | object = _SENTINEL
    budget_min: Decimal | None | object = _SENTINEL
    budget_max: Decimal | None | object = _SENTINEL
    city: str | None | object = _SENTINEL
    interests: Sequence[str] | None | object = _SENTINEL
    contact_email: str | None | object = _SENTINEL
    hidden: bool | object = _SENTINEL


@dataclass(slots=True, frozen=True)
class UpsertListingCmd:
    """Command for creating or updating a host listing."""

    host_id: HostId
    listing_id: ListingId | None = None
    title: str | None = None
    price_per_month: Decimal | None = None
    city: str | None = None
    state: str | None = None
    available_from: date | None = None
    available_to: date | None = None
    contact_email: str | None = None
    bio: str | None = None


@dataclass(slots=True, frozen=True)
class PublishListingCmd:
    """Command to request publishing of a listing."""

    listing_id: ListingId
    host_id: HostId


@dataclass(slots=True, frozen=True)
class SwipeCmd:
    """Command capturing a swipe decision."""

    user_id: UserId
    target_id: str
    decision: str


@dataclass(slots=True, frozen=True)
class RecommendationPage:
    """Simple page model for listing recommendations.

    Keeps the service-level idea of paging separate from repos.Page,
    which may have different fields or semantics.
    """

    items: list[ListingId]
    next_cursor: str | None = None


__all__ = [
    "UpdateSeekerCmd",
    "UpsertListingCmd",
    "PublishListingCmd",
    "SwipeCmd",
    "RecommendationPage",
]
