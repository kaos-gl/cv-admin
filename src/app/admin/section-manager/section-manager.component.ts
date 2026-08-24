import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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
  // ¡CORREGIDO! Cambiamos ! por ? para eliminar los warnings NG8107
  section?: SectionConfig; 
  items: any[] = [];
  form!: FormGroup;
  editingId: string | null = null;
  showForm = false;
  loading = true;
  saving = false;
  subiendoImagen = false;
  deleteConfirmId: string | null = null;
  toast: { message: string; type: 'success' | 'error' } | null = null;
  singleDocId: string | null = null;

  private sub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private crud: CrudService,
    private fb: FormBuilder,
    private http: HttpClient
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
    // Validamos que exista this.section antes de usarlo
    if (!this.section) return; 
    
    this.sub = this.crud.getAll(this.section.path, this.section.orderField).subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: () => { this.showToast('Error cargando datos', 'error'); this.loading = false; },
    });
  }

  loadSingleDocument() {
    this.loading = true;
    if (this.sub) this.sub.unsubscribe();
    if (!this.section) return;

    this.sub = this.crud.getAll(this.section.path).subscribe({
      next: (data) => {
        this.loading = false;
        if (data.length > 0) {
          const docData = data[0];
          this.singleDocId = docData['id'];
          const patchVal: Record<string, any> = {};
          this.section?.fields.forEach((f) => (patchVal[f.key] = (docData as any)[f.key] ?? ''));
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
    this.section?.fields.forEach((field) => {
      if (field.type === 'array') {
        controls[field.key] = this.fb.array([this.fb.control('')]);
      } else {
        const validators = field.required ? [Validators.required] : [];
        if (field.type === 'number') {
          if (field.min !== undefined) validators.push(Validators.min(field.min));
          if (field.max !== undefined) validators.push(Validators.max(field.max));
        }
        if (field.type === 'email') validators.push(Validators.email);
        if (field.type === 'url') validators.push(Validators.pattern(/^https?:\/\/.+/));
        controls[field.key] = [field.type === 'number' ? 0 : '', validators];
      }
    });
    this.form = this.fb.group(controls);
  }

  getFormArray(key: string): FormArray {
    return this.form.get(key) as FormArray;
  }

  addArrayItem(key: string) {
    this.getFormArray(key).push(this.fb.control(''));
  }

  removeArrayItem(key: string, index: number) {
    const arr = this.getFormArray(key);
    if (arr.length > 1) arr.removeAt(index);
  }

  openCreate() {
    this.editingId = null;
    this.buildForm();
    this.showForm = true;
    setTimeout(() => document.getElementById('first-field')?.focus(), 100);
  }

  openEdit(item: any) {
    this.editingId = item.id;
    this.buildForm();
    this.section?.fields.forEach((f) => {
      if (f.type === 'array') {
        const arr = this.getFormArray(f.key);
        const values: string[] = Array.isArray(item[f.key]) ? item[f.key] : [];
        while (arr.length) arr.removeAt(0);
        if (values.length > 0) {
          values.forEach((v) => arr.push(this.fb.control(v)));
        } else {
          arr.push(this.fb.control(''));
        }
      } else {
        this.form.get(f.key)?.setValue(item[f.key] ?? '');
      }
    });
    this.showForm = true;
  }

  closeForm() {
    if (this.section?.singleDocument) return;
    this.showForm = false;
    this.editingId = null;
    this.buildForm();
  }

  async submit() {
    if (this.subiendoImagen) {
      this.showToast('Espera a que termine de subir la imagen', 'error');
      return;
    }

    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const data: Record<string, any> = {};
    this.section?.fields.forEach((f) => {
      if (f.type === 'array') {
        data[f.key] = this.getFormArray(f.key).value.filter((v: string) => v.trim() !== '');
      } else {
        data[f.key] = this.form.get(f.key)?.value;
      }
    });

    if (!this.section) return;

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
    if (!this.section) return;
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
    if (!this.section?.fields || this.section.fields.length === 0) return '—';
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
    if (this.section?.path === 'languages' || !this.section?.fields) return '';
    const f = this.section.fields[1];
    if (!f) return '';
    if (f.type === 'array') {
      const arr = item[f.key];
      return Array.isArray(arr) ? `${arr.length} logros` : '';
    }
    const val = item[f.key];
    if (f.type === 'number') return `${val}%`;
    return val ?? '';
  }

  hasError(key: string, error: string): boolean {
    const ctrl = this.form.get(key);
    return !!ctrl && ctrl.hasError(error) && ctrl.touched;
  }

  trackById(_: number, item: any) { return item.id; }
  trackByIndex(index: number) { return index; }

  showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3500);
  }

  subirImagenCloudinary(event: any, formControlKey: string) {
    const file = event.target.files[0];
    if (!file) return;

    this.subiendoImagen = true;

    // Pon aquí tus credenciales de Cloudinary
    const uploadPreset = 'TU_UPLOAD_PRESET'; 
    const cloudName = 'TU_CLOUD_NAME';
    
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', uploadPreset);
    data.append('cloud_name', cloudName);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    this.http.post(url, data).subscribe({
      next: (res: any) => {
        const imagenUrl = res.secure_url;
        this.form.patchValue({
          [formControlKey]: imagenUrl
        });
        this.subiendoImagen = false;
        this.showToast('Imagen subida con éxito ✓', 'success');
      },
      error: (err) => {
        console.error('Error al subir:', err);
        this.subiendoImagen = false;
        this.showToast('Error al subir la imagen a Cloudinary', 'error');
      }
    });
  }

  ngOnDestroy() { if (this.sub) this.sub.unsubscribe(); }
}