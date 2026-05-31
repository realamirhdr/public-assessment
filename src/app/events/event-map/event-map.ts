import { Component, AfterViewInit, OnDestroy, ElementRef, effect, input, viewChild } from '@angular/core';
import * as L from 'leaflet';
import { FleetEvent, EventType } from '../event.model';

const EVENT_COLORS: Record<EventType, string> = {
  gps_ping: '#1d4ed8',
  harsh_brake: '#dc2626',
  ignition_on: '#16a34a',
  ignition_off: '#6b7280',
  geofence_enter: '#7c3aed',
  geofence_exit: '#d97706',
};

@Component({
  selector: 'app-event-map',
  standalone: true,
  templateUrl: './event-map.html',
  styleUrl: './event-map.scss',
})
export class EventMap implements AfterViewInit, OnDestroy {
  readonly events = input<FleetEvent[]>([]);
  readonly selectedEvent = input<FleetEvent | null>(null);

  private mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
  private map: L.Map | null = null;
  private markerById = new Map<string, L.CircleMarker>();

  constructor() {
    effect(() => {
      const event = this.selectedEvent();
      if (!this.map || !event?.location?.lat || !event.location.lng) return;

      this.markerById.forEach((m) => m.setStyle({ radius: 5, weight: 1 }));

      const marker = this.markerById.get(event.id);
      if (marker) {
        marker.setStyle({ radius: 10, weight: 2.5 });
        this.map.flyTo([event.location.lat, event.location.lng], 8, { animate: true, duration: 0.6 });
      }
    });
  }

  ngAfterViewInit(): void {
    const withLocation = this.events().filter(
      (e) => e.location?.lat != null && e.location?.lng != null
    );

    const bounds = withLocation.map((e) => [e.location!.lat, e.location!.lng] as [number, number]);

    this.map = L.map(this.mapEl().nativeElement, {
      center: bounds.length ? undefined : [39.5, -98.35],
      zoom: bounds.length ? undefined : 4,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    withLocation.forEach((event) => {
      const marker = L.circleMarker([event.location!.lat, event.location!.lng!], {
        radius: 5,
        color: '#fff',
        weight: 1,
        fillColor: EVENT_COLORS[event.type],
        fillOpacity: 0.85,
      }).addTo(this.map!);

      this.markerById.set(event.id, marker);
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [24, 24] });
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }
}
