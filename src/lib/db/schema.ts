import { pgTable, uuid, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  ssoSubject: text("sso_subject").unique().notNull(),
  username: text("username").unique().notNull(),
  displayName: text("display_name").notNull(),
  jobTitle: text("job_title").default(""),
  company: text("company").default(process.env.NEXT_PUBLIC_COMPANY_DEFAULT ?? "ASYA"),
  email: text("email").default(""),
  phone: text("phone").default(""),
  bio: text("bio").default(""),
  avatarUrl: text("avatar_url").default(""),
  redirectUrl: text("redirect_url").default(""),
  contactFormEnabled: boolean("contact_form_enabled").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const links = pgTable("links", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: text("icon").default(""),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cardViews = pgTable("card_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  viewerUserId: uuid("viewer_user_id"),
  visitorIp: text("visitor_ip").default(""),
  userAgent: text("user_agent").default(""),
  referer: text("referer").default(""),
  clickedLinkId: uuid("clicked_link_id"),
  filledContactForm: boolean("filled_contact_form").default(false).notNull(),
  downloadedVcard: boolean("downloaded_vcard").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const analyticsDividers = pgTable("analytics_dividers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  eventAt: timestamp("event_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  links: many(links),
  contactSubmissions: many(contactSubmissions),
  cardViews: many(cardViews),
  analyticsDividers: many(analyticsDividers),
}));

export const linksRelations = relations(links, ({ one }) => ({
  user: one(users, { fields: [links.userId], references: [users.id] }),
}));

export const contactSubmissionsRelations = relations(contactSubmissions, ({ one }) => ({
  user: one(users, { fields: [contactSubmissions.userId], references: [users.id] }),
}));

export const cardViewsRelations = relations(cardViews, ({ one }) => ({
  user: one(users, { fields: [cardViews.userId], references: [users.id] }),
  clickedLink: one(links, { fields: [cardViews.clickedLinkId], references: [links.id] }),
}));

export const analyticsDividersRelations = relations(analyticsDividers, ({ one }) => ({
  user: one(users, { fields: [analyticsDividers.userId], references: [users.id] }),
}));