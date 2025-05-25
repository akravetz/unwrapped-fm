// Atlas configuration for unwrapped.fm
data "external_schema" "sqlmodel" {
  program = [
    "uv",
    "run",
    "python3",
    "scripts/load_models.py"
  ]
}

env "local" {
  src = data.external_schema.sqlmodel.url
  dev = "docker://postgres/15/dev?search_path=public"
  url = "postgresql://postgres:postgres@localhost:5432/unwrapped?sslmode=disable"
  migration {
    dir = "file://migrations"
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}

env "test" {
  src = data.external_schema.sqlmodel.url
  dev = "docker://postgres/15/dev?search_path=public"
  migration {
    dir = "file://migrations"
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}
