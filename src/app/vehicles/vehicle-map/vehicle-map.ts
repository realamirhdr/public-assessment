import { Component, AfterViewInit, OnDestroy, ElementRef, viewChild } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-vehicle-map',
  standalone: true,
  templateUrl: './vehicle-map.html',
  styleUrl: './vehicle-map.scss',
})
export class VehicleMap implements AfterViewInit, OnDestroy {
  private mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
  private map: L.Map | null = null;

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl().nativeElement, {
      center: [39.5, -98.35],
      zoom: 4,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }
}
