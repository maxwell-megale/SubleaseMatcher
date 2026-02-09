"""Domain entity capturing swipe decisions made by users."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .enums import Decision
from .ids import SwipeId, UserId


@dataclass(slots=True, frozen=True)
class Swipe:
    """Represents a swipe action taken by a user.

    Idempotency for swipe actions is defined by the tuple:
    (user_id, target_id, decision). Replaying the same triple should
    not create a new swipe record.
    """

    id: SwipeId
    user_id: UserId
    target_id: str
    decision: Decision
    created_at: datetime

    @property
    def idempotency_key(self) -> str:
        """Deterministic key for enforcing swipe idempotency."""
        return self.make_idempotency_key(self.user_id, self.target_id, self.decision)

    @staticmethod
    def make_idempotency_key(
        user_id: UserId,
        target_id: str,
        decision: Decision,
    ) -> str:
        """Pure helper for computing the idempotency key before creating a Swipe."""
        # decision.value assumes Decision is an Enum/StrEnum
        return f"{user_id}:{target_id}:{decision.value}"
