"""Unit-of-work protocol coordinating repository access."""

from __future__ import annotations

from types import TracebackType
from typing import Protocol

from .repos import HostRepo, ListingRepo, MatchRepo, SeekerRepo, SwipeRepo, UserRepo


class UnitOfWork(Protocol):
    """Abstracts transaction boundaries for repository operations."""

    users: UserRepo
    seekers: SeekerRepo
    hosts: HostRepo
    listings: ListingRepo
    swipes: SwipeRepo
    matches: MatchRepo

    def begin(self) -> None: ...

    def commit(self) -> None: ...

    def rollback(self) -> None: ...

    def __enter__(self) -> UnitOfWork: ...

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None: ...


__all__ = ["UnitOfWork"]
