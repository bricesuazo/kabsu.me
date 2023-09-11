import {
  mysqlTable,
  varchar,
  longtext,
  timestamp,
  int,
  text,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";

export const ACCOUNT_TYPE = ["student", "faculty", "alumni"] as const;
export const POST_TYPE = [
  "following",
  "program",
  "college",
  "campus",
  "all",
] as const;

const id = varchar("id", { length: 256 })
  .primaryKey()
  .notNull()
  .unique()
  .$defaultFn(() => nanoid());
const created_at = timestamp("created_at").notNull().defaultNow();
const updated_at = timestamp("updated_at").notNull().defaultNow().onUpdateNow();
const deleted_at = timestamp("deleted_at");
const slug = varchar("slug", { length: 256 }).unique().notNull();

export const deleted_users = mysqlTable("deleted_users", {
  id: varchar("id", { length: 256 }).primaryKey().unique().notNull(),
  user_number: int("user_number").notNull().default(0),

  created_at,
});
export const users = mysqlTable("users", {
  id: varchar("id", { length: 256 }).primaryKey().unique().notNull(),
  user_number: int("user_number").notNull().default(0),

  program_id: varchar("program_id", { length: 256 }).notNull(),
  bio: longtext("bio"),
  type: mysqlEnum("type", ACCOUNT_TYPE).notNull(),

  created_at,
});
export const likes = mysqlTable("likes", {
  id,
  user_id: varchar("user_id", { length: 256 }).notNull(),
  post_id: varchar("post_id", { length: 256 }).notNull(),

  created_at,
});
export const comments = mysqlTable("comments", {
  id,
  user_id: varchar("user_id", { length: 256 }).notNull(),
  post_id: varchar("post_id", { length: 256 }).notNull(),
  content: longtext("content").notNull(),
  thread_id: varchar("thread_id", { length: 256 }),

  created_at,
  updated_at,
  deleted_at,
});

export const followers = mysqlTable("followers", {
  id,
  follower_id: varchar("follower_id", { length: 256 }).notNull(),
  followee_id: varchar("followee_id", { length: 256 }).notNull(),

  created_at,
});
export const followees = mysqlTable("followees", {
  id,
  followee_id: varchar("followee_id", { length: 256 }).notNull(),
  follower_id: varchar("follower_id", { length: 256 }).notNull(),

  created_at,
});
export const posts = mysqlTable("posts", {
  id,
  user_id: varchar("user_id", { length: 256 }).notNull(),
  content: longtext("content").notNull(),
  type: mysqlEnum("type", POST_TYPE).default("following").notNull(),

  created_at,
  updated_at,
  deleted_at,
});
export const campuses = mysqlTable("campuses", {
  id,
  name: text("name").notNull(),
  slug,

  created_at,
  updated_at,
  deleted_at,
});
export const colleges = mysqlTable("colleges", {
  id,
  name: text("name").notNull(),
  slug,
  campus_id: varchar("campus_id", { length: 256 }).notNull(),

  created_at,
  updated_at,
  deleted_at,
});
export const programs = mysqlTable("programs", {
  id,
  name: text("name").notNull(),
  slug,

  college_id: varchar("college_id", { length: 256 }).notNull(),

  created_at,
  updated_at,
  deleted_at,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type College = typeof colleges.$inferSelect;
export type NewCollege = typeof colleges.$inferInsert;
// export type Organization = typeof organizations.$inferSelect;
// export type NewOrganization = typeof organizations.$inferInsert;
export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;
export type Follower = typeof followers.$inferSelect;
export type NewFollower = typeof followers.$inferInsert;
export type Followee = typeof followees.$inferSelect;
export type NewFollowee = typeof followees.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
export type Campus = typeof campuses.$inferSelect;
export type NewCampus = typeof campuses.$inferInsert;
