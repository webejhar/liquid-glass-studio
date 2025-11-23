export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          reference_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          reference_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          reference_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_category: string
          product_description: string
          product_id: number
          product_name: string
          product_price: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_category: string
          product_description: string
          product_id: number
          product_name: string
          product_price: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_category?: string
          product_description?: string
          product_id?: number
          product_name?: string
          product_price?: number
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          admin_notes: string | null
          behance_url: string | null
          category: string | null
          created_at: string | null
          email: string
          id: string
          is_freelancer: boolean | null
          linkedin_url: string | null
          message: string
          name: string
          phone: string | null
          service: string | null
          status: string | null
          subject: string | null
          website_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          behance_url?: string | null
          category?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_freelancer?: boolean | null
          linkedin_url?: string | null
          message: string
          name: string
          phone?: string | null
          service?: string | null
          status?: string | null
          subject?: string | null
          website_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          behance_url?: string | null
          category?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_freelancer?: boolean | null
          linkedin_url?: string | null
          message?: string
          name?: string
          phone?: string | null
          service?: string | null
          status?: string | null
          subject?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      domain_orders: {
        Row: {
          buyer_email: string
          buyer_name: string | null
          created_at: string
          domain_name: string
          id: string
          payment_method: string
          payment_reference: string
          price: number | null
          status: string
          tld: string
          user_id: string | null
        }
        Insert: {
          buyer_email: string
          buyer_name?: string | null
          created_at?: string
          domain_name: string
          id?: string
          payment_method: string
          payment_reference: string
          price?: number | null
          status?: string
          tld: string
          user_id?: string | null
        }
        Update: {
          buyer_email?: string
          buyer_name?: string | null
          created_at?: string
          domain_name?: string
          id?: string
          payment_method?: string
          payment_reference?: string
          price?: number | null
          status?: string
          tld?: string
          user_id?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          product_category: string
          product_description: string
          product_id: number
          product_name: string
          product_price: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_category: string
          product_description: string
          product_id: number
          product_name: string
          product_price: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_category?: string
          product_description?: string
          product_id?: number
          product_name?: string
          product_price?: number
          user_id?: string
        }
        Relationships: []
      }
      meeting_bookings: {
        Row: {
          created_at: string
          email: string
          id: string
          meeting_date: string
          meeting_time: string
          name: string
          notes: string | null
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          meeting_date: string
          meeting_time: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          meeting_date?: string
          meeting_time?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      product_orders: {
        Row: {
          buyer_email: string
          buyer_name: string | null
          created_at: string
          id: string
          order_id: string | null
          payment_method: string
          payment_reference: string
          product_category: string
          product_id: number
          product_name: string
          product_price: number
          status: string
          user_id: string | null
        }
        Insert: {
          buyer_email: string
          buyer_name?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          payment_method: string
          payment_reference: string
          product_category: string
          product_id: number
          product_name: string
          product_price: number
          status?: string
          user_id?: string | null
        }
        Update: {
          buyer_email?: string
          buyer_name?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          payment_method?: string
          payment_reference?: string
          product_category?: string
          product_id?: number
          product_name?: string
          product_price?: number
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          face_verification_url: string | null
          id: string
          name: string | null
          nid_url: string | null
          phone: string | null
          profession: string | null
          updated_at: string | null
          user_id: string
          verification_notes: string | null
          verification_status: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          face_verification_url?: string | null
          id?: string
          name?: string | null
          nid_url?: string | null
          phone?: string | null
          profession?: string | null
          updated_at?: string | null
          user_id: string
          verification_notes?: string | null
          verification_status?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          face_verification_url?: string | null
          id?: string
          name?: string | null
          nid_url?: string | null
          phone?: string | null
          profession?: string | null
          updated_at?: string | null
          user_id?: string
          verification_notes?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_notification: {
        Args: {
          p_message: string
          p_reference_id?: string
          p_title: string
          p_type: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
