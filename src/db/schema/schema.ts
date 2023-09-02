import { relations } from "drizzle-orm";
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
const created_at = timestamp("created_at").defaultNow().notNull();
const updated_at = timestamp("updated_at").defaultNow().onUpdateNow().notNull();
const deleted_at = timestamp("deleted_at");

export const deleted_users = mysqlTable("deleted_users", {
  id: varchar("id", { length: 256 }).primaryKey().unique().notNull(),
  user_number: int("user_number").notNull().default(0),
  username: text("username").notNull(),

  created_at,
});
export const users = mysqlTable("users", {
  id: varchar("id", { length: 256 }).primaryKey().unique().notNull(),
  user_number: int("user_number").notNull().default(0),
  username: varchar("username", { length: 256 }).unique().notNull(),

  created_at,
});
export const posts = mysqlTable("posts", {
  id,
  user_id: varchar("user_id", { length: 256 }).notNull(),
  post: longtext("post").notNull(),

  created_at,
  updated_at,
  deleted_at,
});

export const usersRelations = relations(users, ({ one, many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.user_id],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
