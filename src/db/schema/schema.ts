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

export const usersRelations = relations(users, ({ one, many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.user_id],
    references: [users.id],
  }),
}));

export const collegesRelations = relations(colleges, ({ one, many }) => ({
  departments: many(departments),
  // organizations: many(organizations),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  college: one(colleges, {
    fields: [departments.college_id],
    references: [colleges.id],
  }),
}));

// export const organizationsRelations = relations(
//   organizations,
//   ({ one, many }) => ({
//     department: one(departments, {
//       fields: [organizations.department_id],
//       references: [departments.id],
//     }),
//   }),
// );

export const programsRelations = relations(programs, ({ one, many }) => ({
  department: one(departments, {
    fields: [programs.department_id],
    references: [departments.id],
  }),
}));

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
