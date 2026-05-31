import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, shareReplay } from 'rxjs/operators';
import { Account } from './vehicle.model';

@Injectable({ providedIn: 'root' })
export class AccountSearchService {
  private http = inject(HttpClient);

  private accounts$ = this.http
    .get<Account[]>('/dataset/accounts.json')
    .pipe(shareReplay(1));

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
