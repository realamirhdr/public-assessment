export type ExportStatus = 'queued' | 'running' | 'completed' | 'failed' | 'stuck';

export interface FleetExport {
  id: string;
  account_id: string;
  requested_by: string;
  requested_at: string;
  status: ExportStatus;
  row_count: number | null;
  error: string | null;
}
