import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Account, AccountFilters } from './account.model';

export interface AccountPage {
  items: Account[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  private accounts$ = this.http
    .get<Account[]>('/dataset/accounts.json')
    .pipe(shareReplay(1));

  getAll(): Observable<Account[]> {
    return this.accounts$;
  }

  getAccounts(filters: AccountFilters = {}, page?: number, pageSize?: number): Observable<AccountPage> {
    return this.accounts$.pipe(
      map((all) => {
        const filtered = all.filter((a) => {
          if (filters.name && !a.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
          if (filters.industry && a.industry !== filters.industry) return false;
          if (filters.tier && a.tier !== filters.tier) return false;
          return true;
        });
        const total = filtered.length;
        if (page === undefined || pageSize === undefined) {
          return { items: filtered, total, page: 1, pageSize: total, totalPages: 1 };
        }
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const items = filtered.slice((page - 1) * pageSize, page * pageSize);
        return { items, total, page, pageSize, totalPages };
      })
    );
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
