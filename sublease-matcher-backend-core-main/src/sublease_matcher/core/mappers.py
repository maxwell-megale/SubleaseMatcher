"""Placeholder mappers for bridging domain objects to adapter layers."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

from .domain import Listing, SeekerProfile


def listing_to_dict(obj: Listing) -> dict[str, Any]:
    """Return a shallow dict representation of a listing."""

    return asdict(obj, dict_factory=dict)


def seeker_to_dict(obj: SeekerProfile) -> dict[str, Any]:
    """Return a shallow dict representation of a seeker profile."""

    return asdict(obj, dict_factory=dict)


__all__ = ["listing_to_dict", "seeker_to_dict"]
