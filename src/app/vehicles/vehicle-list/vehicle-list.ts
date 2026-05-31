import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { VehicleService } from '../vehicle.service';
import { VehicleStatus, VehicleViewModel, vehicleStatusLabel } from '../vehicle.model';

type StatusFilter = VehicleStatus | 'all';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.scss',
})
export class VehicleList implements OnInit {
  private vehicleService = inject(VehicleService);

  readonly vehicles = signal<VehicleViewModel[]>([]);
  readonly query = signal('');
  readonly selectedStatus = signal<StatusFilter>('all');

  readonly statuses: StatusFilter[] = ['all', 'active', 'parked', 'in_maintenance', 'decommissioned'];

  readonly statusLabel: Record<StatusFilter, string> = { all: 'All', ...vehicleStatusLabel };

  ngOnInit(): void {
    forkJoin({
      vehicles: this.vehicleService.getVehicles(),
      accounts: this.vehicleService.getAccounts(),
    }).subscribe(({ vehicles, accounts }) => {
      const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
      this.vehicles.set(
        vehicles.map(({ account_id, device_id, ...rest }) => ({
          ...rest,
          accountName: accountMap.get(account_id) ?? account_id,
        }))
      );
    });
  }

  getFilteredVehicles(): VehicleViewModel[] {
    const q = this.query();
    const status = this.selectedStatus();
    return this.vehicles().filter((v) => {
      const matchesPlate = q === '' || v.plate.includes(q);
      const matchesStatus = status === 'all' || v.status === status;
      return matchesPlate && matchesStatus;
    });
  }
}
