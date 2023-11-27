import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
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
export const NOTIFICATION_TYPE = [
  "like",
  "comment",
  "follow",
  "mention_post",
  "mention_comment",
] as const;

interface File {
  name: string;
  key: string;
  size: number;
  url: string;
}

const id = varchar("id", { length: 256 })
  .primaryKey()
  .notNull()
  .$defaultFn(() => nanoid());
const created_at = timestamp("created_at")
  .default(sql`CURRENT_TIMESTAMP`)
  .notNull();
const updated_at = timestamp("updated_at")
  .default(sql`CURRENT_TIMESTAMP`)
  .onUpdateNow()
  .notNull();
const deleted_at = timestamp("deleted_at");
// const slug = varchar("slug", { length: 256 }).unique().notNull();

export const deleted_users = mysqlTable(
  "deleted_user",
  {
    id: varchar("id", { length: 256 }).primaryKey().unique().notNull(),

    created_at,
  },
  (deleted_user) => ({
    deleted_users_idIdx: index("deleted_user_id_idx").on(deleted_user.id),
    deleted_users_idUniqueIdx: unique("deleted_user_id_unique_idx").on(
      deleted_user.id,
    ),
  }),
);

export const users = mysqlTable(
  "user",
  {
    id,
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    // image: varchar("image", { length: 255 }),
    image: varchar("image", { length: 255 }).$type<string | File>(),

    created_at,
    bio: longtext("bio"),
    link: text("link"),
    username: varchar("username", { length: 256 }).unique(),
    type: mysqlEnum("type", ACCOUNT_TYPE),
    program_id: varchar("program_id", { length: 256 }),
    verified_at: timestamp("verified_at"),
  },
  (user) => ({
    users_idIdx: index("user_id_idx").on(user.id),
    users_idUniqueIdx: unique("user_id_unique_idx").on(user.id),
    users_emailIdx: index("user_email_idx").on(user.email),
    users_usernameIdx: index("user_username_idx").on(user.username),
    users_programIdIdx: index("user_program_id_idx").on(user.program_id),
  }),
);

export const likes = mysqlTable(
  "like",
  {
    id,
    user_id: varchar("user_id", { length: 256 }).notNull(),
    post_id: varchar("post_id", { length: 256 }).notNull(),

    created_at,
  },
  (like) => ({
    likes_idIdx: index("like_id_idx").on(like.id),
    likes_idUniqueIdx: unique("like_id_unique_idx").on(like.id),
    likes_userIdIdx: index("like_user_id_idx").on(like.user_id),
    likes_postIdIdx: index("like_post_id_idx").on(like.post_id),
  }),
);
export const comments = mysqlTable(
  "comment",
  {
    id,
    user_id: varchar("user_id", { length: 256 }).notNull(),
    post_id: varchar("post_id", { length: 256 }).notNull(),
    content: longtext("content").notNull(),
    thread_id: varchar("thread_id", { length: 256 }),

    created_at,
    updated_at,
    deleted_at,
  },
  (comment) => ({
    comments_idIdx: index("comment_id_idx").on(comment.id),
    comments_idUniqueIdx: unique("comment_id_unique_idx").on(comment.id),
    comments_userIdIdx: index("comment_user_id_idx").on(comment.user_id),
    comments_postIdIdx: index("comment_post_id_idx").on(comment.post_id),
    comments_threadIdIdx: index("comment_thread_id_idx").on(comment.thread_id),
  }),
);

export const followers = mysqlTable(
  "follower",
  {
    id,
    follower_id: varchar("follower_id", { length: 256 }).notNull(),
    followee_id: varchar("followee_id", { length: 256 }).notNull(),

    created_at,
  },
  (follower) => ({
    followers_idIdx: index("follower_id_idx").on(follower.id),
    followers_idUniqueIdx: unique("follower_id_unique_idx").on(follower.id),
    followers_followerIdIdx: index("follower_follower_id_idx").on(
      follower.follower_id,
    ),
    followers_followeeIdIdx: index("follower_followee_id_idx").on(
      follower.followee_id,
    ),
  }),
);
export const followees = mysqlTable(
  "followee",
  {
    id,
    followee_id: varchar("followee_id", { length: 256 }).notNull(),
    follower_id: varchar("follower_id", { length: 256 }).notNull(),

    created_at,
  },
  (followee) => ({
    followees_idIdx: index("followee_id_idx").on(followee.id),
    followees_idUniqueIdx: unique("followee_id_unique_idx").on(followee.id),
    followees_followeeIdIdx: index("followee_followee_id_idx").on(
      followee.followee_id,
    ),
    followees_followerIdIdx: index("followee_follower_id_idx").on(
      followee.follower_id,
    ),
  }),
);
export const posts = mysqlTable(
  "post",
  {
    id,
    user_id: varchar("user_id", { length: 256 }).notNull(),
    content: longtext("content").notNull(),
    type: mysqlEnum("type", POST_TYPE).default("following").notNull(),

    created_at,
    updated_at,
    deleted_at,
  },
  (post) => ({
    posts_idIdx: index("post_id_idx").on(post.id),
    posts_idUniqueIdx: unique("post_id_unique_idx").on(post.id),
    posts_userIdIdx: index("post_user_id_idx").on(post.user_id),
    posts_typeIdx: index("post_type_idx").on(post.type),
    posts_deletedAtIdx: index("post_deleted_at_idx").on(post.deleted_at),
  }),
);
export const campuses = mysqlTable(
  "campus",
  {
    id,
    name: text("name").notNull(),
    slug: varchar("slug", { length: 256 }).notNull(),

    created_at,
    updated_at,
    deleted_at,
  },
  (campus) => ({
    campuses_idIdx: index("campus_id_idx").on(campus.id),
    campuses_idUniqueIdx: unique("campus_id_unique_idx").on(campus.id),
    campuses_slugIdx: index("campus_slug_idx").on(campus.slug),
    campuses_deletedAtIdx: index("campus_deleted_at_idx").on(campus.deleted_at),
  }),
);
export const colleges = mysqlTable(
  "college",
  {
    id,
    name: text("name").notNull(),
    slug: varchar("slug", { length: 256 }).notNull(),
    campus_id: varchar("campus_id", { length: 256 }).notNull(),

    created_at,
    updated_at,
    deleted_at,
  },
  (college) => ({
    colleges_idIdx: index("college_id_idx").on(college.id),
    colleges_idUniqueIdx: unique("college_id_unique_idx").on(college.id),
    colleges_slugIdx: index("college_slug_idx").on(college.slug),
    colleges_campusIdIdx: index("college_campus_id_idx").on(college.campus_id),
    colleges_deletedAtIdx: index("college_deleted_at_idx").on(
      college.deleted_at,
    ),
  }),
);
export const programs = mysqlTable(
  "program",
  {
    id,
    name: text("name").notNull(),
    slug: varchar("slug", { length: 256 }).notNull(),

    college_id: varchar("college_id", { length: 256 }).notNull(),

    created_at,
    updated_at,
    deleted_at,
  },
  (program) => ({
    programs_idIdx: index("program_id_idx").on(program.id),
    programs_idUniqueIdx: unique("program_id_unique_idx").on(program.id),
    programs_slugIdx: index("program_slug_idx").on(program.slug),
    programs_collegeIdIdx: index("program_college_id_idx").on(
      program.college_id,
    ),
    programs_deletedAtIdx: index("program_deleted_at_idx").on(
      program.deleted_at,
    ),
  }),
);

export const notifications = mysqlTable(
  "notification",
  {
    id,
    from_id: varchar("from_id", { length: 256 }).notNull(),
    to_id: varchar("to_id", { length: 256 }).notNull(),
    content_id: varchar("content_id", { length: 256 }),
    read: boolean("read").notNull().default(false),
    type: mysqlEnum("type", NOTIFICATION_TYPE).notNull(),
    trash: boolean("trash").notNull().default(false),

    created_at,
  },
  (notification) => ({
    notifications_idIdx: index("notification_id_idx").on(notification.id),
    notifications_idUniqueIdx: unique("notification_id_unique_idx").on(
      notification.id,
    ),
    notifications_fromIdIdx: index("notification_from_id_idx").on(
      notification.from_id,
    ),
    notifications_toIdIdx: index("notification_to_id_idx").on(
      notification.to_id,
    ),
    notifications_contentIdIdx: index("notification_content_id_idx").on(
      notification.content_id,
    ),
    notifications_typeIdx: index("notification_type_idx").on(notification.type),
    notifications_trashIdx: index("notification_trash_idx").on(
      notification.trash,
    ),
  }),
);

export const reported_users = mysqlTable(
  "reported_user",
  {
    id,
    user_id: varchar("user_id", { length: 256 }).notNull(),
    reported_by_id: varchar("reported_by_id", { length: 256 }).notNull(),
    reason: text("reason").notNull(),

    created_at,
  },
  (reported_user) => ({
    reported_users_idIdx: index("reported_user_id_idx").on(reported_user.id),
    reported_users_idUniqueIdx: unique("reported_user_id_unique_idx").on(
      reported_user.id,
    ),
    reported_users_userIdIdx: index("reported_user_user_id_idx").on(
      reported_user.user_id,
    ),
    reported_users_reportedByIdIdx: index(
      "reported_user_reported_by_id_idx",
    ).on(reported_user.reported_by_id),
  }),
);

export const reported_posts = mysqlTable(
  "reported_post",
  {
    id,
    post_id: varchar("post_id", { length: 256 }).notNull(),
    reported_by_id: varchar("reported_by_id", { length: 256 }).notNull(),
    reason: text("reason").notNull(),

    created_at,
  },
  (reported_post) => ({
    reported_posts_idIdx: index("reported_post_id_idx").on(reported_post.id),
    reported_posts_idUniqueIdx: unique("reported_post_id_unique_idx").on(
      reported_post.id,
    ),
    reported_posts_postIdIdx: index("reported_post_post_id_idx").on(
      reported_post.post_id,
    ),
    reported_posts_reportedByIdIdx: index(
      "reported_post_reported_by_id_idx",
    ).on(reported_post.reported_by_id),
  }),
);

export const reported_comments = mysqlTable(
  "reported_comment",
  {
    id,
    comment_id: varchar("comment_id", { length: 256 }).notNull(),
    reported_by_id: varchar("reported_by_id", { length: 256 }).notNull(),
    reason: text("reason").notNull(),

    created_at,
  },
  (reported_comment) => ({
    reported_comments_idIdx: index("reported_comment_id_idx").on(
      reported_comment.id,
    ),
    reported_comments_idUniqueIdx: unique("reported_comment_id_unique_idx").on(
      reported_comment.id,
    ),
    reported_comments_commentIdIdx: index("reported_comment_comment_id_idx").on(
      reported_comment.comment_id,
    ),
    reported_comments_reportedByIdIdx: index(
      "reported_comment_reported_by_id_idx",
    ).on(reported_comment.reported_by_id),
  }),
);

export const reported_problems = mysqlTable(
  "reported_problem",
  {
    id,
    problem: text("problem").notNull(),
    reported_by_id: varchar("reported_by_id", { length: 256 }).notNull(),

    created_at,
  },
  (reported_problem) => ({
    reported_problems_idIdx: index("reported_problem_id_idx").on(
      reported_problem.id,
    ),
    reported_problems_idUniqueIdx: unique("reported_problem_id_unique_idx").on(
      reported_problem.id,
    ),
    reported_problems_reportedByIdIdx: index(
      "reported_problem_reported_by_id_idx",
    ).on(reported_problem.reported_by_id),
  }),
);

export const suggested_features = mysqlTable(
  "suggested_feature",
  {
    id,
    feature: text("feature").notNull(),
    suggested_by_id: varchar("suggested_by_id", { length: 256 }).notNull(),

    created_at,
  },
  (suggested_feature) => ({
    suggested_features_idIdx: index("suggested_feature_id_idx").on(
      suggested_feature.id,
    ),
    suggested_features_idUniqueIdx: unique(
      "suggested_feature_id_unique_idx",
    ).on(suggested_feature.id),
    suggested_features_suggestedByIdIdx: index(
      "suggested_feature_suggested_by_id_idx",
    ).on(suggested_feature.suggested_by_id),
  }),
);

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
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
