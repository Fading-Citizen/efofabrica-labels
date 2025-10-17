export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      labels: {
        Row: {
          id: number
          code: string
          type: string
          batch: string
          created_at: string
          printed: boolean
          printed_at: string | null
          printed_by: string | null
        }
        Insert: {
          id?: number
          code: string
          type: string
          batch: string
          created_at?: string
          printed?: boolean
          printed_at?: string | null
          printed_by?: string | null
        }
        Update: {
          id?: number
          code?: string
          type?: string
          batch?: string
          created_at?: string
          printed?: boolean
          printed_at?: string | null
          printed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labels_batch_fkey"
            columns: ["batch"]
            isOneToOne: false
            referencedRelation: "label_batches"
            referencedColumns: ["id"]
          }
        ]
      }
      label_batches: {
        Row: {
          id: string
          type: string
          quantity: number
          codes: string[]
          created_at: string
          created_by: string | null
          printed: boolean
        }
        Insert: {
          id?: string
          type: string
          quantity: number
          codes: string[]
          created_at?: string
          created_by?: string | null
          printed?: boolean
        }
        Update: {
          id?: string
          type?: string
          quantity?: number
          codes?: string[]
          created_at?: string
          created_by?: string | null
          printed?: boolean
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