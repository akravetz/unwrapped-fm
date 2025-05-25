-- Create "user" table
CREATE TABLE "user" (
  "spotify_id" character varying NOT NULL,
  "email" character varying NOT NULL,
  "display_name" character varying NULL,
  "country" character varying NULL,
  "image_url" character varying NULL,
  "id" serial NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "is_active" boolean NOT NULL,
  "access_token" character varying NULL,
  "refresh_token" character varying NULL,
  "token_expires_at" timestamptz NULL,
  PRIMARY KEY ("id")
);
-- Create index "ix_user_email" to table: "user"
CREATE UNIQUE INDEX "ix_user_email" ON "user" ("email");
-- Create index "ix_user_spotify_id" to table: "user"
CREATE UNIQUE INDEX "ix_user_spotify_id" ON "user" ("spotify_id");
-- Create "musicanalysisresult" table
CREATE TABLE "musicanalysisresult" (
  "id" serial NOT NULL,
  "user_id" integer NOT NULL,
  "rating_text" character varying NOT NULL,
  "rating_description" character varying NOT NULL,
  "x_axis_pos" double precision NOT NULL,
  "y_axis_pos" double precision NOT NULL,
  "created_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "musicanalysisresult_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
