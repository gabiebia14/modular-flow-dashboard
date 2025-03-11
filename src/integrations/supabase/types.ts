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
      agents: {
        Row: {
          active: boolean | null
          agent_id: string
          created_at: string | null
          description: string | null
          id: string
          model: string
          name: string
          prompt: string
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          agent_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          model: string
          name: string
          prompt: string
          type: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          agent_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          model?: string
          name?: string
          prompt?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          active: boolean | null
          api_key: string
          created_at: string | null
          endpoint: string | null
          id: string
          model_type: string | null
          model_version: string | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          api_key: string
          created_at?: string | null
          endpoint?: string | null
          id?: string
          model_type?: string | null
          model_version?: string | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          api_key?: string
          created_at?: string | null
          endpoint?: string | null
          id?: string
          model_type?: string | null
          model_version?: string | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          base_price: number | null
          category: string
          created_at: string | null
          description: string | null
          dimensions: string | null
          id: string
          name: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          base_price?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          name: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          base_price?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          name?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_category: string
          product_dimensions: string | null
          product_id: string | null
          product_name: string
          quantity: number
          quote_id: string | null
          total_price: number | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_category: string
          product_dimensions?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          quote_id?: string | null
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_category?: string
          product_dimensions?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          quote_id?: string | null
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_date: string | null
          delivery_state: string | null
          delivery_zipcode: string | null
          id: string
          manager_id: string | null
          notes: string | null
          payment_method: string | null
          status: string
          total_value: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_date?: string | null
          delivery_state?: string | null
          delivery_zipcode?: string | null
          id?: string
          manager_id?: string | null
          notes?: string | null
          payment_method?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_date?: string | null
          delivery_state?: string | null
          delivery_zipcode?: string | null
          id?: string
          manager_id?: string | null
          notes?: string | null
          payment_method?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      users_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
