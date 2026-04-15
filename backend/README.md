# Garden Planning Tool - Backend

Built with **FastAPI** 

## Environment
Requires a virtual environment. Ensure you activate `venv` before running the server or installing new packages via `pip`.

## Dependency Management

When adding new Python packages, we must keep the `requirements.txt` updated so the rest of the team can sync their environments.

### Adding a new package:
1. Activate your environment: `source venv/bin/activate` (or Windows equivalent)
2. Install the package: `pip install <package-name>`
3. Update the manifest: `pip freeze > requirements.txt`
4. **Commit** the updated `requirements.txt` to Git.

### Syncing your environment (after a `git pull`):
If a teammate added a dependency, run:
`pip install -r requirements.txt`
