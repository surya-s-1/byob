ALTER TABLE "series" DROP CONSTRAINT "series_publication_id_slug_unique";--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_slug_unique" UNIQUE("slug");