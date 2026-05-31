import { Routes } from '@angular/router';
import { VehicleList } from './vehicles/vehicle-list/vehicle-list';
import { AccountList } from './accounts/account-list/account-list';

export const routes: Routes = [
  { path: '', redirectTo: 'vehicles', pathMatch: 'full' },
  { path: 'vehicles', component: VehicleList },
  { path: 'accounts', component: AccountList },
];
