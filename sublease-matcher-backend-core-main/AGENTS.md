# Codex Collaboration Guide

This repository is prepared for work with autonomous or semi-autonomous coding agents. Follow these guardrails to keep the Sublease Matcher core package clean, testable, and framework-agnostic.

## Architecture Overview
- **Domain (`src/sublease_matcher/core/domain/`)**  
  Home of entities, value objects, and aggregates modelling the sublease problem space. Keep logic deterministic and free of I/O.
- **Ports (`src/sublease_matcher/core/ports/`)**  
  Define repository and service interfaces (protocols) that describe the operations required from infrastructure layers (datastores, messaging, external APIs).
- **Services (`src/sublease_matcher/core/services/`)**  
  Application use-cases orchestrating domain logic and collaborating with ports. Services must depend only on domain and ports.

## Agent Rules of Engagement
1. **Stay Pure** – do not introduce frameworks, web servers, ORMs, or network/blocking I/O in this package.
2. **Type Everything** – all public APIs require explicit type hints; keep `py.typed` accurate.
3. **Use Absolute Imports** – e.g. `from sublease_matcher.core.domain import foo`.
4. **Respect Separation of Concerns** – infrastructure implementations belong outside this core package.
5. **Keep Tooling in Sync** – run `ruff`, `black`, and `mypy` before handing work back to humans.
6. **Document Use-Cases** – when adding services or ports, include concise module docstrings explaining their responsibilities.

Following these conventions ensures the core remains a reusable, testable foundation for the rest of Sublease Matcher.
