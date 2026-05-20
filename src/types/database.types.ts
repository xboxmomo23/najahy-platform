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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          context_chapter_id: string | null
          created_at: string | null
          id: string
          language: Database["public"]["Enums"]["language_pref"] | null
          message_count: number | null
          title: string | null
          total_tokens_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_chapter_id?: string | null
          created_at?: string | null
          id?: string
          language?: Database["public"]["Enums"]["language_pref"] | null
          message_count?: number | null
          title?: string | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_chapter_id?: string | null
          created_at?: string | null
          id?: string
          language?: Database["public"]["Enums"]["language_pref"] | null
          message_count?: number | null
          title?: string | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_context_chapter_id_fkey"
            columns: ["context_chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_daily_usage: {
        Row: {
          id: string
          questions_count: number | null
          tokens_used: number | null
          usage_date: string
          user_id: string
        }
        Insert: {
          id?: string
          questions_count?: number | null
          tokens_used?: number | null
          usage_date?: string
          user_id: string
        }
        Update: {
          id?: string
          questions_count?: number | null
          tokens_used?: number | null
          usage_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_daily_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          bac_frequency: number | null
          content: string | null
          created_at: string | null
          description: string | null
          difficulty: number | null
          display_order: number | null
          estimated_duration_minutes: number | null
          fiche_content: string | null
          id: string
          is_free: boolean | null
          is_published: boolean | null
          slug: string
          subject_id: string
          title: string
          unit_price_dzd: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          bac_frequency?: number | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          display_order?: number | null
          estimated_duration_minutes?: number | null
          fiche_content?: string | null
          id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          slug: string
          subject_id: string
          title: string
          unit_price_dzd?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          bac_frequency?: number | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: number | null
          display_order?: number | null
          estimated_duration_minutes?: number | null
          fiche_content?: string | null
          id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          slug?: string
          subject_id?: string
          title?: string
          unit_price_dzd?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      competencies: {
        Row: {
          chapter_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          subject_id: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          subject_id: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competencies_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competencies_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      device_sessions: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          device_id: string
          device_label: string | null
          id: string
          ip_address: string | null
          last_active_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_id: string
          device_label?: string | null
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_id?: string
          device_label?: string | null
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          chapter_id: string
          competency_tags: string[] | null
          correct_answer: string
          created_at: string | null
          difficulty: number | null
          display_order: number | null
          estimated_time_seconds: number | null
          explanation: string | null
          id: string
          options: Json | null
          question: string
          type: string
        }
        Insert: {
          chapter_id: string
          competency_tags?: string[] | null
          correct_answer: string
          created_at?: string | null
          difficulty?: number | null
          display_order?: number | null
          estimated_time_seconds?: number | null
          explanation?: string | null
          id?: string
          options?: Json | null
          question: string
          type: string
        }
        Update: {
          chapter_id?: string
          competency_tags?: string[] | null
          correct_answer?: string
          created_at?: string | null
          difficulty?: number | null
          display_order?: number | null
          estimated_time_seconds?: number | null
          explanation?: string | null
          id?: string
          options?: Json | null
          question?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      modules_purchased: {
        Row: {
          chapter_id: string
          expires_at: string
          id: string
          price_paid_dzd: number
          purchased_at: string | null
          student_id: string
          transaction_id: string | null
        }
        Insert: {
          chapter_id: string
          expires_at: string
          id?: string
          price_paid_dzd: number
          purchased_at?: string | null
          student_id: string
          transaction_id?: string | null
        }
        Update: {
          chapter_id?: string
          expires_at?: string
          id?: string
          price_paid_dzd?: number
          purchased_at?: string | null
          student_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_purchased_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modules_purchased_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modules_purchased_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_child_links: {
        Row: {
          child_id: string
          confirmed_at: string | null
          confirmed_by_child: boolean | null
          created_at: string | null
          id: string
          parent_id: string
          relation: string | null
          validated_minor: boolean | null
        }
        Insert: {
          child_id: string
          confirmed_at?: string | null
          confirmed_by_child?: boolean | null
          created_at?: string | null
          id?: string
          parent_id: string
          relation?: string | null
          validated_minor?: boolean | null
        }
        Update: {
          child_id?: string
          confirmed_at?: string | null
          confirmed_by_child?: boolean | null
          created_at?: string | null
          id?: string
          parent_id?: string
          relation?: string | null
          validated_minor?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_child_links_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_child_links_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          children_count: number | null
          created_at: string | null
          user_id: string
        }
        Insert: {
          children_count?: number | null
          created_at?: string | null
          user_id: string
        }
        Update: {
          children_count?: number | null
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          daily_room_name: string | null
          daily_room_url: string | null
          duration_minutes: number
          ended_at: string | null
          id: string
          payment_released_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          price_paid_dzd: number
          rating: number | null
          review_aspects: string[] | null
          review_text: string | null
          reviewed_at: string | null
          scheduled_at: string
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"] | null
          student_id: string
          student_message: string | null
          subject_id: string | null
          teacher_id: string
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          daily_room_name?: string | null
          daily_room_url?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          payment_released_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          price_paid_dzd: number
          rating?: number | null
          review_aspects?: string[] | null
          review_text?: string | null
          reviewed_at?: string | null
          scheduled_at: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          student_id: string
          student_message?: string | null
          subject_id?: string | null
          teacher_id: string
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          daily_room_name?: string | null
          daily_room_url?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          payment_released_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          price_paid_dzd?: number
          rating?: number | null
          review_aspects?: string[] | null
          review_text?: string | null
          reviewed_at?: string | null
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          student_id?: string
          student_message?: string | null
          subject_id?: string | null
          teacher_id?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_competency_mastery: {
        Row: {
          ai_assistance_count: number | null
          attempts_count: number | null
          competency_id: string
          id: string
          last_updated_at: string | null
          mastery_percentage: number | null
          student_id: string
          successes_count: number | null
        }
        Insert: {
          ai_assistance_count?: number | null
          attempts_count?: number | null
          competency_id: string
          id?: string
          last_updated_at?: string | null
          mastery_percentage?: number | null
          student_id: string
          successes_count?: number | null
        }
        Update: {
          ai_assistance_count?: number | null
          attempts_count?: number | null
          competency_id?: string
          id?: string
          last_updated_at?: string | null
          mastery_percentage?: number | null
          student_id?: string
          successes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_competency_mastery_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_competency_mastery_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          chapter_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          last_activity_at: string | null
          progress_percentage: number | null
          quiz_best_score: number | null
          status: Database["public"]["Enums"]["chapter_status"] | null
          student_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          chapter_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          progress_percentage?: number | null
          quiz_best_score?: number | null
          status?: Database["public"]["Enums"]["chapter_status"] | null
          student_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          chapter_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          progress_percentage?: number | null
          quiz_best_score?: number | null
          status?: Database["public"]["Enums"]["chapter_status"] | null
          student_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          birthdate: string | null
          created_at: string | null
          current_predicted_score: number | null
          diagnostic_completed: boolean | null
          diagnostic_completed_at: string | null
          diagnostic_results: Json | null
          filiere: Database["public"]["Enums"]["filiere"]
          hours_per_week: number | null
          level: string | null
          parent_code: string
          target_score: number | null
          user_id: string
        }
        Insert: {
          birthdate?: string | null
          created_at?: string | null
          current_predicted_score?: number | null
          diagnostic_completed?: boolean | null
          diagnostic_completed_at?: string | null
          diagnostic_results?: Json | null
          filiere: Database["public"]["Enums"]["filiere"]
          hours_per_week?: number | null
          level?: string | null
          parent_code: string
          target_score?: number | null
          user_id: string
        }
        Update: {
          birthdate?: string | null
          created_at?: string | null
          current_predicted_score?: number | null
          diagnostic_completed?: boolean | null
          diagnostic_completed_at?: string | null
          diagnostic_results?: Json | null
          filiere?: Database["public"]["Enums"]["filiere"]
          hours_per_week?: number | null
          level?: string | null
          parent_code?: string
          target_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          coefficient: number
          color: string | null
          created_at: string | null
          display_order: number | null
          filiere: Database["public"]["Enums"]["filiere"]
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          coefficient: number
          color?: string | null
          created_at?: string | null
          display_order?: number | null
          filiere: Database["public"]["Enums"]["filiere"]
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          coefficient?: number
          color?: string | null
          created_at?: string | null
          display_order?: number | null
          filiere?: Database["public"]["Enums"]["filiere"]
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_dzd: number | null
          amount_eur: number | null
          auto_renew: boolean | null
          billing_period: string | null
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          payment_provider:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          provider_subscription_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_dzd?: number | null
          amount_eur?: number | null
          auto_renew?: boolean | null
          billing_period?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          provider_subscription_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_dzd?: number | null
          amount_eur?: number | null
          auto_renew?: boolean | null
          billing_period?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          provider_subscription_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_availability: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_recurring: boolean | null
          specific_date: string | null
          start_time: string
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          specific_date?: string | null
          start_time: string
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          specific_date?: string | null
          start_time?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_availability_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          average_rating: number | null
          balance_dzd: number | null
          bio: string | null
          created_at: string | null
          diplomas: Json | null
          hourly_rate_dzd: number
          hourly_rate_eur: number | null
          is_online: boolean | null
          languages_taught: string[] | null
          presentation_video_url: string | null
          subjects: string[] | null
          total_reviews: number | null
          total_sessions_count: number | null
          user_id: string
          verification_notes: string | null
          verification_status:
            | Database["public"]["Enums"]["teacher_verification"]
            | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          average_rating?: number | null
          balance_dzd?: number | null
          bio?: string | null
          created_at?: string | null
          diplomas?: Json | null
          hourly_rate_dzd: number
          hourly_rate_eur?: number | null
          is_online?: boolean | null
          languages_taught?: string[] | null
          presentation_video_url?: string | null
          subjects?: string[] | null
          total_reviews?: number | null
          total_sessions_count?: number | null
          user_id: string
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["teacher_verification"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          average_rating?: number | null
          balance_dzd?: number | null
          bio?: string | null
          created_at?: string | null
          diplomas?: Json | null
          hourly_rate_dzd?: number
          hourly_rate_eur?: number | null
          is_online?: boolean | null
          languages_taught?: string[] | null
          presentation_video_url?: string | null
          subjects?: string[] | null
          total_reviews?: number | null
          total_sessions_count?: number | null
          user_id?: string
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["teacher_verification"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teachers_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_dzd: number | null
          amount_eur: number | null
          created_at: string | null
          currency: string
          id: string
          metadata: Json | null
          payment_provider: Database["public"]["Enums"]["payment_provider"]
          proof_url: string | null
          provider_transaction_id: string | null
          related_module_chapter_id: string | null
          related_session_id: string | null
          related_subscription_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          type: string
          user_id: string
          validated_at: string | null
          validated_by_admin_id: string | null
        }
        Insert: {
          amount_dzd?: number | null
          amount_eur?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          payment_provider: Database["public"]["Enums"]["payment_provider"]
          proof_url?: string | null
          provider_transaction_id?: string | null
          related_module_chapter_id?: string | null
          related_session_id?: string | null
          related_subscription_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          type: string
          user_id: string
          validated_at?: string | null
          validated_by_admin_id?: string | null
        }
        Update: {
          amount_dzd?: number | null
          amount_eur?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          payment_provider?: Database["public"]["Enums"]["payment_provider"]
          proof_url?: string | null
          provider_transaction_id?: string | null
          related_module_chapter_id?: string | null
          related_session_id?: string | null
          related_subscription_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          type?: string
          user_id?: string
          validated_at?: string | null
          validated_by_admin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_related_module_chapter_id_fkey"
            columns: ["related_module_chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_related_session_id_fkey"
            columns: ["related_session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_related_subscription_id_fkey"
            columns: ["related_subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_validated_by_admin_id_fkey"
            columns: ["validated_by_admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          language_preference:
            | Database["public"]["Enums"]["language_pref"]
            | null
          last_login_at: string | null
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          wilaya: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id: string
          language_preference?:
            | Database["public"]["Enums"]["language_pref"]
            | null
          last_login_at?: string | null
          last_name: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          wilaya?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          language_preference?:
            | Database["public"]["Enums"]["language_pref"]
            | null
          last_login_at?: string | null
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          wilaya?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      generate_parent_code: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_student_minor: { Args: { student_user_id: string }; Returns: boolean }
    }
    Enums: {
      chapter_status: "not_started" | "in_progress" | "completed" | "to_review"
      filiere:
        | "sciences_exp"
        | "mathematiques"
        | "techniques_math"
        | "gestion_eco"
        | "lettres_philo"
        | "langues"
      language_pref: "fr" | "ar" | "darija"
      payment_provider: "chargily" | "stripe" | "manual_transfer"
      payment_status: "pending" | "paid" | "released" | "refunded" | "failed"
      session_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      subscription_plan: "free" | "standard" | "premium"
      subscription_status: "active" | "cancelled" | "expired" | "pending"
      teacher_verification: "pending" | "verified" | "rejected" | "suspended"
      user_role: "student" | "parent" | "teacher" | "admin"
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
      chapter_status: ["not_started", "in_progress", "completed", "to_review"],
      filiere: [
        "sciences_exp",
        "mathematiques",
        "techniques_math",
        "gestion_eco",
        "lettres_philo",
        "langues",
      ],
      language_pref: ["fr", "ar", "darija"],
      payment_provider: ["chargily", "stripe", "manual_transfer"],
      payment_status: ["pending", "paid", "released", "refunded", "failed"],
      session_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      subscription_plan: ["free", "standard", "premium"],
      subscription_status: ["active", "cancelled", "expired", "pending"],
      teacher_verification: ["pending", "verified", "rejected", "suspended"],
      user_role: ["student", "parent", "teacher", "admin"],
    },
  },
} as const
