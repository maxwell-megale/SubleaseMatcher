# Sublease Matcher — Core

Pure Python domain, ports, and service layer implementing clean architecture for the Sublease Matcher platform.

## Layers
- **domain/** — entities, value objects, enums.
- **ports/** — repository, UoW, and match engine interfaces.
- **services/** — pure coordination logic.
- **factories/** — deterministic demo objects for testing.
- **mappers/** — lightweight dict converters for adapters.

## Install
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Verify Imports
```bash
PYTHONPATH=src python3 - <<'PY'
from sublease_matcher.core import *
from sublease_matcher.core.factories import make_demo_listing
l = make_demo_listing()
print("Core OK:", l.title, l.status)
PY
```

## Quality
```bash
make fmt
make lint
make typecheck
```

## Notes
- No frameworks, DB, or HTTP code allowed.
- Compatible with FastAPI adapter via the API repo.
