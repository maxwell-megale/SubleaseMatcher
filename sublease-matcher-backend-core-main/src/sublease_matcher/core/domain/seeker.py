from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from .ids import SeekerId, UserId
from .value_objects import Money, validate_availability_dates, validate_email


def normalize_interests(interests: tuple[str, ...] | None) -> tuple[str, ...]:
    """
    Deduplicate, lowercase, strip whitespace, and sort interests
    to ensure consistent storage as a tuple of unique, lower-cased strings.
    """
    if not interests:
        return tuple()
    # Apply strip and lower to each string, remove empty strings
    cleaned = {s.strip().lower() for s in interests if isinstance(s, str) and s.strip()}
    return tuple(sorted(cleaned))


@dataclass(slots=True)
class SeekerProfile:
    """
    Represents a sublease seeker and their preferences.

    Business rules enforced in this class:
    - Hidden flag: If True, profile must not be included in public searches/listings.
    - Availability dates: validated for logical ranges.
    - Budget: budget_min cannot exceed budget_max.
    - Interests: always stored as deduplicated, lowercased tuple[str].
    - Contact email: must be validated.
    """

    id: SeekerId
    user_id: UserId
    bio: str
    available_from: date
    available_to: date
    budget_min: Money | None
    budget_max: Money | None
    city: str | None
    interests: tuple[str, ...]
    contact_email: str | None
    hidden: bool = False

    def __post_init__(self) -> None:
        # Validate logical date range for availability
        validate_availability_dates(self.available_from, self.available_to)

        # Enforce budget invariant
        if self.budget_min is not None and self.budget_max is not None:
            if self.budget_min.amount > self.budget_max.amount:
                raise ValueError("budget_min cannot exceed budget_max.")

        # Validate email format if present
        if self.contact_email is not None:
            self.contact_email = validate_email(self.contact_email)

        # Ensure interests are stored as a deduplicated, lowercased tuple
        self.interests = normalize_interests(self.interests)

    @property
    def publishable(self) -> bool:
        """
        Returns True if the profile can be included in public searches/listings.
        - Must be not hidden.
        - Must be currently available (optional, add more conditions as needed).
        """
        return not self.hidden


# Usage:
# if profile.publishable:
#     # Include in public results
