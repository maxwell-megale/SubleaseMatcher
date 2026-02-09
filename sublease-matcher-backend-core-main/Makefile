.PHONY: install fmt lint typecheck check clean

PY := python3

install:
	$(PY) -m pip install -e .

fmt:
	$(PY) -m black src

lint:
	$(PY) -m ruff check src

typecheck:
	$(PY) -m mypy src

check:
	$(PY) -m ruff check src && $(PY) -m mypy src

clean:
	rm -rf __pycache__ .mypy_cache .ruff_cache build dist *.egg-info
