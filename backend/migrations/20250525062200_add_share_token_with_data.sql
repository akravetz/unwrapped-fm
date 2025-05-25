-- Add share_token column as nullable first
ALTER TABLE "musicanalysisresult" ADD COLUMN "share_token" character varying NULL;
ALTER TABLE "musicanalysisresult" ADD COLUMN "shared_at" timestamptz NULL;

-- Update existing records with random share tokens
UPDATE "musicanalysisresult"
SET "share_token" = substr(md5(random()::text || id::text), 1, 15),
    "shared_at" = "created_at"
WHERE "share_token" IS NULL;

-- Now make share_token NOT NULL and add unique constraint
ALTER TABLE "musicanalysisresult" ALTER COLUMN "share_token" SET NOT NULL;
CREATE UNIQUE INDEX "ix_musicanalysisresult_share_token" ON "musicanalysisresult" ("share_token");
