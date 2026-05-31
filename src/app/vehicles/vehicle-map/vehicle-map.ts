import { Component, AfterViewInit, OnDestroy, ElementRef, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs/operators';
import * as L from 'leaflet';
import { VehicleService } from '../vehicle.service';
import { VehicleFilters, VehicleStatus, VehicleViewModel } from '../vehicle.model';

const STATUS_COLORS: Record<VehicleStatus, string> = {
  active: '#16a34a',
  parked: '#d97706',
  in_maintenance: '#dc2626',
  decommissioned: '#6b7280',
};

@Component({
  selector: 'app-vehicle-map',
  standalone: true,
  templateUrl: './vehicle-map.html',
  styleUrl: './vehicle-map.scss',
})
export class VehicleMap implements AfterViewInit, OnDestroy {
  private vehicleService = inject(VehicleService);

  readonly filters = input<VehicleFilters>({});
  readonly vehicleSelected = output<VehicleViewModel>();

  private mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
  private map: L.Map | null = null;
  private markers = L.layerGroup();
  private mapBounds = signal<L.LatLngBounds | null>(null);
  private accountMap = new Map<string, string>();
  private visibleVehicles = signal<VehicleViewModel[]>([]);

  private readonly fetchParams = computed(() => ({
    filters: this.filters(),
    bounds: this.mapBounds(),
  }));

  constructor() {
    toObservable(this.fetchParams)
      .pipe(
        filter(({ bounds }) => bounds !== null),
        switchMap(({ filters, bounds }) =>
          this.vehicleService.getVehicles({
            ...filters,
            minLat: bounds!.getSouth(),
            maxLat: bounds!.getNorth(),
            minLng: bounds!.getWest(),
            maxLng: bounds!.getEast(),
          })
        ),
        takeUntilDestroyed()
      )
      .subscribe((result) => {
        this.visibleVehicles.set(
          result.items.map(({ account_id, device_id, ...rest }) => ({
            ...rest,
            accountName: this.accountMap.get(account_id) ?? account_id,
          }))
        );
      });

    effect(() => {
      this.drawMarkers(this.visibleVehicles());
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl().nativeElement, {
      center: [43.7417, -79.3733],
      zoom: 6,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.markers.addTo(this.map);

    const updateBounds = () => this.mapBounds.set(this.map!.getBounds());
    this.map.on('moveend', updateBounds);
    this.map.on('zoomend', updateBounds);

    this.vehicleService.getAccounts().subscribe((accounts) => {
      this.accountMap = new Map(accounts.map((a) => [a.id, a.name]));
      this.mapBounds.set(this.map!.getBounds());
    });
  }

  private drawMarkers(vehicles: VehicleViewModel[]): void {
    if (!this.map) return;
    this.markers.clearLayers();
    for (const v of vehicles) {
      const { lat, lng } = v.last_known_location!;
      L.circleMarker([lat, lng], {
        radius: 7,
        color: '#fff',
        weight: 1.5,
        fillColor: STATUS_COLORS[v.status],
        fillOpacity: 0.9,
      })
        .bindTooltip(
          `<strong>${v.plate}</strong><br>${v.make} ${v.model} (${v.year})<br>${v.accountName}`,
          { sticky: true }
        )
        .on('click', () => this.vehicleSelected.emit(v))
        .addTo(this.markers);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }
}
