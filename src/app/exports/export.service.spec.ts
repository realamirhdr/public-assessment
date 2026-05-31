import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { lastValueFrom } from 'rxjs';
import { ExportService } from './export.service';
import { FleetExport } from './export.model';

const MOCK_EXPORTS: FleetExport[] = [
  { id: 'exp_001', account_id: 'acc_001', requested_by: 'usr_001', requested_at: '2026-04-28T10:00:00Z', status: 'completed', row_count: 1500, error: null },
  { id: 'exp_002', account_id: 'acc_001', requested_by: 'usr_002', requested_at: '2026-04-29T11:00:00Z', status: 'failed', row_count: null, error: 'Timeout exceeded' },
  { id: 'exp_003', account_id: 'acc_002', requested_by: 'usr_003', requested_at: '2026-04-30T08:00:00Z', status: 'queued', row_count: null, error: null },
  { id: 'exp_004', account_id: 'acc_001', requested_by: 'usr_001', requested_at: '2026-04-30T09:00:00Z', status: 'stuck', row_count: null, error: null },
];

describe('ExportService', () => {
  let service: ExportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ExportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns exports belonging to the given account', async () => {
    const p = lastValueFrom(service.getByAccountId('acc_001'));
    httpMock.expectOne('/dataset/exports.json').flush(MOCK_EXPORTS);
    const exports = await p;
    expect(exports.length).toBe(3);
    expect(exports.every(e => e.account_id === 'acc_001')).toBe(true);
  });

  it('does not return exports from other accounts', async () => {
    const p = lastValueFrom(service.getByAccountId('acc_001'));
    httpMock.expectOne('/dataset/exports.json').flush(MOCK_EXPORTS);
    const exports = await p;
    expect(exports.find(e => e.id === 'exp_003')).toBeUndefined();
  });

  it('covers all export status types for an account', async () => {
    const p = lastValueFrom(service.getByAccountId('acc_001'));
    httpMock.expectOne('/dataset/exports.json').flush(MOCK_EXPORTS);
    const exports = await p;
    const statuses = exports.map(e => e.status);
    expect(statuses).toContain('completed');
    expect(statuses).toContain('failed');
    expect(statuses).toContain('stuck');
  });

  it('preserves null row_count and error message on failed exports', async () => {
    const p = lastValueFrom(service.getByAccountId('acc_001'));
    httpMock.expectOne('/dataset/exports.json').flush(MOCK_EXPORTS);
    const exports = await p;
    const failed = exports.find(e => e.status === 'failed');
    expect(failed!.row_count).toBeNull();
    expect(failed!.error).toBe('Timeout exceeded');
  });

  it('returns empty array for an account with no exports', async () => {
    const p = lastValueFrom(service.getByAccountId('acc_999'));
    httpMock.expectOne('/dataset/exports.json').flush(MOCK_EXPORTS);
    const exports = await p;
    expect(exports.length).toBe(0);
  });
});
