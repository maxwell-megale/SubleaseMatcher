"""Reusable value objects and lightweight validators."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import ROUND_HALF_UP, Decimal
from typing import Any

_TWO_PLACES = Decimal("0.01")

_US_STATE_CODES = {
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
    "DC",
}


def _ensure_decimal(value: Any) -> Decimal:
    if isinstance(value, Decimal):
        return value
    if isinstance(value, (int, float)):
        return Decimal(str(value))
    if isinstance(value, str):
        return Decimal(value)
    raise TypeError("Money amount must be convertible to Decimal.")


@dataclass(slots=True, frozen=True)
class Money:
    """Represents a monetary amount quantized to cents."""

    amount: Decimal

    def __post_init__(self) -> None:
        quantized = _ensure_decimal(self.amount).quantize(
            _TWO_PLACES, rounding=ROUND_HALF_UP
        )
        if quantized < Decimal("0.00"):
            raise ValueError("Money amount cannot be negative.")
        object.__setattr__(self, "amount", quantized)

    def __str__(self) -> str:
        return f"{self.amount:.2f}"


def validate_email(value: str) -> str:
    """Performs a simple structural validation for email addresses."""

    candidate = value.strip()
    if "@" not in candidate or "." not in candidate.split("@")[-1]:
        raise ValueError("Invalid email address.")
    return candidate


def validate_state_code(value: str) -> str:
    """Validate and normalize a US state code."""

    candidate = value.strip().upper()
    if len(candidate) != 2 or candidate not in _US_STATE_CODES:
        raise ValueError("State must be a valid two-letter US code.")
    return candidate


def validate_city(value: str) -> str:
    """Validates that a city name is a non-empty string."""

    candidate = value.strip()
    if not candidate:
        raise ValueError("City must be a non-empty string.")
    return candidate


def validate_availability_dates(
    available_from: date, available_to: date | None
) -> None:
    """Validates that an availability date range is chronological and within a reasonable timeframe."""
    today = date.today()
    max_year = today.year + 10
    if not (today.year <= available_from.year <= max_year):
        raise ValueError(
            f"Availability start date year must be between {today.year} and {max_year}."
        )

    if available_to:
        if available_to < available_from:
            raise ValueError("Availability end date cannot be before start date.")
        if not (today.year <= available_to.year <= max_year):
            raise ValueError(
                f"Availability end date year must be between {today.year} and {max_year}."
            )


@dataclass(slots=True, frozen=True)
class DateRange:
    """Simple inclusive date range for availability windows."""

    available_from: date
    available_to: date | None = None

    def __post_init__(self) -> None:
        validate_availability_dates(self.available_from, self.available_to)


__all__ = [
    "Money",
    "validate_email",
    "validate_state_code",
    "validate_city",
    "validate_availability_dates",
    "DateRange",
]
