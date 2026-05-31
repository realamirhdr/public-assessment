import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { FleetExport } from './export.model';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private http = inject(HttpClient);

  private exports$ = this.http.get<FleetExport[]>('/dataset/exports.json').pipe(shareReplay(1));

  getByAccountId(accountId: string): Observable<FleetExport[]> {
    return this.exports$.pipe(
      map((exports) => exports.filter((e) => e.account_id === accountId))
    );
  }
}
