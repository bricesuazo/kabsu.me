import { relations } from "drizzle-orm";
import { colleges, departments, follows, posts, programs, users } from ".";

export const usersRelations = relations(users, ({ one, many }) => ({
  posts: many(posts),
  follows: many(follows),
}));

export const followsRelations = relations(follows, ({ one, many }) => ({
  follower: one(users, {
    fields: [follows.follower_id],
    references: [users.id],
  }),
  followee: one(users, {
    fields: [follows.followee_id],
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
