"""Enumerations describing user roles, listing lifecycle, and decisions."""

from __future__ import annotations

from enum import StrEnum


class Role(StrEnum):
    """Defines supported user roles."""

    SEEKER = "SEEKER"
    HOST = "HOST"


class ListingStatus(StrEnum):
    """Lifecycle states for listings."""

    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    UNLISTED = "UNLISTED"


class Decision(StrEnum):
    """Swipe decision types."""

    LIKE = "LIKE"
    PASS = "PASS"  # noqa: S105


class MatchStatus(StrEnum):
    """Match progression states."""

    PENDING = "PENDING"
    MUTUAL = "MUTUAL"
    CLOSED = "CLOSED"


class Term(StrEnum):
    """Academic terms supported for seeker availability."""

    SPRING = "SPRING"
    SUMMER = "SUMMER"
    FALL = "FALL"
    WINTER = "WINTER"


__all__ = [
    "Role",
    "ListingStatus",
    "Decision",
    "MatchStatus",
    "Term",
]
