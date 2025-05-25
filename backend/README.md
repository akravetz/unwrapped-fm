# unwrapped.fm Backend

## Prerequisites

### Atlas CLI Installation

This project uses [Atlas](https://atlasgo.io/) for database migrations. You need to install the Atlas CLI:

**macOS (Homebrew):**
```bash
brew install ariga/tap/atlas
```

**Linux/macOS (curl):**
```bash
curl -sSf https://atlasgo.sh | sh
```

**Windows:**
```powershell
# Using Chocolatey
choco install atlas

# Or download from: https://github.com/ariga/atlas/releases
```

**Verify installation:**
```bash
atlas version
```

## Development Setup

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Start database:**
   ```bash
   task db-up
   ```

3. **Apply migrations:**
   ```bash
   task db:migrate:apply
   ```

4. **Start development server:**
   ```bash
   task backend-start
   ```

## Database Migrations

### Local Development

- **Generate migration:** `task db:migrate:diff`
- **Apply migrations:** `task db:migrate:apply`
- **Check status:** `task db:migrate:status`
- **Validate migrations:** `task db:migrate:validate`

### Testing

Migrations are automatically applied to test databases using testcontainers. No manual intervention required.

### Migration Workflow

1. Modify your SQLModel models
2. Generate migration: `task db:migrate:diff`
3. Review the generated migration file in `migrations/`
4. Apply migration: `task db:migrate:apply`
5. Commit both model changes and migration files

## Testing

```bash
# Run all tests
task backend-test

# Run with coverage
uv run pytest --cov=src --cov-report=html
```

## Code Quality

```bash
# Lint code
task backend-lint

# Format code
task backend-format
```
