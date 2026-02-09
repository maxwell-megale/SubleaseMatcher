"""Common domain error types for Sublease Matcher core logic."""

from __future__ import annotations


class DomainError(Exception):
    """Base class for domain-level exceptions."""


class NotFound(DomainError):  # noqa: N818
    """Raised when a requested entity does not exist."""


class Conflict(DomainError):  # noqa: N818
    """Raised when an operation conflicts with existing state."""


class Validation(DomainError):  # noqa: N818
    """Raised when supplied data violates a domain invariant."""


__all__ = ["DomainError", "NotFound", "Conflict", "Validation"]
