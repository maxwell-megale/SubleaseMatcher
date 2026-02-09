"""Domain entity representing seeker-listing matches."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .enums import MatchStatus
from .ids import ListingId, MatchId, SeekerId


@dataclass(slots=True)
class Match:
    """Represents the relationship between a seeker and a listing."""

    id: MatchId
    seeker_id: SeekerId
    listing_id: ListingId
    status: MatchStatus
    score: float | None
    matched_at: datetime | None

    def __post_init__(self) -> None:
        if self.score is not None and not (0.0 <= self.score <= 1.0):
            raise ValueError("score must be between 0.0 and 1.0 inclusive.")
