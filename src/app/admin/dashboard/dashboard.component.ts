import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { CrudService } from '../../services/crud.service';
import { CV_SECTIONS } from '../../models/section.config';
import { AuthService } from '../../services/auth.service';

interface SectionStat {
  label: string;
  path: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats: SectionStat[] = [];
  loading = true;
  userEmail = '';

  constructor(private crud: CrudService, private auth: AuthService) {}

  ngOnInit() {
    this.auth.user$.pipe(take(1)).subscribe((u) => (this.userEmail = u?.email ?? ''));
    this.loadStats();
  }

  loadStats() {
    const requests = CV_SECTIONS.map((s) =>
      this.crud.getAll(s.path).pipe(take(1))
    );
    forkJoin(requests).subscribe({
      next: (results) => {
        this.stats = CV_SECTIONS.map((s, i) => ({
          label: s.label,
          path: s.path,
          icon: s.icon,
          count: results[i].length,
        }));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
