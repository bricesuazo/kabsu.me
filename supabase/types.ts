export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      campuses: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      colleges: {
        Row: {
          campus_id: string
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          campus_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          campus_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_colleges_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          post_id: string
          thread_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          post_id: string
          thread_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          post_id?: string
          thread_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      followees: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_followees_followee_id_fkey"
            columns: ["followee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_followees_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_followers_followee_id_fkey"
            columns: ["followee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content_id: string | null
          created_at: string
          from_id: string
          id: string
          read: boolean
          to_id: string
          trash: boolean
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          from_id: string
          id?: string
          read?: boolean
          to_id: string
          trash?: boolean
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          content_id?: string | null
          created_at?: string
          from_id?: string
          id?: string
          read?: boolean
          to_id?: string
          trash?: boolean
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "public_notifications_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_notifications_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          college_id: string
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          college_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          college_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_programs_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_comments: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reason: string
          reported_by_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reason: string
          reported_by_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reason?: string
          reported_by_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_reported_comments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_reported_comments_reported_by_id_fkey"
            columns: ["reported_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          reported_by_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason: string
          reported_by_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          reported_by_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_reported_post_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_reported_post_reported_by_id_fkey"
            columns: ["reported_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_problems: {
        Row: {
          created_at: string
          id: string
          problem: string
          reported_by_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          problem: string
          reported_by_id: string
        }
        Update: {
          created_at?: string
          id?: string
          problem?: string
          reported_by_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_reported_problems_reported_by_id_fkey"
            columns: ["reported_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_users: {
        Row: {
          created_at: string
          id: string
          reason: string
          reported_by_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reported_by_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reported_by_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_reported_users_reported_by_id_fkey"
            columns: ["reported_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_reported_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      suggested_features: {
        Row: {
          created_at: string
          feature: string
          id: string
          suggested_by_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          suggested_by_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          suggested_by_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_suggested_features_suggested_by_id_fkey"
            columns: ["suggested_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          created_at: string
          deactivated_at: string | null
          email: string
          id: string
          image_path: string | null
          link: string | null
          name: string
          program_id: string | null
          type: Database["public"]["Enums"]["user_type"] | null
          username: string
          verified_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          deactivated_at?: string | null
          email: string
          id?: string
          image_path?: string | null
          link?: string | null
          name: string
          program_id?: string | null
          type?: Database["public"]["Enums"]["user_type"] | null
          username: string
          verified_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          deactivated_at?: string | null
          email?: string
          id?: string
          image_path?: string | null
          link?: string | null
          name?: string
          program_id?: string | null
          type?: Database["public"]["Enums"]["user_type"] | null
          username?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      notification_type:
        | "like"
        | "comment"
        | "follow"
        | "mention_post"
        | "mention_comment"
      post_type: "following" | "program" | "college" | "campus" | "all"
      user_type: "student" | "faculty" | "alumni"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

