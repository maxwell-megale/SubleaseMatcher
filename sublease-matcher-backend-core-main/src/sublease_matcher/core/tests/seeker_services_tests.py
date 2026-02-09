import unittest
from datetime import date, timedelta
from unittest.mock import MagicMock, create_autospec

from sublease_matcher.core.domain import Money, SeekerId, SeekerProfile, UserId
from sublease_matcher.core.errors import NotFound, Validation
from sublease_matcher.core.ports.uow import UnitOfWork
from sublease_matcher.core.services.seekers import SeekerService

# test with PYTHONPATH=src python src/sublease_matcher/core/tests/seeker_services_tests.py


class SeekerServiceTests(unittest.TestCase):
    def setUp(self):
        self.uow = create_autospec(UnitOfWork)
        self.uow.seekers = MagicMock()
        self.seeker_service = SeekerService(self.uow)

    def test_update_seeker_profile_success(self):
        seeker_id = SeekerId("seeker1")
        user_id = UserId("user1")
        original_profile = SeekerProfile(
            id=seeker_id,
            user_id=user_id,
            bio="Original bio",
            available_from=date.today(),
            available_to=date.today() + timedelta(days=30),
            budget_min=Money(amount=1000),
            budget_max=Money(amount=2000),
            city="Original City",
            interests=("reading",),
            contact_email="original@example.com",
            hidden=False,
        )
        self.uow.seekers.get.return_value = original_profile
        updates = {
            "bio": "Updated bio",
            "city": "Updated City",
            "budget_max": 2500,
        }
        updated_profile = self.seeker_service.update_seeker_profile(seeker_id, updates)
        self.uow.seekers.get.assert_called_once_with(seeker_id)
        self.uow.seekers.upsert.assert_called_once()
        self.uow.commit.assert_called_once()
        self.assertEqual(updated_profile.bio, "Updated bio")
        self.assertEqual(updated_profile.city, "Updated City")
        self.assertEqual(updated_profile.budget_max.amount, 2500)
        self.assertEqual(updated_profile.budget_min.amount, 1000)
        self.assertEqual(updated_profile.contact_email, "original@example.com")

    def test_update_seeker_profile_not_found(self):
        seeker_id = SeekerId("nonexistent")
        self.uow.seekers.get.return_value = None
        with self.assertRaises(NotFound):
            self.seeker_service.update_seeker_profile(seeker_id, {"bio": "New bio"})
        self.uow.rollback.assert_called_once()

    def test_update_seeker_profile_invalid_budget(self):
        seeker_id = SeekerId("seeker1")
        user_id = UserId("user1")
        original_profile = SeekerProfile(
            id=seeker_id,
            user_id=user_id,
            bio="Original bio",
            available_from=date.today(),
            available_to=date.today() + timedelta(days=30),
            budget_min=Money(amount=1000),
            budget_max=Money(amount=2000),
            city="Original City",
            interests=("reading",),
            contact_email="original@example.com",
            hidden=False,
        )
        self.uow.seekers.get.return_value = original_profile
        updates = {"budget_min": 2500, "budget_max": 2000}  # min > max
        with self.assertRaises(Validation):
            self.seeker_service.update_seeker_profile(seeker_id, updates)
        self.uow.rollback.assert_called_once()

    def test_update_seeker_profile_invalid_dates(self):
        seeker_id = SeekerId("seeker1")
        user_id = UserId("user1")
        original_profile = SeekerProfile(
            id=seeker_id,
            user_id=user_id,
            bio="Original bio",
            available_from=date.today(),
            available_to=date.today() + timedelta(days=30),
            budget_min=Money(amount=1000),
            budget_max=Money(amount=2000),
            city="Original City",
            interests=("reading",),
            contact_email="original@example.com",
            hidden=False,
        )
        self.uow.seekers.get.return_value = original_profile
        updates = {
            "available_from": date.today() + timedelta(days=40),
            "available_to": date.today() + timedelta(days=30),
        }
        with self.assertRaises(Validation):
            self.seeker_service.update_seeker_profile(seeker_id, updates)
        self.uow.rollback.assert_called_once()

    def test_update_seeker_profile_with_none_values(self):
        seeker_id = SeekerId("seeker1")
        user_id = UserId("user1")
        original_profile = SeekerProfile(
            id=seeker_id,
            user_id=user_id,
            bio="Original bio",
            available_from=date.today(),
            available_to=date.today() + timedelta(days=30),
            budget_min=Money(amount=1000),
            budget_max=Money(amount=2000),
            city="Original City",
            interests=("reading",),
            contact_email="original@example.com",
            hidden=False,
        )
        self.uow.seekers.get.return_value = original_profile
        updates = {
            "budget_min": None,
            "budget_max": None,
            "city": None,
        }
        updated_profile = self.seeker_service.update_seeker_profile(seeker_id, updates)
        self.uow.seekers.get.assert_called_once_with(seeker_id)
        self.uow.seekers.upsert.assert_called_once()
        self.uow.commit.assert_called_once()
        self.assertIsNone(updated_profile.budget_min)
        self.assertIsNone(updated_profile.budget_max)
        self.assertIsNone(updated_profile.city)

    def test_service_toggle_hidden(self):
        seeker_id = SeekerId("toggle1")
        user_id = UserId("user_toggle")
        profile = SeekerProfile(
            id=seeker_id,
            user_id=user_id,
            bio="toggle bio",
            available_from=date.today(),
            available_to=date.today(),
            budget_min=None,
            budget_max=None,
            city="City",
            interests=("a",),
            contact_email=None,
            hidden=False,
        )
        self.uow.seekers.get.return_value = profile
        # Set hidden True
        updates = {"hidden": True}
        updated_profile = self.seeker_service.update_seeker_profile(seeker_id, updates)
        self.assertTrue(updated_profile.hidden)
        # Set hidden False
        updates = {"hidden": False}
        updated_profile = self.seeker_service.update_seeker_profile(seeker_id, updates)
        self.assertFalse(updated_profile.hidden)

    def test_service_publishable_after_hidden_update(self):
        seeker_id = SeekerId("pub1")
        user_id = UserId("user_pub")
        profile = SeekerProfile(
            id=seeker_id,
            user_id=user_id,
            bio="bio",
            available_from=date.today(),
            available_to=date.today(),
            budget_min=None,
            budget_max=None,
            city="TestCity",
            interests=("interest",),
            contact_email=None,
            hidden=False,
        )
        self.uow.seekers.get.return_value = profile
        # Make hidden True
        updates = {"hidden": True}
        updated_profile = self.seeker_service.update_seeker_profile(seeker_id, updates)
        publishable = getattr(
            updated_profile, "can_show_publicly", not updated_profile.hidden
        )
        self.assertFalse(publishable)
        # Make hidden False
        updates = {"hidden": False}
        updated_profile = self.seeker_service.update_seeker_profile(seeker_id, updates)
        publishable = getattr(
            updated_profile, "can_show_publicly", not updated_profile.hidden
        )
        self.assertTrue(publishable)


if __name__ == "__main__":
    unittest.main()
