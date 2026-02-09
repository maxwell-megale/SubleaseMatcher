"""Application services for seeker profile management."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import replace
from decimal import Decimal

from ..domain import Money, SeekerId, SeekerProfile, UserId
from ..errors import NotFound, Validation
from ..ports.uow import UnitOfWork
from .models import _SENTINEL, UpdateSeekerCmd


class SeekerService:
    """Coordinates seeker profile edits with repository persistence."""

    def __init__(self, uow: UnitOfWork) -> None:
        self._uow = uow

    def get_by_user(self, user_id: UserId) -> SeekerProfile:
        """Fetches the seeker profile associated with the given user."""

        seeker_id = self._derive_seeker_id(user_id)
        seeker = self._uow.seekers.get(seeker_id)
        if seeker is None:
            raise NotFound(f"seeker profile missing for user {user_id}")
        return seeker

    def update_seeker_profile(
        self, seeker_id: SeekerId, updates: dict[str, Any]
    ) -> SeekerProfile:
        """Updates a seeker's profile with the given data.

        Args:
            seeker_id: The ID of the seeker to update.
            updates: A dictionary of fields to update.

        Returns:
            The updated seeker profile.

        Raises:
            NotFound: If the seeker profile does not exist.
            Validation: If any of the updates violate a domain rule.
        """
        self._uow.begin()
        try:
            seeker = self._uow.seekers.get(seeker_id)
            if seeker is None:
                raise NotFound(f"Seeker profile {seeker_id} not found.")

            update_data = updates.copy()

            if "budget_min" in update_data:
                if update_data["budget_min"] is None:
                    update_data["budget_min"] = None
                else:
                    update_data["budget_min"] = Money(amount=update_data["budget_min"])

            if "budget_max" in update_data:
                if update_data["budget_max"] is None:
                    update_data["budget_max"] = None
                else:
                    update_data["budget_max"] = Money(amount=update_data["budget_max"])

            updated_seeker = replace(seeker, **update_data)

            self._uow.seekers.upsert(updated_seeker)
            self._uow.commit()
            return updated_seeker
        except (ValueError, TypeError) as exc:
            self._uow.rollback()
            raise Validation(str(exc)) from exc
        except (NotFound, Validation):
            self._uow.rollback()
            raise
        except Exception:
            self._uow.rollback()
            raise

    def upsert_for_user(self, cmd: UpdateSeekerCmd) -> SeekerProfile:
        """Creates or updates a seeker profile for the given user."""

        seeker_id = self._derive_seeker_id(cmd.user_id)
        self._uow.begin()
        try:
            current = self._uow.seekers.get(seeker_id)
            if current is None:
                profile = self._create_profile_from_command(seeker_id, cmd)
            else:
                profile = self._merge_profile(current, cmd)
            self._uow.seekers.upsert(profile)
        except Validation:
            self._uow.rollback()
            raise
        except (ValueError, TypeError) as exc:
            self._uow.rollback()
            raise Validation(str(exc)) from exc
        except Exception:
            self._uow.rollback()
            raise
        else:
            self._uow.commit()
            return profile

    def _derive_seeker_id(self, user_id: UserId) -> SeekerId:
        return SeekerId(str(user_id))

    def _create_profile_from_command(
        self, seeker_id: SeekerId, cmd: UpdateSeekerCmd
    ) -> SeekerProfile:
        # Required fields for creation
        if cmd.bio is _SENTINEL or cmd.bio is None:
            raise Validation("bio is required when creating a seeker profile.")
        if cmd.available_from is _SENTINEL or cmd.available_from is None:
            raise Validation(
                "available_from is required when creating a seeker profile."
            )
        if cmd.available_to is _SENTINEL or cmd.available_to is None:
            raise Validation("available_to is required when creating a seeker profile.")

        return SeekerProfile(
            id=seeker_id,
            user_id=cmd.user_id,
            bio=cmd.bio,
            available_from=cmd.available_from,
            available_to=cmd.available_to,
            budget_min=self._to_money(
                cmd.budget_min if cmd.budget_min is not _SENTINEL else None
            ),
            budget_max=self._to_money(
                cmd.budget_max if cmd.budget_max is not _SENTINEL else None
            ),
            city=cmd.city if cmd.city is not _SENTINEL else None,
            interests=self._to_tuple(
                cmd.interests if cmd.interests is not _SENTINEL else None
            ),
            contact_email=self._normalize_email(
                cmd.contact_email if cmd.contact_email is not _SENTINEL else None
            ),
            hidden=cmd.hidden if cmd.hidden is not _SENTINEL else False,
        )

    def _merge_profile(
        self, current: SeekerProfile, cmd: UpdateSeekerCmd
    ) -> SeekerProfile:
        update_data = {}
        if cmd.bio is not _SENTINEL:
            update_data["bio"] = cmd.bio
        if cmd.available_from is not _SENTINEL:
            update_data["available_from"] = cmd.available_from
        if cmd.available_to is not _SENTINEL:
            update_data["available_to"] = cmd.available_to

        if cmd.budget_min is not _SENTINEL:
            update_data["budget_min"] = self._to_money(cmd.budget_min)
        if cmd.budget_max is not _SENTINEL:
            update_data["budget_max"] = self._to_money(cmd.budget_max)
        if cmd.city is not _SENTINEL:
            update_data["city"] = cmd.city
        if cmd.interests is not _SENTINEL:
            update_data["interests"] = self._to_tuple(cmd.interests)
        if cmd.contact_email is not _SENTINEL:
            update_data["contact_email"] = self._normalize_email(cmd.contact_email)
        if cmd.hidden is not _SENTINEL:
            update_data["hidden"] = cmd.hidden

        return replace(current, **update_data)

    def _to_money(self, value: Decimal | None) -> Money | None:
        if value is None:
            return None
        return Money(value)

    def _to_tuple(self, interests: Sequence[str] | None) -> tuple[str, ...]:
        if interests is None:
            return ()
        return tuple(interests)

    def _normalize_email(self, email: str | None) -> str | None:
        if email is None:
            return None
        stripped = email.strip()
        if not stripped:
            return None
        return stripped


__all__ = ["SeekerService"]
