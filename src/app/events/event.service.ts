import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { FleetEvent } from './event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);

  private events$ = this.http
    .get<FleetEvent[]>('/dataset/events.json')
    .pipe(shareReplay(1));

  getByVehicleId(vehicleId: string): Observable<FleetEvent[]> {
    return this.events$.pipe(
      map((events) => events.filter((e) => e.vehicle_id === vehicleId))
    );
  }
}
