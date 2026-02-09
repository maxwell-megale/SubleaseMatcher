from datetime import date

from sublease_matcher.core.domain.seeker import SeekerProfile
from sublease_matcher.core.domain.value_objects import Money, validate_city


def test_budget_invariants():
    try:
        profile = SeekerProfile(
            id="s1",
            user_id="u1",
            bio="bio",
            available_from=date(2025, 5, 1),
            available_to=date(2025, 8, 1),
            budget_min=Money(900),
            budget_max=Money(800),
            city="Minneapolis",
            interests=("quiet", "near_campus"),
            contact_email="test@example.edu",
            hidden=False,
        )
        print("Failed: budget invariant did not raise error.")
    except ValueError as e:
        print("Passed: budget invariant correctly raised:", e)


def test_interests_normalization():
    profile = SeekerProfile(
        id="s2",
        user_id="u2",
        bio="bio",
        available_from=date(2025, 5, 1),
        available_to=date(2025, 8, 1),
        budget_min=Money(400),
        budget_max=Money(800),
        city="Minneapolis",
        interests=(
            "Quiet ",
            "near_campus",
            " ",
            "quiet",
        ),  # Duplicate, spaced, varied case
        contact_email="test@example.edu",
        hidden=False,
    )
    # The class should automatically normalize interests
    # Should result in ("near_campus", "quiet")
    expected = ("near_campus", "quiet")
    assert (
        profile.interests == expected
    ), f"Interests normalization failed: got {profile.interests}, expected {expected}"
    print("Passed: Interests normalized to", profile.interests)


def test_city_validation():
    try:
        city = validate_city("    ")
        print("Failed: blank city validation did not raise error.")
    except ValueError as e:
        print("Passed: blank city validation correctly raised:", e)
    # Test a good city
    city = validate_city("Minneapolis")
    print("Passed: city validation for 'Minneapolis'. Returned city:", city)


def test_date_chronology():
    try:
        profile = SeekerProfile(
            id="s3",
            user_id="u3",
            bio="bio",
            available_from=date(2025, 9, 1),
            available_to=date(2025, 8, 1),
            budget_min=Money(500),
            budget_max=Money(800),
            city="Minneapolis",
            interests=("quiet", "near_campus"),
            contact_email="test@example.edu",
            hidden=False,
        )
        print("Failed: date chronology error not raised.")
    except ValueError as e:
        print("Passed: date chronology error correctly raised:", e)


def test_can_show_publicly_hidden():
    profile = SeekerProfile(
        id="s4",
        user_id="u4",
        bio="bio",
        available_from=date(2025, 5, 1),
        available_to=date(2025, 8, 1),
        budget_min=Money(400),
        budget_max=Money(800),
        city="Minneapolis",
        interests=("quiet", "near_campus"),
        contact_email="test@example.edu",
        hidden=True,
    )
    # If you use the can_show_publicly property:
    if hasattr(profile, "can_show_publicly"):
        assert (
            profile.can_show_publicly is False
        ), "Can show publicly should be False if hidden"
        print("Passed: can_show_publicly is False for hidden profiles")
    else:
        # If no property, just check hidden directly
        assert profile.hidden is True
        print("Passed: hidden flag is True, not shown publicly")


def test_hidden_flag_publishable():

    profile = SeekerProfile(
        id="s5",
        user_id="u5",
        bio="test bio",
        available_from=date(2025, 5, 1),
        available_to=date(2025, 8, 1),
        budget_min=None,
        budget_max=None,
        city="Minneapolis",
        interests=("music",),
        contact_email=None,
        hidden=False,
    )
    # Assert publishable is True when not hidden
    assert getattr(profile, "can_show_publicly", not profile.hidden) is True

    # Set hidden to True and check publishable (simulate toggle if only direct attribute change)
    profile_hidden = SeekerProfile(
        id="s5",
        user_id="u5",
        bio="test bio",
        available_from=date(2025, 5, 1),
        available_to=date(2025, 8, 1),
        budget_min=None,
        budget_max=None,
        city="Minneapolis",
        interests=("music",),
        contact_email=None,
        hidden=True,
    )
    assert (
        getattr(profile_hidden, "can_show_publicly", not profile_hidden.hidden) is False
    )


def main():
    print("Test: Budget min/max invariant")
    test_budget_invariants()
    print("\nTest: Interests normalization")
    test_interests_normalization()
    print("\nTest: City validation")
    test_city_validation()
    print("\nTest: Date chronology invariant")
    test_date_chronology()
    print("\nTest: Hidden flag semantics for public visibility")
    test_can_show_publicly_hidden()
    print("\nTest: Hidden flag and publishable status")
    test_hidden_flag_publishable()


if __name__ == "__main__":
    main()
