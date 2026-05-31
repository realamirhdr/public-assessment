import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  readonly hidden = signal(false);
  private lastScrollY = 0;

  @HostListener('window:scroll')
  onScroll(): void {
    const current = window.scrollY;
    this.hidden.set(current > this.lastScrollY && current > 0);
    this.lastScrollY = current;
  }
}
