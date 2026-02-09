"""Sample domain entity demonstrating typing conventions."""

from dataclasses import dataclass


@dataclass(slots=True)
class ExampleEntity:
    """Minimal example entity representing a named identifier."""

    id: str
    name: str
