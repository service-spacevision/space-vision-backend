// src/types/pin.types.ts
export enum PinType {
  MIKROTIK = 'mikrotik',
  OTHER = 'other',
}

export interface Pin {
  id: number;
  type: PinType;
  username: string;
  password: string;
  kitp?: string;
  vessel_id?: number;
  vessel_name?: string;
  generated_by: string;
  created_at: Date;
}

export interface GeneratePinRequest {
  type?: PinType;
  vessel_id?: number;
  vessel_name?: string;
  kitp?: string;
  mikrotik_user_name?: string; // Optional MikroTik username
  number_of_pins_to_generate: number;
}

export interface GetPinsRequest {
  page?: number;
  pageSize?: number;
  type?: PinType;
  vessel_id?: number;
}
