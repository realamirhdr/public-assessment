import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay, map, shareReplay } from 'rxjs/operators';
import { Account, Vehicle, VehicleFilters } from './vehicle.model';

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

  getVehicles(filters: VehicleFilters = {}, page?: number, pageSize?: number): Observable<Page<Vehicle>> {
    return this.vehicles$.pipe(
      map((all) => {
        const filtered = all.filter((v) => {
          if (filters.plate && !v.plate.toLowerCase().includes(filters.plate.toLowerCase())) return false;
          if (filters.name && !`${v.make} ${v.model}`.toLowerCase().includes(filters.name.toLowerCase())) return false;
          if (filters.status && v.status !== filters.status) return false;
          if (filters.year && v.year !== filters.year) return false;
          if (filters.accountId && v.account_id !== filters.accountId) return false;
          if (filters.minLat !== undefined && (!v.last_known_location || v.last_known_location.lat < filters.minLat)) return false;
          if (filters.maxLat !== undefined && (!v.last_known_location || v.last_known_location.lat > filters.maxLat)) return false;
          if (filters.minLng !== undefined && (!v.last_known_location || v.last_known_location.lng < filters.minLng)) return false;
          if (filters.maxLng !== undefined && (!v.last_known_location || v.last_known_location.lng > filters.maxLng)) return false;
          return true;
        });
        const total = filtered.length;
        if (page === undefined || pageSize === undefined) {
          return { items: filtered, total, page: 1, pageSize: total, totalPages: 1 };
        }
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const items = filtered.slice((page - 1) * pageSize, page * pageSize);
        return { items, total, page, pageSize, totalPages };
      }),
      delay(300)
    );
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>('/dataset/accounts.json');
  }




}
