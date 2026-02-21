CREATE TABLE "draft_authors" (
	"draft_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "draft_authors_draft_id_user_id_pk" PRIMARY KEY("draft_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "article_drafts" ADD COLUMN "article_visibility" "article_visibility" DEFAULT 'PUBLIC' NOT NULL;--> statement-breakpoint
ALTER TABLE "article_drafts" ADD COLUMN "scheduled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "article_drafts" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "article_drafts" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "article_drafts" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "draft_authors" ADD CONSTRAINT "draft_authors_draft_id_article_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."article_drafts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_authors" ADD CONSTRAINT "draft_authors_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_draft_authors_user" ON "draft_authors" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "article_drafts" ADD CONSTRAINT "article_drafts_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;