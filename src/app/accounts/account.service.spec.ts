import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { lastValueFrom } from 'rxjs';
import { AccountService } from './account.service';
import { Account } from './account.model';

const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc_001', name: 'Acme Logistics', industry: 'logistics', tier: 'pro', contact_name: 'Jane Doe', contact_email: 'jane@acme.com', address: '1 Main St', created_at: '2024-01-01T00:00:00Z' },
  { id: 'acc_002', name: 'Beta Delivery', industry: 'delivery', tier: 'free', contact_name: 'John Smith', contact_email: 'john@beta.com', address: '2 Oak Ave', created_at: '2024-02-01T00:00:00Z' },
  { id: 'acc_003', name: 'Gamma Construction', industry: 'construction', tier: 'enterprise', contact_name: 'Alice Lee', contact_email: 'alice@gamma.com', address: '3 Pine Rd', created_at: '2024-03-01T00:00:00Z' },
  { id: 'acc_004', name: 'Delta Logistics', industry: 'logistics', tier: 'pro', contact_name: 'Bob King', contact_email: 'bob@delta.com', address: '4 Elm St', created_at: '2024-04-01T00:00:00Z' },
];

function flush(httpMock: HttpTestingController, data: object) {
  httpMock.expectOne('/dataset/accounts.json').flush(data);
}

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll returns all accounts', async () => {
    const p = lastValueFrom(service.getAll());
    flush(httpMock, MOCK_ACCOUNTS);
    const accounts = await p;
    expect(accounts.length).toBe(4);
  });

  it('getAccounts with no filters returns all accounts', async () => {
    const p = lastValueFrom(service.getAccounts({}));
    flush(httpMock, MOCK_ACCOUNTS);
    const result = await p;
    expect(result.total).toBe(4);
  });

  it('filters by name (case insensitive)', async () => {
    const p = lastValueFrom(service.getAccounts({ name: 'acme' }));
    flush(httpMock, MOCK_ACCOUNTS);
    const result = await p;
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe('acc_001');
  });

  it('filters by industry', async () => {
    const p = lastValueFrom(service.getAccounts({ industry: 'logistics' }));
    flush(httpMock, MOCK_ACCOUNTS);
    const result = await p;
    expect(result.total).toBe(2);
    expect(result.items.every((a: Account) => a.industry === 'logistics')).toBe(true);
  });

  it('filters by tier', async () => {
    const p = lastValueFrom(service.getAccounts({ tier: 'enterprise' }));
    flush(httpMock, MOCK_ACCOUNTS);
    const result = await p;
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe('acc_003');
  });

  it('combines multiple filters', async () => {
    const p = lastValueFrom(service.getAccounts({ industry: 'logistics', tier: 'pro' }));
    flush(httpMock, MOCK_ACCOUNTS);
    const result = await p;
    expect(result.total).toBe(2);
  });

  it('paginates correctly', async () => {
    const p = lastValueFrom(service.getAccounts({}, 1, 2));
    flush(httpMock, MOCK_ACCOUNTS);
    const result = await p;
    expect(result.items.length).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.total).toBe(4);
  });

  it('returns correct second page', async () => {
    const p = lastValueFrom(service.getAccounts({}, 2, 3));
    flush(httpMock, MOCK_ACCOUNTS);
    const result = await p;
    expect(result.items.length).toBe(1);
    expect(result.items[0].id).toBe('acc_004');
  });

  it('search returns accounts matching name', async () => {
    const p = lastValueFrom(service.search('acme'));
    flush(httpMock, MOCK_ACCOUNTS);
    const results = await p;
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Acme Logistics');
  });

  it('search returns accounts matching ID', async () => {
    const p = lastValueFrom(service.search('acc_002'));
    flush(httpMock, MOCK_ACCOUNTS);
    const results = await p;
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('acc_002');
  });

  it('search returns empty array for blank query without hitting the network', async () => {
    const results = await lastValueFrom(service.search(''));
    expect(results.length).toBe(0);
    httpMock.expectNone('/dataset/accounts.json');
  });

  it('search limits results to 8', async () => {
    const manyAccounts: Account[] = Array.from({ length: 12 }, (_, i) => ({
      ...MOCK_ACCOUNTS[0], id: `acc_${i}`, name: `Acme ${i}`,
    }));
    const p = lastValueFrom(service.search('acme'));
    flush(httpMock, manyAccounts);
    const results = await p;
    expect(results.length).toBe(8);
  });
});
