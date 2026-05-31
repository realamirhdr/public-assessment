import { Component, computed, inject, signal } from '@angular/core';
import { AccountDetailModal } from '../account-detail-modal/account-detail-modal';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AccountService, AccountPage } from '../account.service';
import { Account, AccountFilters, AccountIndustry, AccountTier, accountIndustryLabel, accountTierLabel } from '../account.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [FormsModule, AccountDetailModal],
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss',
})
export class AccountList {
  private accountService = inject(AccountService);

  readonly pageResult = signal<AccountPage | null>(null);
  readonly currentPage = signal(1);
  readonly pageSize = 20;

  readonly selectedIndustry = signal<AccountIndustry | ''>('');
  readonly selectedTier = signal<AccountTier | ''>('');
  readonly nameInputValue = signal('');
  readonly nameQuery = signal('');
  readonly nameResults = signal<Account[]>([]);
  readonly showNameResults = signal(false);
  readonly selectedAccount = signal<Account | null>(null);

  private nameSearch$ = new Subject<string>();

  readonly industries: AccountIndustry[] = [
    'logistics', 'delivery', 'waste_mgmt', 'construction', 'field_service', 'rideshare', 'agriculture',
  ];
  readonly tiers: AccountTier[] = ['free', 'pro', 'enterprise'];
  readonly industryLabel = accountIndustryLabel;
  readonly tierLabel = accountTierLabel;

  readonly hasActiveFilters = computed(() =>
    this.nameQuery() !== '' || this.selectedIndustry() !== '' || this.selectedTier() !== ''
  );

  readonly totalPages = computed(() => this.pageResult()?.totalPages ?? 1);
  readonly accounts = computed(() => this.pageResult()?.items ?? []);
  readonly total = computed(() => this.pageResult()?.total ?? 0);

  private readonly serviceParams = computed(() => ({
    filters: {
      name: this.nameQuery() || undefined,
      industry: this.selectedIndustry() || undefined,
      tier: this.selectedTier() || undefined,
    } satisfies AccountFilters,
    page: this.currentPage(),
  }));

  constructor() {
    toObservable(this.serviceParams)
      .pipe(
        switchMap(({ filters, page }) => this.accountService.getAccounts(filters, page, this.pageSize)),
        takeUntilDestroyed()
      )
      .subscribe((result) => this.pageResult.set(result));

    this.nameSearch$
      .pipe(
        debounceTime(150),
        switchMap((q) => this.accountService.search(q)),
        takeUntilDestroyed()
      )
      .subscribe((results) => this.nameResults.set(results));
  }

  onNameInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.nameInputValue.set(q);
    if (!q) this.nameQuery.set('');
    this.showNameResults.set(true);
    this.nameSearch$.next(q);
  }

  selectName(account: Account): void {
    this.nameInputValue.set(account.name);
    this.nameQuery.set(account.name);
    this.currentPage.set(1);
    this.showNameResults.set(false);
    this.nameResults.set([]);
  }

  clearName(): void {
    this.nameInputValue.set('');
    this.nameQuery.set('');
    this.nameResults.set([]);
    this.showNameResults.set(false);
    this.currentPage.set(1);
  }

  setIndustry(v: string): void { this.selectedIndustry.set(v as AccountIndustry | ''); this.currentPage.set(1); }
  setTier(v: string): void { this.selectedTier.set(v as AccountTier | ''); this.currentPage.set(1); }

  clearAll(): void {
    this.clearName();
    this.selectedIndustry.set('');
    this.selectedTier.set('');
  }

  loadPage(page: number): void { this.currentPage.set(page); }
  prevPage(): void { if (this.currentPage() > 1) this.currentPage.set(this.currentPage() - 1); }
  nextPage(): void { if (this.currentPage() < this.totalPages()) this.currentPage.set(this.currentPage() + 1); }

  getPageNumbers(): (number | null)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | null)[] = [1];
    if (current > 3) pages.push(null);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push(null);
    pages.push(total);
    return pages;
  }
}
