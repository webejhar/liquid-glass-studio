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
      activity_logs: {
        Row: {
          action_description: string
          action_type: string
          admin_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          start_date: string | null
          target_audience: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          target_audience?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          target_audience?: string | null
          title?: string
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
      chat_messages: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean | null
          message: string
          message_type: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message: string
          message_type?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message?: string
          message_type?: string | null
          receiver_id?: string
          sender_id?: string
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
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      login_sessions: {
        Row: {
          browser_name: string | null
          browser_version: string | null
          device_model: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity: string | null
          login_time: string | null
          user_id: string
        }
        Insert: {
          browser_name?: string | null
          browser_version?: string | null
          device_model?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          login_time?: string | null
          user_id: string
        }
        Update: {
          browser_name?: string | null
          browser_version?: string | null
          device_model?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          login_time?: string | null
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
      payment_receipts: {
        Row: {
          admin_fee: number | null
          amount: number
          created_at: string
          currency: string | null
          id: string
          order_id: string | null
          order_type: string | null
          payee_id: string | null
          payer_id: string
          payment_method: string
          payment_reference: string
          payment_type: string | null
          project_id: string | null
          provider_amount: number | null
          receipt_number: string
          status: string | null
        }
        Insert: {
          admin_fee?: number | null
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          order_id?: string | null
          order_type?: string | null
          payee_id?: string | null
          payer_id: string
          payment_method: string
          payment_reference: string
          payment_type?: string | null
          project_id?: string | null
          provider_amount?: number | null
          receipt_number: string
          status?: string | null
        }
        Update: {
          admin_fee?: number | null
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          order_id?: string | null
          order_type?: string | null
          payee_id?: string | null
          payer_id?: string
          payment_method?: string
          payment_reference?: string
          payment_type?: string | null
          project_id?: string | null
          provider_amount?: number | null
          receipt_number?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
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
          plugin_file_path: string | null
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
          plugin_file_path?: string | null
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
          plugin_file_path?: string | null
          product_category?: string
          product_id?: number
          product_name?: string
          product_price?: number
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          bullets: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          faq: Json | null
          file_path: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          price: number
          sale_price: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          bullets?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          faq?: Json | null
          file_path?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          price: number
          sale_price?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bullets?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          faq?: Json | null
          file_path?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          price?: number
          sale_price?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_number: string
          account_type: Database["public"]["Enums"]["account_type"] | null
          address: string | null
          approval_status: string | null
          avatar_url: string | null
          bio: string | null
          category: string | null
          created_at: string | null
          cv_url: string | null
          date_of_birth: string | null
          email: string | null
          face_verification_url: string | null
          id: string
          name: string | null
          nid_url: string | null
          payment_policy_accepted: boolean | null
          phone: string | null
          profession: string | null
          skills: string[] | null
          social_media_links: Json | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
          verification_notes: string | null
          verification_status: string | null
        }
        Insert: {
          account_number?: string
          account_type?: Database["public"]["Enums"]["account_type"] | null
          address?: string | null
          approval_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string | null
          cv_url?: string | null
          date_of_birth?: string | null
          email?: string | null
          face_verification_url?: string | null
          id?: string
          name?: string | null
          nid_url?: string | null
          payment_policy_accepted?: boolean | null
          phone?: string | null
          profession?: string | null
          skills?: string[] | null
          social_media_links?: Json | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          verification_notes?: string | null
          verification_status?: string | null
        }
        Update: {
          account_number?: string
          account_type?: Database["public"]["Enums"]["account_type"] | null
          address?: string | null
          approval_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string | null
          cv_url?: string | null
          date_of_birth?: string | null
          email?: string | null
          face_verification_url?: string | null
          id?: string
          name?: string | null
          nid_url?: string | null
          payment_policy_accepted?: boolean | null
          phone?: string | null
          profession?: string | null
          skills?: string[] | null
          social_media_links?: Json | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          verification_notes?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      project_messages: {
        Row: {
          created_at: string | null
          file_type: string | null
          file_url: string | null
          id: string
          message: string | null
          project_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message?: string | null
          project_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          message?: string | null
          project_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean | null
          project_id: string
          rating: number
          review_text: string | null
          review_type: string
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          project_id: string
          rating: number
          review_text?: string | null
          review_type: string
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          project_id?: string
          rating?: number
          review_text?: string | null
          review_type?: string
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          admin_approved: boolean | null
          advance_paid: boolean | null
          advance_payment_document: string | null
          advance_payment_method: string | null
          advance_payment_reference: string | null
          advance_percentage: number
          budget_type: string
          client_id: string
          client_name: string
          client_type: string
          created_at: string | null
          delivery_time_unit: string
          delivery_time_value: number
          final_budget: number | null
          final_paid: boolean | null
          final_payment_document: string | null
          final_payment_method: string | null
          final_payment_reference: string | null
          final_percentage: number
          id: string
          project_details: string
          project_title: string
          provider_id: string
          provider_payment_id: string | null
          provider_payment_method: string | null
          provider_payment_requested: boolean | null
          provider_payment_status: string | null
          status: string
          submission_files: string[] | null
          updated_at: string | null
        }
        Insert: {
          admin_approved?: boolean | null
          advance_paid?: boolean | null
          advance_payment_document?: string | null
          advance_payment_method?: string | null
          advance_payment_reference?: string | null
          advance_percentage: number
          budget_type: string
          client_id: string
          client_name: string
          client_type: string
          created_at?: string | null
          delivery_time_unit: string
          delivery_time_value: number
          final_budget?: number | null
          final_paid?: boolean | null
          final_payment_document?: string | null
          final_payment_method?: string | null
          final_payment_reference?: string | null
          final_percentage: number
          id?: string
          project_details: string
          project_title: string
          provider_id: string
          provider_payment_id?: string | null
          provider_payment_method?: string | null
          provider_payment_requested?: boolean | null
          provider_payment_status?: string | null
          status?: string
          submission_files?: string[] | null
          updated_at?: string | null
        }
        Update: {
          admin_approved?: boolean | null
          advance_paid?: boolean | null
          advance_payment_document?: string | null
          advance_payment_method?: string | null
          advance_payment_reference?: string | null
          advance_percentage?: number
          budget_type?: string
          client_id?: string
          client_name?: string
          client_type?: string
          created_at?: string | null
          delivery_time_unit?: string
          delivery_time_value?: number
          final_budget?: number | null
          final_paid?: boolean | null
          final_payment_document?: string | null
          final_payment_method?: string | null
          final_payment_reference?: string | null
          final_percentage?: number
          id?: string
          project_details?: string
          project_title?: string
          provider_id?: string
          provider_payment_id?: string | null
          provider_payment_method?: string | null
          provider_payment_requested?: boolean | null
          provider_payment_status?: string | null
          status?: string
          submission_files?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          available_hours_per_week: number | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          minimum_project_size: string | null
          preferred_project_duration: string | null
          provider_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          available_hours_per_week?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          minimum_project_size?: string | null
          preferred_project_duration?: string | null
          provider_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          available_hours_per_week?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          minimum_project_size?: string | null
          preferred_project_duration?: string | null
          provider_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      provider_portfolios: {
        Row: {
          budget_range: string | null
          bullets: string[] | null
          category: string | null
          client_name: string | null
          completion_date: string | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          duration: string | null
          faq: Json | null
          github_url: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          live_url: string | null
          project_url: string | null
          provider_id: string
          tags: string[] | null
          technologies_used: string[] | null
          testimonial: string | null
          title: string
        }
        Insert: {
          budget_range?: string | null
          bullets?: string[] | null
          category?: string | null
          client_name?: string | null
          completion_date?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          duration?: string | null
          faq?: Json | null
          github_url?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          live_url?: string | null
          project_url?: string | null
          provider_id: string
          tags?: string[] | null
          technologies_used?: string[] | null
          testimonial?: string | null
          title: string
        }
        Update: {
          budget_range?: string | null
          bullets?: string[] | null
          category?: string | null
          client_name?: string | null
          completion_date?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          duration?: string | null
          faq?: Json | null
          github_url?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          live_url?: string | null
          project_url?: string | null
          provider_id?: string
          tags?: string[] | null
          technologies_used?: string[] | null
          testimonial?: string | null
          title?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          rewards_earned: number | null
          user_id: string
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          rewards_earned?: number | null
          user_id: string
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          rewards_earned?: number | null
          user_id?: string
          uses_count?: number | null
        }
        Relationships: []
      }
      referral_uses: {
        Row: {
          created_at: string
          id: string
          is_rewarded: boolean | null
          referral_code_id: string
          referred_user_id: string
          reward_amount: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_rewarded?: boolean | null
          referral_code_id: string
          referred_user_id: string
          reward_amount?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_rewarded?: boolean | null
          referral_code_id?: string
          referred_user_id?: string
          reward_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_uses_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      report_content: {
        Row: {
          admin_notes: string | null
          content_id: string | null
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string | null
          reporter_id: string
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          content_id?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id?: string | null
          reporter_id: string
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          content_id?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
          status?: string | null
        }
        Relationships: []
      }
      saved_providers: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          is_admin: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean | null
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          description: string
          id: string
          priority: string | null
          resolution_notes: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      temp_images: {
        Row: {
          bucket_name: string
          created_at: string
          expires_at: string
          file_path: string
          id: string
          user_id: string | null
        }
        Insert: {
          bucket_name?: string
          created_at?: string
          expires_at?: string
          file_path: string
          id?: string
          user_id?: string | null
        }
        Update: {
          bucket_name?: string
          created_at?: string
          expires_at?: string
          file_path?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          reference_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          created_at: string | null
          id: string
          payment_method: string
          payment_reference: string
          product_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_method: string
          payment_reference: string
          product_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_method?: string
          payment_reference?: string
          product_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      create_user_notification: {
        Args: {
          p_message: string
          p_reference_id?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      generate_account_number: {
        Args: { acc_type: Database["public"]["Enums"]["account_type"] }
        Returns: string
      }
      generate_receipt_number: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "general" | "service_provider" | "client"
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
      account_type: ["general", "service_provider", "client"],
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
