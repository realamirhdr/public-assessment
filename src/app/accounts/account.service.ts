import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Account } from './account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  private accounts$ = this.http
    .get<Account[]>('/dataset/accounts.json')
    .pipe(shareReplay(1));

  getAll(): Observable<Account[]> {
    return this.accounts$;
  }

  search(query: string): Observable<Account[]> {
    if (!query.trim()) return of([]);
    const q = query.toLowerCase();
    return this.accounts$.pipe(
      map((accounts) =>
        accounts
          .filter((a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
          .slice(0, 8)
      )
    );
  }
}
