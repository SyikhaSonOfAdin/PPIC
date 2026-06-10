export interface StandartResponse<Data = any> {
  success: boolean;
  message: string;
  error?: string;
  data?: Data;
}
