import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay, map, shareReplay } from 'rxjs/operators';
import { Account, Vehicle } from './vehicle.model';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);

  private vehicles$ = this.http
    .get<Vehicle[]>('/dataset/vehicles.json')
    .pipe(shareReplay(1));

  getAllVehicles(): Observable<Vehicle[]> {
    return this.vehicles$.pipe(delay(300));
  }

  getVehicles(page = 1, pageSize = 20): Observable<Page<Vehicle>> {
    return this.vehicles$.pipe(
      map((all) => {
        const total = all.length;
        const totalPages = Math.ceil(total / pageSize);
        const items = all.slice((page - 1) * pageSize, page * pageSize);
        return { items, total, page, pageSize, totalPages };
      }),
      delay(300)
    );
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>('/dataset/accounts.json');
  }
}
