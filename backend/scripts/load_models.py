"""Load all SQLModel models for Atlas schema introspection."""

import sys
from pathlib import Path

# Add the backend directory to Python path so we can import from src
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import SQLModel  # noqa: E402

# Import only the models we need for the simplified app
from src.unwrapped.auth.models import User  # noqa: F401, E402
from src.unwrapped.music.models import MusicAnalysisResult  # noqa: F401, E402

# This is the target metadata that Atlas will introspect
target_metadata = SQLModel.metadata

# Print the DDL for Atlas to consume
if __name__ == "__main__":
    from atlas_provider_sqlalchemy.ddl import dump_ddl  # noqa: E402

    dump_ddl(dialect_driver="postgresql", metadata=target_metadata)
