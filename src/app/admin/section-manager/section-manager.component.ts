import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CrudService } from '../../services/crud.service';
import { CV_SECTIONS } from '../../models/section.config';
import { SectionConfig } from '../../models/cv.models';

// ... (imports iguales)

@Component({
  selector: 'app-section-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './section-manager.component.html',
})
export class SectionManagerComponent implements OnInit, OnDestroy {
  // ... (propiedades iguales)

  // CAMBIO 1: En loadSingleDocument, agregamos (doc as any) 
  // para que TS no se queje de que 'id' o las llaves no existen.
  loadSingleDocument() {
    this.loading = true;
    if (this.sub) this.sub.unsubscribe();
    this.sub = this.crud.getAll(this.section.path).subscribe({
      next: (data) => {
        this.loading = false;
        if (data.length > 0) {
          const doc = data[0];
          this.singleDocId = (doc as any)['id']; // <--- Cambio aquí
          const patchVal: Record<string, any> = {};
          // CAMBIO: Usamos (doc as any) aquí también
          this.section.fields.forEach((f) => (patchVal[f.key] = (doc as any)[f.key] ?? ''));
          this.form.patchValue(patchVal);
        } else {
          this.singleDocId = null;
        }
        this.showForm = true;
      },
      error: () => { this.showToast('Error cargando perfil', 'error'); this.loading = false; },
    });
  }

  // CAMBIO 2: Tu buildForm tenía una línea de "patchVal" que no pertenecía ahí 
  // y le faltaba el inicio del bucle forEach.
  buildForm() {
    const controls: Record<string, any> = {};
    
    this.section.fields.forEach((field) => { // <--- Corregido el inicio del bucle
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

  // ... (openCreate igual)

  // CAMBIO 3: En openEdit, también usamos (item as any)
  openEdit(item: any) {
    this.editingId = item.id;
    const patchVal: Record<string, any> = {};
    this.section.fields.forEach((f) => (patchVal[f.key] = (item as any)[f.key] ?? ''));
    this.form.patchValue(patchVal);
    this.showForm = true;
  }

  // ... (resto de métodos iguales)

  // CAMBIO 4: En getPreview y getSubPreview usamos (item as any)
  getPreview(item: any): string {
    const f = this.section.fields[0];
    const val = (item as any)[f.key] ?? '—';
    if (this.section.path === 'languages') {
      const f2 = this.section.fields[1];
      const val2 = f2 ? ((item as any)[f2.key] ?? '') : '';
      return val2 ? `${val} — ${val2}` : val;
    }
    return val;
  }

  getSubPreview(item: any): string {
    if (this.section.path === 'languages') return '';
    const f = this.section.fields[1];
    if (!f) return '';
    const val = (item as any)[f.key];
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
