import { relations } from "drizzle-orm";
import { colleges, followers, followees, posts, programs, users } from ".";

export const usersRelations = relations(users, ({ one, many }) => ({
  posts: many(posts),
  followers: many(followers),
  followees: many(followees),
}));

export const followersRelations = relations(followers, ({ one, many }) => ({
  follower: one(users, {
    fields: [followers.follower_id],
    references: [users.id],
  }),

  followee: one(followees, {
    fields: [followers.followee_id],
    references: [followees.id],
  }),
}));

export const followeesRelations = relations(followees, ({ one, many }) => ({
  followee: one(users, {
    fields: [followees.followee_id],
    references: [users.id],
  }),

  follower: one(followers, {
    fields: [followees.follower_id],
    references: [followers.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.user_id],
    references: [users.id],
  }),
}));

export const collegesRelations = relations(colleges, ({ one, many }) => ({
  // organizations: many(organizations),
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
  college: one(colleges, {
    fields: [programs.college_id],
    references: [colleges.id],
  }),
}));
