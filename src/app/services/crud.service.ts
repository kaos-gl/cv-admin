import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  docData,
  serverTimestamp,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CrudService {
  constructor(private firestore: Firestore) {}

  // ── READ ──────────────────────────────────────────────────────────────────
  getAll<T>(collectionPath: string, orderField?: string): Observable<(T & { id: string })[]> {
    const ref = collection(this.firestore, collectionPath);
    const q = orderField ? query(ref, orderBy(orderField)) : ref;
    return collectionData(q, { idField: 'id' }) as Observable<(T & { id: string })[]>;
  }

  getById<T>(collectionPath: string, id: string): Observable<T & { id: string }> {
    const ref = doc(this.firestore, `${collectionPath}/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<T & { id: string }>;
  }

  // ── CREATE ────────────────────────────────────────────────────────────────
  create<T extends object>(collectionPath: string, data: T): Observable<string> {
    const ref = collection(this.firestore, collectionPath);
    const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    return from(addDoc(ref, payload)).pipe(map((docRef) => docRef.id));
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────
  update<T extends object>(collectionPath: string, id: string, data: Partial<T>): Observable<void> {
    const ref = doc(this.firestore, `${collectionPath}/${id}`);
    const payload = { ...data, updatedAt: serverTimestamp() };
    return from(updateDoc(ref, payload as any));
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  delete(collectionPath: string, id: string): Observable<void> {
    const ref = doc(this.firestore, `${collectionPath}/${id}`);
    return from(deleteDoc(ref));
  }
}
