import { Component, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { VehicleService } from '../vehicle.service';
import { AccountSearchService } from '../account-search.service';
import { VehicleMap } from '../vehicle-map/vehicle-map';
import { Account, Vehicle, VehicleStatus, vehicleStatusLabel, vehicleStatusTooltip } from '../vehicle.model';

type StatusFilter = VehicleStatus | 'all';
type SortColumn = 'plate' | 'vehicle' | 'year' | 'status' | 'account' | 'lastSeen';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [FormsModule, DatePipe, VehicleMap],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.scss',
})
export class VehicleList implements OnInit, OnDestroy {
  private vehicleService = inject(VehicleService);
  private accountSearchService = inject(AccountSearchService);

  readonly page = input(1);
  readonly pageSize = input(20);

  readonly view = signal<'table' | 'map'>('table');
  readonly currentPage = signal(1);
  readonly allRawVehicles = signal<Vehicle[]>([]);
  readonly accountMap = signal<Map<string, string>>(new Map());
  readonly query = signal('');
  readonly queryName = signal('');
  readonly selectedStatus = signal<StatusFilter>('all');
  readonly selectedYear = signal<number | ''>('');
  readonly selectedAccountId = signal('');
  readonly accountInputValue = signal('');
  readonly accountResults = signal<Account[]>([]);
  readonly showAccountResults = signal(false);
  readonly sortColumn = signal<SortColumn | null>(null);
  readonly sortDirection = signal<SortDirection>('asc');

  private accountSearch$ = new Subject<string>();

  readonly availableYears = computed(() =>
    [...new Set(this.allRawVehicles().map((v) => v.year))].sort((a, b) => b - a)
  );

  readonly statuses: StatusFilter[] = ['all', 'active', 'parked', 'in_maintenance', 'decommissioned'];
  readonly statusLabel: Record<StatusFilter, string> = { all: 'All', ...vehicleStatusLabel };
  readonly statusTooltip = vehicleStatusTooltip;

  readonly hasActiveFilters = computed(() =>
    this.query() !== '' ||
    this.queryName() !== '' ||
    this.selectedStatus() !== 'all' ||
    this.selectedYear() !== '' ||
    this.selectedAccountId() !== ''
  );

  readonly filteredVehicles = computed(() => {
    const q = this.query().toLowerCase();
    const qName = this.queryName().toLowerCase();
    const status = this.selectedStatus();
    const year = this.selectedYear();
    const map = this.accountMap();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    const results = this.allRawVehicles()
      .filter((v) => !this.selectedAccountId() || v.account_id === this.selectedAccountId())
      .map(({ account_id, device_id, ...rest }) => ({
        ...rest,
        accountName: map.get(account_id) ?? account_id,
      }))
      .filter((v) => {
        const matchesPlate = q === '' || v.plate.toLowerCase().includes(q);
        const matchesName = qName === '' || `${v.make} ${v.model}`.toLowerCase().includes(qName);
        const matchesStatus = status === 'all' || v.status === status;
        const matchesYear = year === '' || v.year === year;
        return matchesPlate && matchesName && matchesStatus && matchesYear;
      });

    if (!col) return results;

    const getValue = (v: typeof results[0]): string | number => {
      switch (col) {
        case 'plate':    return v.plate;
        case 'vehicle':  return `${v.make} ${v.model}`;
        case 'year':     return v.year;
        case 'status':   return v.status;
        case 'account':  return v.accountName;
        case 'lastSeen': return v.last_known_location?.recorded_at ?? '';
      }
    };

    return [...results].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      const aEmpty = av === '';
      const bEmpty = bv === '';
      if (aEmpty && !bEmpty) return 1;
      if (!aEmpty && bEmpty) return -1;
      if (aEmpty && bEmpty) return 0;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === 'asc' ? cmp : -cmp;
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
      this.allRawVehicles.set(vehicles);
      this.accountMap.set(new Map(accounts.map((a) => [a.id, a.name])));
    });

    this.accountSearch$
      .pipe(
        debounceTime(150),
        switchMap((q) => this.accountSearchService.search(q))
      )
      .subscribe((results) => this.accountResults.set(results));
  }

  ngOnDestroy(): void {
    this.accountSearch$.complete();
  }

  onAccountInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.accountInputValue.set(q);
    this.selectedAccountId.set('');
    this.currentPage.set(1);
    this.showAccountResults.set(true);
    this.accountSearch$.next(q);
  }

  selectAccount(account: Account): void {
    this.selectedAccountId.set(account.id);
    this.accountInputValue.set(account.name);
    this.showAccountResults.set(false);
    this.accountResults.set([]);
    this.currentPage.set(1);
  }

  clearAccount(): void {
    this.selectedAccountId.set('');
    this.accountInputValue.set('');
    this.accountResults.set([]);
    this.showAccountResults.set(false);
    this.currentPage.set(1);
  }

  clearAll(): void {
    this.query.set('');
    this.queryName.set('');
    this.selectedStatus.set('all');
    this.selectedYear.set('');
    this.clearAccount();
  }

  toggleSort(col: SortColumn): void {
    if (this.sortColumn() !== col) {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    } else if (this.sortDirection() === 'asc') {
      this.sortDirection.set('desc');
    } else {
      this.sortColumn.set(null);
    }
    this.currentPage.set(1);
  }

  setQuery(q: string): void {
    this.query.set(q);
    this.currentPage.set(1);
  }

  setQueryName(q: string): void {
    this.queryName.set(q);
    this.currentPage.set(1);
  }

  setYear(y: string): void {
    this.selectedYear.set(y === '' ? '' : +y);
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
