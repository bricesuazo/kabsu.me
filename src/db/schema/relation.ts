import { relations } from "drizzle-orm";
import {
  colleges,
  departments,
  followers,
  followings,
  posts,
  programs,
  users,
} from ".";

export const usersRelations = relations(users, ({ one, many }) => ({
  posts: many(posts),
  followers: many(followers),
  followings: many(followings),
}));

export const followersRelations = relations(followers, ({ one, many }) => ({
  user: one(users, {
    fields: [followers.user_id],
    references: [users.id],
  }),
}));

export const followingsRelations = relations(followings, ({ one, many }) => ({
  user: one(users, {
    fields: [followings.user_id],
    references: [users.id],
  }),
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
