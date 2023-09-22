import { reported_comments } from "./schema";
import { relations } from "drizzle-orm";
import {
  colleges,
  followers,
  followees,
  posts,
  programs,
  users,
  likes,
  comments,
  campuses,
  notifications,
  reported_users,
  reported_posts,
} from ".";

export const usersRelations = relations(users, ({ one, many }) => ({
  program: one(programs, {
    fields: [users.program_id],
    references: [programs.id],
  }),
  posts: many(posts),
  followers: many(followers),
  followees: many(followees),
}));
export const likesRelations = relations(likes, ({ one, many }) => ({
  user: one(users, {
    fields: [likes.user_id],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.post_id],
    references: [posts.id],
  }),
}));
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.user_id],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.post_id],
    references: [posts.id],
  }),

  thread: one(comments, {
    fields: [comments.thread_id],
    references: [comments.id],
  }),
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
  likes: many(likes),
  comments: many(comments),
}));

export const campusesRelations = relations(campuses, ({ one, many }) => ({}));
export const collegesRelations = relations(colleges, ({ one, many }) => ({
  campus: one(campuses, {
    fields: [colleges.campus_id],
    references: [campuses.id],
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
  college: one(colleges, {
    fields: [programs.college_id],
    references: [colleges.id],
  }),
}));

export const notificationsRelations = relations(
  notifications,
  ({ one, many }) => ({
    from: one(users, {
      fields: [notifications.from_id],
      references: [users.id],
    }),
    to: one(users, {
      fields: [notifications.to_id],
      references: [users.id],
    }),
  }),
);

export const reported_usersRelations = relations(
  reported_users,
  ({ one, many }) => ({
    user: one(users, {
      fields: [reported_users.user_id],
      references: [users.id],
    }),
    reported_by: one(users, {
      fields: [reported_users.reported_by_id],
      references: [users.id],
    }),
  }),
);

export const reported_postsRelations = relations(
  reported_posts,
  ({ one, many }) => ({
    post: one(posts, {
      fields: [reported_posts.post_id],
      references: [posts.id],
    }),
    reported_by: one(users, {
      fields: [reported_posts.reported_by_id],
      references: [users.id],
    }),
  }),
);

export const reported_commentsRelations = relations(
  reported_comments,
  ({ one, many }) => ({
    comment: one(comments, {
      fields: [reported_comments.comment_id],
      references: [comments.id],
    }),
    reported_by: one(users, {
      fields: [reported_comments.reported_by_id],
      references: [users.id],
    }),
  }),
);
