import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { VehicleService } from '../vehicle.service';
import { VehicleStatus, VehicleViewModel, vehicleStatusLabel, vehicleStatusTooltip } from '../vehicle.model';

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
  readonly allVehicles = signal<VehicleViewModel[]>([]);
  readonly query = signal('');
  readonly queryName = signal('');
  readonly selectedStatus = signal<StatusFilter>('all');

  readonly statuses: StatusFilter[] = ['all', 'active', 'parked', 'in_maintenance', 'decommissioned'];
  readonly statusLabel: Record<StatusFilter, string> = { all: 'All', ...vehicleStatusLabel };
  readonly statusTooltip = vehicleStatusTooltip;

  readonly filteredVehicles = computed(() => {
    const q = this.query().toLowerCase();
    const qName = this.queryName().toLowerCase();
    const status = this.selectedStatus();
    return this.allVehicles().filter((v) => {
      const matchesPlate = q === '' || v.plate.toLowerCase().includes(q);
      const matchesName = qName === '' || `${v.make} ${v.model}`.toLowerCase().includes(qName);
      const matchesStatus = status === 'all' || v.status === status;
      return matchesPlate && matchesName && matchesStatus;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredVehicles().length / this.pageSize())));

  readonly vehicles = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    return this.filteredVehicles().slice((page - 1) * size, page * size);
  });

  ngOnInit(): void {
    this.currentPage.set(this.page());
    forkJoin({
      vehicles: this.vehicleService.getAllVehicles(),
      accounts: this.vehicleService.getAccounts(),
    }).subscribe(({ vehicles, accounts }) => {
      const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
      this.allVehicles.set(
        vehicles.map(({ account_id, device_id, ...rest }) => ({
          ...rest,
          accountName: accountMap.get(account_id) ?? account_id,
        }))
      );
    });
  }

  setQuery(q: string): void {
    this.query.set(q);
    this.currentPage.set(1);
  }

  setQueryName(q: string): void {
    this.queryName.set(q);
    this.currentPage.set(1);
  }

  setStatus(s: StatusFilter): void {
    this.selectedStatus.set(s);
    this.currentPage.set(1);
  }

  loadPage(page: number): void {
    this.currentPage.set(page);
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.set(this.currentPage() - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.set(this.currentPage() + 1);
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
}
