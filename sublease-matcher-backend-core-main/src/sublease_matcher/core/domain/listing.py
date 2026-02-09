"""Listing domain entity describing available subleases.

Roommate information is authoritative: the tuple of `roommates` must contain
exactly `roommates_count` entries when any roommates are supplied.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from ..errors import Validation
from .enums import ListingStatus
from .ids import HostId, ListingId
from .roommate import RoommateProfile
from .value_objects import (
    DateRange,
    Money,
    validate_email,
    validate_state_code,
)


@dataclass(slots=True)
class Listing:
    """Represents a housing listing posted by a host."""

    id: ListingId
    host_id: HostId
    title: str
    price_per_month: Money | None
    city: str
    state: str
    available_from: date | None
    available_to: date | None
    status: ListingStatus
    contact_email: str | None
    bio: str | None
    roommates: tuple[RoommateProfile, ...] = ()
    roommates_count: int = 0

    def __post_init__(self) -> None:
        self.title = self.title.strip()
        self.city = self.city.strip()
        self.state = self.state.strip()

        if self.price_per_month is not None and not isinstance(
            self.price_per_month,
            Money,
        ):
            raise Validation("price_per_month must be a Money instance.")

        if self.contact_email is not None:
            try:
                self.contact_email = validate_email(self.contact_email)
            except ValueError as exc:
                raise Validation(str(exc)) from exc

        if not self.state:
            raise Validation("state is required.")
        try:
            self.state = validate_state_code(self.state)
        except ValueError as exc:
            raise Validation(str(exc)) from exc

        if self.available_from is not None or self.available_to is not None:
            if self.available_from is None:
                raise Validation(
                    "available_from is required when specifying available_to."
                )
            try:
                DateRange(self.available_from, self.available_to)
            except ValueError as exc:
                raise Validation(str(exc)) from exc

        roommates = tuple(self.roommates)
        for roommate in roommates:
            if not isinstance(roommate, RoommateProfile):
                raise Validation("roommates must be RoommateProfile instances.")
        if self.roommates_count < 0:
            raise Validation("roommates_count cannot be negative.")
        if self.roommates_count != len(roommates):
            raise Validation("roommates_count must equal provided roommates.")
        self.roommates = roommates

    def publish(self) -> None:
        """Mark the listing as visible to seekers."""

        if self.status == ListingStatus.PUBLISHED:
            raise Validation("listing is already published.")

        if not self.title:
            raise Validation("title is required before publishing.")
        if not self.city:
            raise Validation("city is required before publishing.")
        if not self.state:
            raise Validation("state is required before publishing.")
        if self.contact_email is None:
            raise Validation("contact email is required before publishing.")

        try:
            self.contact_email = validate_email(self.contact_email)
            self.state = validate_state_code(self.state)
        except ValueError as exc:
            raise Validation(str(exc)) from exc

        self.status = ListingStatus.PUBLISHED

    def unlist(self) -> None:
        """Hide the listing from seekers."""

        if self.status == ListingStatus.UNLISTED:
            return
        self.status = ListingStatus.UNLISTED
