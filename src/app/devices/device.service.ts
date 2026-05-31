import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Device } from './device.model';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private http = inject(HttpClient);

  private devices$ = this.http
    .get<Device[]>('/dataset/devices.json')
    .pipe(shareReplay(1));

  getAll(): Observable<Device[]> {
    return this.devices$;
  }

  getByVehicleId(vehicleId: string): Observable<Device | undefined> {
    return this.devices$.pipe(
      map((devices) => devices.find((d) => d.vehicle_id === vehicleId))
    );
  }
}
