import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Permission, User, UserWithPermission } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  private users$ = this.http.get<User[]>('/dataset/users.json').pipe(shareReplay(1));
  private permissions$ = this.http.get<Permission[]>('/dataset/permissions.json').pipe(shareReplay(1));

  getByAccountId(accountId: string): Observable<UserWithPermission[]> {
    return forkJoin({ users: this.users$, permissions: this.permissions$ }).pipe(
      map(({ users, permissions }) => {
        const scopeMap = new Map(
          permissions
            .filter((p) => p.account_id === accountId)
            .map((p) => [p.user_id, p.scope])
        );
        return users
          .filter((u) => u.account_id === accountId)
          .map((u) => ({ ...u, scope: scopeMap.get(u.id) ?? null }));
      })
    );
  }
}
