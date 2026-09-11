CREATE TABLE IF NOT EXISTS "childcare_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"neighborhood_id" integer,
	"notes" text,
	"link" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neighborhoods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"borough" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "school_neighborhoods" (
	"school_id" integer NOT NULL,
	"neighborhood_id" integer NOT NULL,
	CONSTRAINT "school_neighborhoods_school_id_neighborhood_id_pk" PRIMARY KEY("school_id","neighborhood_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"real_estate_link" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "childcare_options" ADD CONSTRAINT "childcare_options_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "school_neighborhoods" ADD CONSTRAINT "school_neighborhoods_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "school_neighborhoods" ADD CONSTRAINT "school_neighborhoods_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
