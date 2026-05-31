import { Component, effect, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Account, accountIndustryLabel, accountTierLabel } from '../account.model';
import { UserService } from '../../users/user.service';
import { ExportService } from '../../exports/export.service';
import { UserWithPermission } from '../../users/user.model';
import { FleetExport } from '../../exports/export.model';

type ModalTab = 'general' | 'users' | 'exports';

@Component({
  selector: 'app-account-detail-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './account-detail-modal.html',
  styleUrl: './account-detail-modal.scss',
})
export class AccountDetailModal {
  private userService = inject(UserService);
  private exportService = inject(ExportService);

  readonly account = input.required<Account>();
  readonly closed = output();

  readonly activeTab = signal<ModalTab>('general');
  readonly users = signal<UserWithPermission[]>([]);
  readonly exports = signal<FleetExport[]>([]);
  readonly dataLoaded = signal(false);

  readonly industryLabel = accountIndustryLabel;
  readonly tierLabel = accountTierLabel;

  constructor() {
    effect(() => {
      if ((this.activeTab() === 'users' || this.activeTab() === 'exports') && !this.dataLoaded()) {
        forkJoin({
          users: this.userService.getByAccountId(this.account().id),
          exports: this.exportService.getByAccountId(this.account().id),
        }).subscribe(({ users, exports }) => {
          this.users.set(users);
          this.exports.set(exports);
          this.dataLoaded.set(true);
        });
      }
    });
  }
}
