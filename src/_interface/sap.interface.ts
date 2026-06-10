export interface SAP {
  id: string;
  project_no: string;
  group: string | null;
  transaction_type: string | null;
  doc_entry: number | null;
  doc_num: number | null;
  doc_date: Date | null;
  line_number: number | null;
  line_status: string | null;
  project_header: string | null;
  project_detail: string | null;
  item_code: string | null;
  item_description: string | null;
  dimension: string | null;
  quantity: number | null;
  warehouse: string | null;
  line_remarks: string | null;
  doc_remarks: string | null;
  cost_centre: string | null;
}

export interface KBN {
  id: string;
  project_no: string;
  data_type: string;
  doc_status: string;
  canceled: string;
  aju_number: string;
  transaction_type: string;
  group: string;
  doc_entry: number;
  doc_num: number;
  doc_date: string;
  line_number: number;
  line_status: string;
  project_header: string;
  project_detail: string;
  item_code: string;
  item_description: string;
  dimension: string;
  quantity: number;
  warehouse: string;
  line_remarks: string | null;
  doc_remarks: string;
  cost_centre: string;
}
