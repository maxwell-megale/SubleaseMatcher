"""Application services for listing management."""

from __future__ import annotations

from dataclasses import replace
from decimal import Decimal
from uuid import uuid4

from ..domain import HostId, Listing, ListingId, ListingStatus, Money
from ..errors import Conflict, NotFound, Validation
from ..ports.uow import UnitOfWork
from .models import PublishListingCmd, UpsertListingCmd


class ListingService:
    """Handles host listing creation, updates, and state transitions."""

    def __init__(self, uow: UnitOfWork) -> None:
        self._uow = uow

    def get(self, listing_id: ListingId) -> Listing:
        listing = self._uow.listings.get(listing_id)
        if listing is None:
            raise NotFound(f"listing {listing_id} not found")
        return listing

    def get_mine(self, host_id: HostId) -> Listing:
        listing_ids = self._uow.hosts.listing_ids_for_host(host_id)
        if not listing_ids:
            raise NotFound(f"no listing found for host {host_id}")
        return self.get(self._as_listing_id(listing_ids[0]))

    def upsert_mine(self, cmd: UpsertListingCmd) -> Listing:
        listing_id = self._resolve_listing_id(cmd)
        self._uow.begin()
        try:
            current = self._uow.listings.get(listing_id)
            if current is None:
                listing = self._create_listing(listing_id, cmd)
            else:
                self._guard_host_access(current, cmd.host_id)
                listing = self._merge_listing(current, cmd)
            self._uow.listings.upsert(listing)
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
            return listing

    def publish(self, cmd: PublishListingCmd) -> Listing:
        listing = self.get(cmd.listing_id)
        self._guard_host_access(listing, cmd.host_id)

        self._uow.begin()
        try:
            listing.publish()
            self._uow.listings.upsert(listing)
        except Validation:
            self._uow.rollback()
            raise
        except Exception:
            self._uow.rollback()
            raise
        else:
            self._uow.commit()
            return listing

    def unlist(self, listing_id: ListingId) -> Listing:
        listing = self.get(listing_id)

        self._uow.begin()
        try:
            listing.unlist()
            self._uow.listings.upsert(listing)
        except Exception:
            self._uow.rollback()
            raise
        else:
            self._uow.commit()
            return listing

    def _resolve_listing_id(self, cmd: UpsertListingCmd) -> ListingId:
        if cmd.listing_id is not None:
            return cmd.listing_id

        existing_ids = self._uow.hosts.listing_ids_for_host(cmd.host_id)
        if existing_ids:
            return self._as_listing_id(existing_ids[0])
        return ListingId(str(uuid4()))

    def _create_listing(self, listing_id: ListingId, cmd: UpsertListingCmd) -> Listing:
        if cmd.title is None or not cmd.title.strip():
            raise Validation("title is required when creating a listing.")
        if cmd.city is None or not cmd.city.strip():
            raise Validation("city is required when creating a listing.")
        if cmd.state is None or not cmd.state.strip():
            raise Validation("state is required when creating a listing.")

        return Listing(
            id=listing_id,
            host_id=cmd.host_id,
            title=cmd.title.strip(),
            price_per_month=self._to_money(cmd.price_per_month),
            city=cmd.city.strip(),
            state=cmd.state.strip(),
            available_from=cmd.available_from,
            available_to=cmd.available_to,
            status=ListingStatus.DRAFT,
            contact_email=self._normalize_email(cmd.contact_email),
            bio=cmd.bio,
            roommates=(),
        )

    def _merge_listing(self, current: Listing, cmd: UpsertListingCmd) -> Listing:
        title = current.title
        if cmd.title is not None:
            candidate = cmd.title.strip()
            if not candidate:
                raise Validation("title cannot be blank.")
            title = candidate

        city = current.city
        if cmd.city is not None:
            candidate = cmd.city.strip()
            if not candidate:
                raise Validation("city cannot be blank.")
            city = candidate

        state = current.state
        if cmd.state is not None:
            candidate = cmd.state.strip()
            if not candidate:
                raise Validation("state cannot be blank.")
            state = candidate

        return replace(
            current,
            title=title,
            price_per_month=(
                current.price_per_month
                if cmd.price_per_month is None
                else self._to_money(cmd.price_per_month)
            ),
            city=city,
            state=state,
            available_from=(
                current.available_from
                if cmd.available_from is None
                else cmd.available_from
            ),
            available_to=(
                current.available_to if cmd.available_to is None else cmd.available_to
            ),
            contact_email=(
                current.contact_email
                if cmd.contact_email is None
                else self._normalize_email(cmd.contact_email)
            ),
            bio=current.bio if cmd.bio is None else cmd.bio,
        )

    def _guard_host_access(self, listing: Listing, host_id: HostId) -> None:
        if listing.host_id != host_id:
            raise Conflict("host cannot modify listings owned by another host.")

    def _to_money(self, value: Decimal | None) -> Money | None:
        if value is None:
            return None
        return Money(value)

    def _normalize_email(self, email: str | None) -> str | None:
        if email is None:
            return None
        stripped = email.strip()
        return stripped or None

    def _as_listing_id(self, value: ListingId | str) -> ListingId:
        return ListingId(str(value))


__all__ = ["ListingService"]
