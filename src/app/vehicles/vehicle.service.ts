import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Account, Vehicle } from './vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>('/dataset/vehicles.json').pipe(delay(300));
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>('/dataset/accounts.json');
  }
}
