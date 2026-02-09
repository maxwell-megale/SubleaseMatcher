"""Typed identifiers used across Sublease Matcher domain entities."""

from __future__ import annotations

from typing import NewType

UserId = NewType("UserId", str)
SeekerId = NewType("SeekerId", str)
HostId = NewType("HostId", str)
ListingId = NewType("ListingId", str)
MatchId = NewType("MatchId", str)
SwipeId = NewType("SwipeId", str)
RoommateId = NewType("RoommateId", str)

__all__ = [
    "UserId",
    "SeekerId",
    "HostId",
    "ListingId",
    "MatchId",
    "SwipeId",
    "RoommateId",
]
