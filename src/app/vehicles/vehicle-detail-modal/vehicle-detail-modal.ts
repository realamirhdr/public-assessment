import { Component, OnInit, computed, effect, inject, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { VehicleViewModel, vehicleStatusLabel, vehicleStatusTooltip } from '../vehicle.model';
import { AccountService } from '../../accounts/account.service';
import { Account } from '../../accounts/account.model';
import { DeviceService } from '../../devices/device.service';
import { Device } from '../../devices/device.model';
import { EventService } from '../../events/event.service';
import { EventMap } from '../../events/event-map/event-map';
import { FleetEvent, EventType } from '../../events/event.model';

type ModalTab = 'general' | 'events';

export const EVENT_LABELS: Record<EventType, string> = {
  gps_ping: 'GPS Ping',
  harsh_brake: 'Harsh Brake',
  ignition_on: 'Ignition On',
  ignition_off: 'Ignition Off',
  geofence_enter: 'Geofence Enter',
  geofence_exit: 'Geofence Exit',
};

@Component({
  selector: 'app-vehicle-detail-modal',
  standalone: true,
  imports: [DatePipe, DecimalPipe, TitleCasePipe, EventMap],
  templateUrl: './vehicle-detail-modal.html',
  styleUrl: './vehicle-detail-modal.scss',
})
export class VehicleDetailModal implements OnInit {
  private accountService = inject(AccountService);
  private deviceService = inject(DeviceService);
  private eventService = inject(EventService);

  readonly vehicle = input.required<VehicleViewModel>();
  readonly closed = output();

  readonly activeTab = signal<ModalTab>('general');
  readonly account = signal<Account | null>(null);
  readonly currentDevice = signal<Device | null>(null);
  readonly events = signal<FleetEvent[]>([]);
  readonly eventsLoaded = signal(false);
  readonly selectedEvent = signal<FleetEvent | null>(null);
  readonly deviceMap = signal<Map<string, Device>>(new Map());

  readonly sortedEvents = computed(() =>
    [...this.events()].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  );

  readonly eventItems = computed(() => {
    type Header = { kind: 'header'; serial: string };
    type Row = { kind: 'event'; event: FleetEvent };
    const items: (Header | Row)[] = [];
    let lastDeviceId: string | null = null;

    for (const event of this.sortedEvents()) {
      if (event.device_id !== lastDeviceId) {
        items.push({
          kind: 'header',
          serial: this.deviceMap().get(event.device_id)?.serial ?? event.device_id,
        });
        lastDeviceId = event.device_id;
      }
      items.push({ kind: 'event', event });
    }
    return items;
  });

  readonly statusLabel = vehicleStatusLabel;
  readonly statusTooltip = vehicleStatusTooltip;
  readonly eventLabel = EVENT_LABELS;

  ngOnInit(): void {
    forkJoin({
      accounts: this.accountService.getAll(),
      device: this.deviceService.getByVehicleId(this.vehicle().id),
    }).subscribe(({ accounts, device }) => {
      this.account.set(accounts.find((a) => a.name === this.vehicle().accountName) ?? null);
      this.currentDevice.set(device ?? null);
    });
  }

  constructor() {
    effect(() => {
      if (this.activeTab() === 'events' && !this.eventsLoaded()) {
        forkJoin({
          events: this.eventService.getByVehicleId(this.vehicle().id),
          devices: this.deviceService.getAll(),
        }).subscribe(({ events, devices }) => {
          this.events.set(events);
          this.deviceMap.set(new Map(devices.map((d) => [d.id, d])));
          this.eventsLoaded.set(true);
        });
      }
    });
  }
}
