import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CV_SECTIONS } from '../../models/section.config';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  sections = CV_SECTIONS;
  sidebarOpen = false;

  constructor(public auth: AuthService) {}

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar() { this.sidebarOpen = false; }

  @HostListener('document:keydown.escape')
  onEscape() { this.sidebarOpen = false; }
}
