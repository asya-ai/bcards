CREATE TABLE "card_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" text NOT NULL,
	"visitor_ip" text DEFAULT '',
	"user_agent" text DEFAULT '',
	"referer" text DEFAULT '',
	"clicked_link_id" uuid,
	"filled_contact_form" boolean DEFAULT false NOT NULL,
	"downloaded_vcard" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card_views" ADD CONSTRAINT "card_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;