import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CrudService } from '../../services/crud.service';
import { CV_SECTIONS } from '../../models/section.config';
import { SectionConfig, FieldConfig } from '../../models/cv.models';

@Component({
  selector: 'app-section-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './section-manager.component.html',
})
export class SectionManagerComponent implements OnInit, OnDestroy {
  section!: SectionConfig;
  items: any[] = [];
  form!: FormGroup;
  editingId: string | null = null;
  showForm = false;
  loading = true;
  saving = false;
  deleteConfirmId: string | null = null;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  private sub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private crud: CrudService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.route.params.subscribe(({ section }) => {
      const found = CV_SECTIONS.find((s) => s.path === section);
      if (!found) return;
      this.section = found;
      this.loadItems();
      this.buildForm();
    });
  }

  // ── DATA ──────────────────────────────────────────────────────────────────
  loadItems() {
    this.loading = true;
    if (this.sub) this.sub.unsubscribe();
    this.sub = this.crud
      .getAll(this.section.path, this.section.orderField)
      .subscribe({
        next: (data) => {
          this.items = data;
          this.loading = false;
        },
        error: () => {
          this.showToast('Error loading data', 'error');
          this.loading = false;
        },
      });
  }

  // ── FORM ──────────────────────────────────────────────────────────────────
  buildForm() {
    const controls: Record<string, any> = {};
    this.section.fields.forEach((field) => {
      const validators = field.required ? [Validators.required] : [];
      if (field.type === 'number') {
        if (field.min !== undefined) validators.push(Validators.min(field.min));
        if (field.max !== undefined) validators.push(Validators.max(field.max));
      }
      if (field.type === 'email') validators.push(Validators.email);
      if (field.type === 'url') validators.push(Validators.pattern(/^https?:\/\/.+/));
      controls[field.key] = [field.type === 'number' ? 0 : '', validators];
    });
    this.form = this.fb.group(controls);
  }

  openCreate() {
    this.editingId = null;
    this.form.reset();
    this.showForm = true;
    setTimeout(() => document.getElementById('first-field')?.focus(), 100);
  }

  openEdit(item: any) {
    this.editingId = item.id;
    const patchVal: Record<string, any> = {};
    this.section.fields.forEach((f) => (patchVal[f.key] = item[f.key] ?? ''));
    this.form.patchValue(patchVal);
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.form.reset();
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const data = this.form.value;

    try {
      if (this.editingId) {
        await this.crud.update(this.section.path, this.editingId, data).toPromise();
        this.showToast(`${this.section.label} updated successfully`, 'success');
      } else {
        await this.crud.create(this.section.path, data).toPromise();
        this.showToast(`${this.section.label} created successfully`, 'success');
      }
      this.closeForm();
    } catch (e) {
      this.showToast('Error saving. Please try again.', 'error');
    } finally {
      this.saving = false;
    }
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  confirmDelete(id: string) {
    this.deleteConfirmId = id;
  }

  async deleteItem(id: string) {
    try {
      await this.crud.delete(this.section.path, id).toPromise();
      this.showToast('Item deleted', 'success');
    } catch {
      this.showToast('Error deleting item', 'error');
    } finally {
      this.deleteConfirmId = null;
    }
  }

  cancelDelete() {
    this.deleteConfirmId = null;
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  getPreview(item: any): string {
    const f = this.section.fields[0];
    return item[f.key] ?? '—';
  }

  getSubPreview(item: any): string {
    const f = this.section.fields[1];
    if (!f) return '';
    const val = item[f.key];
    if (f.type === 'number') return `${val}%`;
    return val ?? '';
  }

  hasError(key: string, error: string): boolean {
    const ctrl = this.form.get(key);
    return !!ctrl && ctrl.hasError(error) && ctrl.touched;
  }

  trackById(_: number, item: any) {
    return item.id;
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3000);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
