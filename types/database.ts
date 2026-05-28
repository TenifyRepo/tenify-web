export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Tables = {
  landlords: {
    Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          landlord_id: string;
          name: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string | null;
          postal_code: string | null;
          country: string;
          property_type: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          name: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          property_type?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          name?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          property_type?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      units: {
        Row: {
          id: string;
          property_id: string;
          landlord_id: string;
          name: string;
          type: string | null;
          bedrooms: number | null;
          bathrooms: number | null;
          parking_bays: number | null;
          monthly_rent: number | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          landlord_id: string;
          name: string;
          type?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          parking_bays?: number | null;
          monthly_rent?: number | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          landlord_id?: string;
          name?: string;
          type?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          parking_bays?: number | null;
          monthly_rent?: number | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tenants: {
        Row: {
          id: string;
          landlord_id: string;
          unit_id: string | null;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          id_number: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          unit_id?: string | null;
          first_name: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          id_number?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          unit_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          id_number?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leases: {
        Row: {
          id: string;
          landlord_id: string;
          property_id: string;
          unit_id: string;
          tenant_id: string;
          start_date: string;
          end_date: string | null;
          monthly_rent: number;
          deposit_amount: number | null;
          status: string;
          signed_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          property_id: string;
          unit_id: string;
          tenant_id: string;
          start_date: string;
          end_date?: string | null;
          monthly_rent: number;
          deposit_amount?: number | null;
          status?: string;
          signed_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          property_id?: string;
          unit_id?: string;
          tenant_id?: string;
          start_date?: string;
          end_date?: string | null;
          monthly_rent?: number;
          deposit_amount?: number | null;
          status?: string;
          signed_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          landlord_id: string;
          lease_id: string;
          tenant_id: string;
          property_id: string;
          unit_id: string;
          invoice_number: string;
          invoice_date: string;
          due_date: string;
          billing_period_start: string | null;
          billing_period_end: string | null;
          description: string | null;
          subtotal_amount: number;
          total_amount: number;
          amount_paid: number;
          balance_due: number;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          lease_id: string;
          tenant_id: string;
          property_id: string;
          unit_id: string;
          invoice_number: string;
          invoice_date?: string;
          due_date: string;
          billing_period_start?: string | null;
          billing_period_end?: string | null;
          description?: string | null;
          subtotal_amount?: number;
          total_amount?: number;
          amount_paid?: number;
          balance_due?: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          lease_id?: string;
          tenant_id?: string;
          property_id?: string;
          unit_id?: string;
          invoice_number?: string;
          invoice_date?: string;
          due_date?: string;
          billing_period_start?: string | null;
          billing_period_end?: string | null;
          description?: string | null;
          subtotal_amount?: number;
          total_amount?: number;
          amount_paid?: number;
          balance_due?: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          landlord_id: string;
          invoice_id: string;
          tenant_id: string;
          property_id: string;
          unit_id: string;
          payment_date: string;
          amount_paid: number;
          payment_method: string;
          reference_number: string | null;
          notes: string | null;
          pop_file_path: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          invoice_id: string;
          tenant_id: string;
          property_id: string;
          unit_id: string;
          payment_date?: string;
          amount_paid: number;
          payment_method: string;
          reference_number?: string | null;
          notes?: string | null;
          pop_file_path?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          invoice_id?: string;
          tenant_id?: string;
          property_id?: string;
          unit_id?: string;
          payment_date?: string;
          amount_paid?: number;
          payment_method?: string;
          reference_number?: string | null;
          notes?: string | null;
          pop_file_path?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          landlord_id: string;
          entity_type: string;
          entity_id: string;
          title: string;
          description: string | null;
          category: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          uploaded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          landlord_id: string;
          entity_type: string;
          entity_id: string;
          title: string;
          description?: string | null;
          category: string;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          landlord_id?: string;
          entity_type?: string;
          entity_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
};

export type Database = {
  public: {
    Tables: Tables;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type Unit = Database["public"]["Tables"]["units"]["Row"];
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type Lease = Database["public"]["Tables"]["leases"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type PropertyInsert =
  Database["public"]["Tables"]["properties"]["Insert"];
export type PropertyUpdate =
  Database["public"]["Tables"]["properties"]["Update"];
