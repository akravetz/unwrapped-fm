#!/usr/bin/env python3
"""Atlas migration wrapper for local development."""

import subprocess
import sys
from pathlib import Path


def run_atlas_command(command: list[str]) -> int:
    """Run an Atlas command and return the exit code."""
    try:
        result = subprocess.run(
            command,
            cwd=Path(__file__).parent.parent,  # Run from backend directory
            check=False,
            capture_output=False,
        )
        return result.returncode
    except FileNotFoundError:
        print("Error: Atlas CLI not found. Please install Atlas CLI first.")
        print("Visit: https://atlasgo.io/getting-started#installation")
        return 1


def main():
    """Main entry point for Atlas migration commands."""
    if len(sys.argv) < 2:
        print("Usage: python atlas_migrate.py <command>")
        print("Commands: diff, apply, status, validate")
        return 1

    command = sys.argv[1]

    if command == "diff":
        # Generate new migration
        atlas_cmd = [
            "atlas",
            "migrate",
            "diff",
            "--env",
            "local",
            "--var",
            "name=auto_migration",
        ]
    elif command == "apply":
        # Apply migrations
        atlas_cmd = ["atlas", "migrate", "apply", "--env", "local"]
    elif command == "status":
        # Check migration status
        atlas_cmd = ["atlas", "migrate", "status", "--env", "local"]
    elif command == "validate":
        # Validate migration files
        atlas_cmd = ["atlas", "migrate", "validate", "--env", "local"]
    else:
        print(f"Unknown command: {command}")
        print("Available commands: diff, apply, status, validate")
        return 1

    return run_atlas_command(atlas_cmd)


if __name__ == "__main__":
    sys.exit(main())
