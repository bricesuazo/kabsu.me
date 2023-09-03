import {
  mysqlTable,
  varchar,
  longtext,
  timestamp,
  int,
  text,
} from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";

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

  created_at,
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

  created_at,
  updated_at,
  deleted_at,
});
export const colleges = mysqlTable("colleges", {
  id,
  name: text("name").notNull(),
  slug,

  created_at,
  updated_at,
  deleted_at,
});
export const departments = mysqlTable("departments", {
  id,
  name: text("name").notNull(),
  slug,

  college_id: varchar("college_id", { length: 256 }).notNull(),

  created_at,
  updated_at,
  deleted_at,
});
// export const organizations = mysqlTable("organizations", {
//   id,
//   name: text("name").notNull(),

//   department_id: varchar("department_id", { length: 256 }).notNull(),

//   created_at,
//   updated_at,
//   deleted_at,
// });
export const programs = mysqlTable("programs", {
  id,
  name: text("name").notNull(),
  slug,

  department_id: varchar("department_id", { length: 256 }).notNull(),

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
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
// export type Organization = typeof organizations.$inferSelect;
// export type NewOrganization = typeof organizations.$inferInsert;
export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;
export type Follower = typeof followers.$inferSelect;
export type NewFollower = typeof followers.$inferInsert;
export type Followee = typeof followees.$inferSelect;
export type NewFollowee = typeof followees.$inferInsert;
