// ── SKILL ────────────────────────────────────────────────────────────────
export interface Skill {
  id?: string;
  name: string;
  percentaje: number; // keeping original spelling from CV
}

// ── EDUCATION ────────────────────────────────────────────────────────────
export interface Education {
  id?: string;
  degree: string;
  university: string;
  startDate: string;
  endDate: string;
}

// ── WORK EXPERIENCE ───────────────────────────────────────────────────────
export interface WorkExperience {
  id?: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  accomplishments: string;
}

// ── CERTIFICATE ───────────────────────────────────────────────────────────
export interface Certificate {
  id?: string;
  title: string;
  Description: string; // keeping original casing from CV
  year: string;
}

// ── INTEREST ──────────────────────────────────────────────────────────────
export interface Interest {
  id?: string;
  name: string;
}

// ── LANGUAGE ─────────────────────────────────────────────────────────────
export interface Language {
  id?: string;
  language1: string;
  language2: string;
}

// ── HEADER (profile) ──────────────────────────────────────────────────────
export interface Header {
  id?: string;
  name: string;
  goalLife: string;
  photoURL: string;
  email: string;
  phoneNumber: string;
  location: string;
  socialNetwork: string;
}

// ── SECTION CONFIG (for dynamic table rendering) ──────────────────────────
export interface SectionConfig {
  label: string;
  path: string;         // Firestore collection path
  icon: string;
  fields: FieldConfig[];
  orderField?: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'date' | 'url' | 'email' | 'tel';
  placeholder?: string;
  min?: number;
  max?: number;
  rows?: number;
  required?: boolean;
}
