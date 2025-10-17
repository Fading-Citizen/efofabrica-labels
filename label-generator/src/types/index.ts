export interface Label {
  id?: string;
  code: string;
  type: LabelType;
  batch: string;
  created_at?: string;
  printed: boolean;
  printed_at?: string;
  printed_by?: string;
}

export interface LabelBatch {
  id: string;
  type: LabelType;
  quantity: number;
  codes: string[];
  created_at: string;
  created_by?: string;
  printed: boolean;
}

export type LabelType = 
  | 'PatchCord'
  | 'PatchCord RIMPORT'
  | 'PatchCord COENTEL'
  | 'PatchCord Duplex'
  | 'PatchCord Duplex RIMPORT'
  | 'PatchCord Duplex COENTEL'
  | 'Pigtail'
  | 'Pigtail RIMPORT'
  | 'Pigtail COENTEL'
  | 'Bobina';

export interface LabelTypeConfig {
  id: LabelType;
  name: string;
  prefix: string;
  template: string;
  description: string;
}

export interface GenerateLabelRequest {
  type: LabelType;
  quantity: number;
}

export interface GenerateLabelResponse {
  success: boolean;
  batch: LabelBatch;
  labels: Label[];
  error?: string;
}

export interface PrintRequest {
  batchId: string;
  labels: Label[];
}

export interface Database {
  public: {
    Tables: {
      labels: {
        Row: {
          id: string;
          code: string;
          type: LabelType;
          batch: string;
          created_at: string;
          printed: boolean;
          printed_at?: string;
          printed_by?: string;
        };
        Insert: {
          code: string;
          type: LabelType;
          batch: string;
          printed?: boolean;
          printed_at?: string;
          printed_by?: string;
        };
        Update: {
          code?: string;
          type?: LabelType;
          batch?: string;
          printed?: boolean;
          printed_at?: string;
          printed_by?: string;
        };
      };
      label_batches: {
        Row: {
          id: string;
          type: LabelType;
          quantity: number;
          codes: string[];
          created_at: string;
          created_by?: string;
          printed: boolean;
        };
        Insert: {
          id?: string;
          type: LabelType;
          quantity: number;
          codes: string[];
          created_by?: string;
          printed?: boolean;
        };
        Update: {
          type?: LabelType;
          quantity?: number;
          codes?: string[];
          created_by?: string;
          printed?: boolean;
        };
      };
    };
  };
}