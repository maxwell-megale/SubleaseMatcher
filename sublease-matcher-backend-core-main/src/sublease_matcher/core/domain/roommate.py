"""Domain model for roommate details associated with listings."""

from __future__ import annotations

from dataclasses import dataclass

from .ids import RoommateId


@dataclass(slots=True)
class RoommateProfile:
    """Represents a potential roommate included with a listing."""

    id: RoommateId
    name: str
    sleeping_habits: str | None
    gender: str | None
    pronouns: str | None
    interests: tuple[str, ...]
    major_minor: str | None
