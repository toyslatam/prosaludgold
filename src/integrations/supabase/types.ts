export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          branch: string
          created_at: string
          date: string
          doctor_id: string
          duration: number
          id: string
          patient_id: string
          reason: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          time: string
          updated_at: string
        }
        Insert: {
          branch: string
          created_at?: string
          date: string
          doctor_id: string
          duration?: number
          id?: string
          patient_id: string
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          time: string
          updated_at?: string
        }
        Update: {
          branch?: string
          created_at?: string
          date?: string
          doctor_id?: string
          duration?: number
          id?: string
          patient_id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_entries: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          method: string | null
          patient_id: string | null
          type: Database["public"]["Enums"]["cash_entry_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id?: string
          method?: string | null
          patient_id?: string | null
          type: Database["public"]["Enums"]["cash_entry_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          method?: string | null
          patient_id?: string | null
          type?: Database["public"]["Enums"]["cash_entry_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_config: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          name: string
          ruc: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          country: string
          currency: string
          timezone: string
          language: string
          modules_enabled: string[]
          notify_whatsapp: boolean
          notify_email: boolean
          notify_inventory_alert: boolean
          notify_payment: boolean
          onboarding_complete: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          name?: string
          ruc?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          country?: string
          currency?: string
          timezone?: string
          language?: string
          modules_enabled?: string[]
          notify_whatsapp?: boolean
          notify_email?: boolean
          notify_inventory_alert?: boolean
          notify_payment?: boolean
          onboarding_complete?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          name?: string
          ruc?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          country?: string
          currency?: string
          timezone?: string
          language?: string
          modules_enabled?: string[]
          notify_whatsapp?: boolean
          notify_email?: boolean
          notify_inventory_alert?: boolean
          notify_payment?: boolean
          onboarding_complete?: boolean
        }
        Relationships: []
      }
      doctors: {
        Row: {
          available: boolean
          branch: string
          created_at: string
          id: string
          name: string
          specialty: string
          updated_at: string
          modules_enabled: string[]
          ruc: string | null
          ruc_dv: string | null
          email: string | null
          phone: string | null
          bank_account: string | null
          commission_percentage: number
        }
        Insert: {
          available?: boolean
          branch: string
          created_at?: string
          id?: string
          name: string
          specialty: string
          updated_at?: string
          modules_enabled?: string[]
          ruc?: string | null
          ruc_dv?: string | null
          email?: string | null
          phone?: string | null
          bank_account?: string | null
          commission_percentage?: number
        }
        Update: {
          available?: boolean
          branch?: string
          created_at?: string
          id?: string
          name?: string
          specialty?: string
          updated_at?: string
          modules_enabled?: string[]
          ruc?: string | null
          ruc_dv?: string | null
          email?: string | null
          phone?: string | null
          bank_account?: string | null
          commission_percentage?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          treatment_plan_id: string | null
          buyer_name: string
          buyer_ruc: string | null
          buyer_email: string | null
          items: Json
          subtotal: number
          tax_total: number
          total: number
          currency: string
          status: Database["public"]["Enums"]["invoice_status"]
          provider: string
          external_id: string | null
          cufe: string | null
          pdf_url: string | null
          error_message: string | null
          created_at: string
          issued_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          patient_id: string
          treatment_plan_id?: string | null
          buyer_name: string
          buyer_ruc?: string | null
          buyer_email?: string | null
          items?: Json
          subtotal?: number
          tax_total?: number
          total?: number
          currency?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          provider?: string
          external_id?: string | null
          cufe?: string | null
          pdf_url?: string | null
          error_message?: string | null
          created_at?: string
          issued_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          treatment_plan_id?: string | null
          buyer_name?: string
          buyer_ruc?: string | null
          buyer_email?: string | null
          items?: Json
          subtotal?: number
          tax_total?: number
          total?: number
          currency?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          provider?: string
          external_id?: string | null
          cufe?: string | null
          pdf_url?: string | null
          error_message?: string | null
          created_at?: string
          issued_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          id: string
          min_stock: number
          name: string
          stock: number
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          min_stock?: number
          name: string
          stock?: number
          supplier?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          min_stock?: number
          name?: string
          stock?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_orders: {
        Row: {
          cost: number
          created_at: string
          date: string
          doctor_id: string
          id: string
          lab: string
          patient_id: string
          status: Database["public"]["Enums"]["lab_order_status"]
          updated_at: string
          work: string
        }
        Insert: {
          cost?: number
          created_at?: string
          date: string
          doctor_id: string
          id?: string
          lab: string
          patient_id: string
          status?: Database["public"]["Enums"]["lab_order_status"]
          updated_at?: string
          work: string
        }
        Update: {
          cost?: number
          created_at?: string
          date?: string
          doctor_id?: string
          id?: string
          lab?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["lab_order_status"]
          updated_at?: string
          work?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          balance: number
          birth_date: string | null
          cedula: string | null
          created_at: string
          email: string | null
          id: string
          last_visit: string | null
          name: string
          next_appointment: string | null
          phone: string | null
          updated_at: string
          gender: string | null
          address: string | null
          benefits: string | null
          branch: string | null
          assigned_doctor_id: string | null
          collaborators: string[]
          modules_enabled: string[]
        }
        Insert: {
          balance?: number
          birth_date?: string | null
          cedula?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_visit?: string | null
          name: string
          next_appointment?: string | null
          phone?: string | null
          updated_at?: string
          gender?: string | null
          address?: string | null
          benefits?: string | null
          branch?: string | null
          assigned_doctor_id?: string | null
          collaborators?: string[]
          modules_enabled?: string[]
        }
        Update: {
          balance?: number
          birth_date?: string | null
          cedula?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_visit?: string | null
          name?: string
          next_appointment?: string | null
          phone?: string | null
          updated_at?: string
          gender?: string | null
          address?: string | null
          benefits?: string | null
          branch?: string | null
          assigned_doctor_id?: string | null
          collaborators?: string[]
          modules_enabled?: string[]
        }
        Relationships: []
      }
      treatments: {
        Row: {
          cost: number
          created_at: string
          date: string
          id: string
          name: string
          paid: number
          patient_id: string
          status: Database["public"]["Enums"]["treatment_status"]
          updated_at: string
        }
        Insert: {
          cost?: number
          created_at?: string
          date: string
          id?: string
          name: string
          paid?: number
          patient_id: string
          status?: Database["public"]["Enums"]["treatment_status"]
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          date?: string
          id?: string
          name?: string
          paid?: number
          patient_id?: string
          status?: Database["public"]["Enums"]["treatment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      sedes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          clinic_config_id: string | null
          name: string
          address: string | null
          phone: string | null
          email: string | null
          active: boolean
          modules_enabled: string[]
          schedule: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          clinic_config_id?: string | null
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          active?: boolean
          modules_enabled?: string[]
          schedule?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          clinic_config_id?: string | null
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          active?: boolean
          modules_enabled?: string[]
          schedule?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sedes_clinic_config_id_fkey"
            columns: ["clinic_config_id"]
            isOneToOne: false
            referencedRelation: "clinic_config"
            referencedColumns: ["id"]
          },
        ]
      }
      antecedentes: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          alergias: string
          enfermedades_sistemicas: string
          medicacion_actual: string
          embarazo: string
          habitos_tabaco: string
          habitos_alcohol: string
          observaciones: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          patient_id: string
          alergias?: string
          enfermedades_sistemicas?: string
          medicacion_actual?: string
          embarazo?: string
          habitos_tabaco?: string
          habitos_alcohol?: string
          observaciones?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          alergias?: string
          enfermedades_sistemicas?: string
          medicacion_actual?: string
          embarazo?: string
          habitos_tabaco?: string
          habitos_alcohol?: string
          observaciones?: string
          updated_at?: string
        }
        Relationships: []
      }
      evoluciones: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          date: string
          time: string
          doctor_id: string
          doctor_name: string
          procedure_ids: string[]
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          patient_id: string
          date: string
          time?: string
          doctor_id?: string
          doctor_name?: string
          procedure_ids?: string[]
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          date?: string
          time?: string
          doctor_id?: string
          doctor_name?: string
          procedure_ids?: string[]
          notes?: string
          created_at?: string
        }
        Relationships: []
      }
      recetas: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          date: string
          doctor_id: string
          doctor_name: string
          medicamentos: Json
          indicaciones_generales: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          patient_id: string
          date: string
          doctor_id?: string
          doctor_name?: string
          medicamentos?: Json
          indicaciones_generales?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          date?: string
          doctor_id?: string
          doctor_name?: string
          medicamentos?: Json
          indicaciones_generales?: string
          created_at?: string
        }
        Relationships: []
      }
      consentimientos: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          type: string
          date: string
          signed: boolean
          signed_at: string | null
          signed_by_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          patient_id: string
          type: string
          date: string
          signed?: boolean
          signed_at?: string | null
          signed_by_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          type?: string
          date?: string
          signed?: boolean
          signed_at?: string | null
          signed_by_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      odontogram_records: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          permanent: boolean
          tooth_id: string
          condition: string
          surfaces: string[]
          record_type: string
          condition_kind: string | null
          procedure_id: string | null
          procedure_name: string | null
          doctor_id: string | null
          quantity: number | null
          notes: string | null
          created_at: string
          annulled_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          patient_id: string
          permanent: boolean
          tooth_id: string
          condition: string
          surfaces?: string[]
          record_type?: string
          condition_kind?: string | null
          procedure_id?: string | null
          procedure_name?: string | null
          doctor_id?: string | null
          quantity?: number | null
          notes?: string | null
          created_at?: string
          annulled_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          permanent?: boolean
          tooth_id?: string
          condition?: string
          surfaces?: string[]
          record_type?: string
          condition_kind?: string | null
          procedure_id?: string | null
          procedure_name?: string | null
          doctor_id?: string | null
          quantity?: number | null
          notes?: string | null
          created_at?: string
          annulled_at?: string | null
        }
        Relationships: []
      }
      treatment_plans: {
        Row: {
          id: string
          user_id: string
          patient_id: string
          number: string
          name: string
          professional_id: string
          professional_name: string
          specialty: string | null
          collaborators: string[]
          branch: string | null
          convenio: string | null
          total_budget: number
          discount_percent: number
          realizado: number
          paid: number
          status: string
          last_appointment_date: string | null
          last_appointment_time: string | null
          prestaciones: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          patient_id: string
          number: string
          name: string
          professional_id?: string
          professional_name?: string
          specialty?: string | null
          collaborators?: string[]
          branch?: string | null
          convenio?: string | null
          total_budget?: number
          discount_percent?: number
          realizado?: number
          paid?: number
          status?: string
          last_appointment_date?: string | null
          last_appointment_time?: string | null
          prestaciones?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          number?: string
          name?: string
          professional_id?: string
          professional_name?: string
          specialty?: string | null
          collaborators?: string[]
          branch?: string | null
          convenio?: string | null
          total_budget?: number
          discount_percent?: number
          realizado?: number
          paid?: number
          status?: string
          last_appointment_date?: string | null
          last_appointment_time?: string | null
          prestaciones?: Json
          created_at?: string
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
      appointment_status:
        | "pendiente"
        | "confirmada"
        | "en_sala"
        | "atendida"
        | "no_asistio"
      cash_entry_type: "ingreso" | "egreso"
      invoice_status: "draft" | "pending" | "issued" | "error" | "cancelled"
      lab_order_status: "solicitado" | "en_proceso" | "recibido" | "entregado"
      treatment_status: "pendiente" | "en_curso" | "completado"
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
      appointment_status: [
        "pendiente",
        "confirmada",
        "en_sala",
        "atendida",
        "no_asistio",
      ],
      cash_entry_type: ["ingreso", "egreso"],
      invoice_status: ["draft", "pending", "issued", "error", "cancelled"],
      lab_order_status: ["solicitado", "en_proceso", "recibido", "entregado"],
      treatment_status: ["pendiente", "en_curso", "completado"],
    },
  },
} as const
