import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CrudService } from '../../services/crud.service';
import { CV_SECTIONS } from '../../models/section.config';
import { SectionConfig } from '../../models/cv.models';

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
  singleDocId: string | null = null;

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
      this.buildForm();
      if (this.section.singleDocument) {
        this.loadSingleDocument();
      } else {
        this.loadItems();
      }
    });
  }

  loadItems() {
    this.loading = true;
    if (this.sub) this.sub.unsubscribe();
    this.sub = this.crud
      .getAll(this.section.path, this.section.orderField)
      .subscribe({
        next: (data) => { this.items = data; this.loading = false; },
        error: () => { this.showToast('Error cargando datos', 'error'); this.loading = false; },
      });
  }

  loadSingleDocument() {
    this.loading = true;
    if (this.sub) this.sub.unsubscribe();
    this.sub = this.crud.getAll(this.section.path).subscribe({
      next: (data) => {
        this.loading = false;
        if (data.length > 0) {
          const doc = data[0];
          this.singleDocId = doc['id'];
          const patchVal: Record<string, any> = {};
          this.section.fields.forEach((f) => (patchVal[f.key] = doc[f.key] ?? ''));
          this.form.patchValue(patchVal);
        } else {
          this.singleDocId = null;
        }
        this.showForm = true;
      },
      error: () => { this.showToast('Error cargando perfil', 'error'); this.loading = false; },
    });
  }

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
    if (this.section?.singleDocument) return;
    this.showForm = false;
    this.editingId = null;
    this.form.reset();
  }

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const data = this.form.value;
    try {
      if (this.section.singleDocument) {
        if (this.singleDocId) {
          await this.crud.update(this.section.path, this.singleDocId, data).toPromise();
        } else {
          const newId = await this.crud.create(this.section.path, data).toPromise();
          this.singleDocId = newId ?? null;
        }
        this.showToast('Perfil actualizado ✓', 'success');
      } else if (this.editingId) {
        await this.crud.update(this.section.path, this.editingId, data).toPromise();
        this.showToast('Actualizado correctamente ✓', 'success');
        this.closeForm();
      } else {
        await this.crud.create(this.section.path, data).toPromise();
        this.showToast('Creado correctamente ✓', 'success');
        this.closeForm();
      }
    } catch (e) {
      this.showToast('Error al guardar. Intenta de nuevo.', 'error');
    } finally {
      this.saving = false;
    }
  }

  confirmDelete(id: string) { this.deleteConfirmId = id; }

  async deleteItem(id: string) {
    try {
      await this.crud.delete(this.section.path, id).toPromise();
      this.showToast('Eliminado', 'success');
    } catch {
      this.showToast('Error al eliminar', 'error');
    } finally {
      this.deleteConfirmId = null;
    }
  }

  cancelDelete() { this.deleteConfirmId = null; }

  getPreview(item: any): string {
    const f = this.section.fields[0];
    const val = item[f.key] ?? '—';
    if (this.section.path === 'languages') {
      const f2 = this.section.fields[1];
      const val2 = f2 ? (item[f2.key] ?? '') : '';
      return val2 ? `${val} — ${val2}` : val;
    }
    return val;
  }

  getSubPreview(item: any): string {
    if (this.section.path === 'languages') return '';
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

  trackById(_: number, item: any) { return item.id; }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3500);
  }

  ngOnDestroy() { if (this.sub) this.sub.unsubscribe(); }
}
