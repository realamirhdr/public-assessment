import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { lastValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { User, Permission } from './user.model';

const MOCK_USERS: User[] = [
  { id: 'usr_001', name: 'Alice Admin', email: 'alice@acme.com', account_id: 'acc_001', role: 'admin', last_login_at: '2026-04-30T09:00:00Z' },
  { id: 'usr_002', name: 'Bob Dispatcher', email: 'bob@acme.com', account_id: 'acc_001', role: 'dispatcher', last_login_at: '2026-04-29T08:00:00Z' },
  { id: 'usr_003', name: 'Carol Viewer', email: 'carol@beta.com', account_id: 'acc_002', role: 'viewer', last_login_at: '2026-04-28T07:00:00Z' },
];

const MOCK_PERMISSIONS: Permission[] = [
  { user_id: 'usr_001', account_id: 'acc_001', scope: 'full' },
  { user_id: 'usr_002', account_id: 'acc_001', scope: 'limited' },
  { user_id: 'usr_003', account_id: 'acc_002', scope: 'full' },
];

function flushBoth(httpMock: HttpTestingController, users: User[], permissions: Permission[]) {
  httpMock.expectOne('/dataset/users.json').flush(users);
  httpMock.expectOne('/dataset/permissions.json').flush(permissions);
}

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns users belonging to the given account', async () => {
    const p = lastValueFrom(service.getByAccountId('acc_001'));
    flushBoth(httpMock, MOCK_USERS, MOCK_PERMISSIONS);
    const users = await p;
    expect(users.length).toBe(2);
    expect(users.every(u => u.account_id === 'acc_001')).toBe(true);
  });

  it('joins permission scope correctly for each user', async () => {
    const p = lastValueFrom(service.getByAccountId('acc_001'));
    flushBoth(httpMock, MOCK_USERS, MOCK_PERMISSIONS);
    const users = await p;
    expect(users.find(u => u.id === 'usr_001')!.scope).toBe('full');
    expect(users.find(u => u.id === 'usr_002')!.scope).toBe('limited');
  });

  it('sets scope to null when user has no permission entry for the account', async () => {
    const permissionsWithoutBob: Permission[] = [
      { user_id: 'usr_001', account_id: 'acc_001', scope: 'full' },
    ];
    const p = lastValueFrom(service.getByAccountId('acc_001'));
    flushBoth(httpMock, MOCK_USERS, permissionsWithoutBob);
    const users = await p;
    expect(users.find(u => u.id === 'usr_002')!.scope).toBeNull();
  });

  it('does not return users from other accounts', async () => {
    const p = lastValueFrom(service.getByAccountId('acc_001'));
    flushBoth(httpMock, MOCK_USERS, MOCK_PERMISSIONS);
    const users = await p;
    expect(users.find(u => u.id === 'usr_003')).toBeUndefined();
  });

  it('returns empty array for an account with no users', async () => {
    const p = lastValueFrom(service.getByAccountId('acc_999'));
    flushBoth(httpMock, MOCK_USERS, MOCK_PERMISSIONS);
    const users = await p;
    expect(users.length).toBe(0);
  });
});
