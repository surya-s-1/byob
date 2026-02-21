CREATE TABLE "publication_invitations" (
	"publication_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"user_role" "user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" text,
	"rejected_at" timestamp with time zone,
	CONSTRAINT "publication_invitations_publication_id_user_id_pk" PRIMARY KEY("publication_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "publication_invitations" ADD CONSTRAINT "publication_invitations_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_invitations" ADD CONSTRAINT "publication_invitations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_invitations" ADD CONSTRAINT "publication_invitations_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pub_invitations_user" ON "publication_invitations" USING btree ("user_id");