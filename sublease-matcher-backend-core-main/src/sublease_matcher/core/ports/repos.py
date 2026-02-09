"""Repository protocol definitions for Sublease Matcher core."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Protocol, runtime_checkable

from ..domain import (
    HostId,
    Listing,
    ListingId,
    Match,
    MatchId,
    SeekerId,
    SeekerProfile,
    Swipe,
    UserAccount,
    UserId,
)


@dataclass(slots=True, frozen=True)
class Page:
    """Lightweight pagination wrapper."""

    items: Sequence[object]
    total: int
    limit: int
    offset: int


@runtime_checkable
class UserRepo(Protocol):
    """Persistence contract for platform users."""

    def get(self, uid: UserId) -> UserAccount | None: ...

    def upsert(self, user: UserAccount) -> None: ...

    def by_email(self, email: str) -> UserAccount | None: ...


@runtime_checkable
class SeekerRepo(Protocol):
    """Persistence contract for seeker profiles."""

    def get(self, sid: SeekerId) -> SeekerProfile | None: ...

    def upsert(self, seeker: SeekerProfile) -> None: ...

    def search(
        self, *, city: str | None = None, limit: int = 20, offset: int = 0
    ) -> Page: ...


@runtime_checkable
class HostRepo(Protocol):
    """Persistence contract for host-related lookups."""

    def listing_ids_for_host(self, hid: HostId) -> Sequence[ListingId]: ...


@runtime_checkable
class ListingRepo(Protocol):
    """Persistence contract for listings."""

    def get(self, lid: ListingId) -> Listing | None: ...

    def upsert(self, listing: Listing) -> None: ...

    def search(
        self,
        *,
        city: str | None = None,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Page: ...


@runtime_checkable
class SwipeRepo(Protocol):
    """Persistence contract for swipe history."""

    def append(self, swipe: Swipe) -> None: ...

    def latest_for_user(self, uid: UserId, *, limit: int = 50) -> Sequence[Swipe]: ...

    def undo_last(self, uid: UserId) -> Swipe | None: ...


@runtime_checkable
class MatchRepo(Protocol):
    """Persistence contract for matches."""

    def get(self, mid: MatchId) -> Match | None: ...

    def upsert(self, match: Match) -> None: ...

    def for_user(self, uid: UserId, *, limit: int = 50, offset: int = 0) -> Page: ...

    def for_pair(self, seeker: SeekerId, listing: ListingId) -> Match | None: ...


__all__ = [
    "Page",
    "UserRepo",
    "SeekerRepo",
    "HostRepo",
    "ListingRepo",
    "SwipeRepo",
    "MatchRepo",
]
