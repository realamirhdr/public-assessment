import { Component, OnInit, inject, input, signal } from '@angular/core';
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

  readonly page = input(1);
  readonly pageSize = input(20);

  readonly currentPage = signal(1);
  readonly totalPages = signal(1);

  readonly vehicles = signal<VehicleViewModel[]>([]);
  readonly query = signal('');
  readonly selectedStatus = signal<StatusFilter>('all');

  readonly statuses: StatusFilter[] = ['all', 'active', 'parked', 'in_maintenance', 'decommissioned'];

  readonly statusLabel: Record<StatusFilter, string> = { all: 'All', ...vehicleStatusLabel };

  ngOnInit(): void {
    this.currentPage.set(this.page());
    this.loadPage(this.currentPage());
  }

  loadPage(page: number): void {
    forkJoin({
      vehicles: this.vehicleService.getVehicles(page, this.pageSize()),
      accounts: this.vehicleService.getAccounts(),
    }).subscribe(({ vehicles, accounts }) => {
      const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
      this.currentPage.set(vehicles.page);
      this.totalPages.set(vehicles.totalPages);
      this.vehicles.set(
        vehicles.items.map(({ account_id, device_id, ...rest }) => ({
          ...rest,
          accountName: accountMap.get(account_id) ?? account_id,
        }))
      );
    });
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.loadPage(this.currentPage() - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.loadPage(this.currentPage() + 1);
  }

  getPageNumbers(): (number | null)[] {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | null)[] = [1];

    if (current > 3) pages.push(null);

    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push(null);

    pages.push(total);

    return pages;
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
