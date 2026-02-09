"""Service-layer protocol definitions."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Protocol

from ..domain import Listing, ListingId, SeekerProfile


class MatchEngine(Protocol):
    """Provides recommendation and scoring capabilities."""

    def recommendations_for(
        self, seeker: SeekerProfile, *, limit: int = 20
    ) -> Sequence[ListingId]: ...

    def score_pair(self, seeker: SeekerProfile, listing: Listing) -> float: ...


__all__ = ["MatchEngine"]
