"""User domain model capturing core identity and roles."""

from __future__ import annotations

from dataclasses import dataclass

from .enums import Role
from .ids import UserId
from .value_objects import validate_email


@dataclass(slots=True, frozen=True)
class UserAccount:
    """Represents a platform user and their assigned roles."""

    id: UserId
    email: str
    first_name: str
    last_name: str
    roles: tuple[Role, ...]

    def __post_init__(self) -> None:
        if not self.roles:
            raise ValueError("UserAccount must have at least one role.")
        normalized_email = validate_email(self.email)
        object.__setattr__(self, "email", normalized_email)
