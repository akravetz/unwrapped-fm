-- Create enum type "analysisstatus"
CREATE TYPE "analysisstatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
-- Modify "musicanalysisresult" table
ALTER TABLE "musicanalysisresult" ALTER COLUMN "status" TYPE "analysisstatus" USING "status"::"analysisstatus";
