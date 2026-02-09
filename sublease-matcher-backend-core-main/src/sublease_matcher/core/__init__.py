"""Core domain, ports, and services for the Sublease Matcher application."""

from __future__ import annotations

from . import domain as _domain
from . import factories as _factories
from . import mappers as _mappers
from . import services as _services
from .domain import *  # noqa: F401,F403
from .domain.sample_entity import ExampleEntity
from .errors import Conflict, DomainError, NotFound, Validation
from .factories import *  # noqa: F401,F403
from .mappers import *  # noqa: F401,F403
from .ports import repos as _repos
from .ports.repos import *  # noqa: F401,F403
from .ports.uow import UnitOfWork
from .services import *  # noqa: F401,F403
from .services import ports as _service_ports

__all__ = [
    "ExampleEntity",
    "DomainError",
    "NotFound",
    "Conflict",
    "Validation",
    "UnitOfWork",
    *_domain.__all__,
    *_repos.__all__,
    *_services.__all__,
    *_factories.__all__,
    *_mappers.__all__,
    *_service_ports.__all__,
]
