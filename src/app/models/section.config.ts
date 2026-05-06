import { SectionConfig } from '../models/cv.models';

export const CV_SECTIONS: SectionConfig[] = [
  // ── HEADER (perfil) — documento único, no lista ───────────────────────────
  {
    label: 'Perfil',
    path: 'header',
    icon: '👤',
    singleDocument: true,   // flag especial: no es lista, es un solo doc
    fields: [
      { key: 'name',          label: 'Nombre completo',  type: 'text',     placeholder: 'Elon Musk',              required: true },
      { key: 'goalLife',      label: 'Descripción / Bio',type: 'textarea', placeholder: 'Ingeniero apasionado...', rows: 4, required: true },
      { key: 'photoURL',      label: 'URL de la foto',   type: 'url',      placeholder: 'https://...' },
      { key: 'email',         label: 'Email',            type: 'email',    placeholder: 'tu@email.com' },
      { key: 'phoneNumber',   label: 'Teléfono',         type: 'tel',      placeholder: '+52 999 999 9999' },
      { key: 'location',      label: 'Ubicación',        type: 'text',     placeholder: 'CDMX, México' },
      { key: 'socialNetwork', label: 'Red social',       type: 'text',     placeholder: '@usuario' },
    ],
  },
  {
    label: 'Skills',
    path: 'skills',
    icon: '⚡',
    orderField: 'name',
    fields: [
      { key: 'name',      label: 'Skill',      type: 'text',   placeholder: 'Angular',  required: true },
      { key: 'percentaje',label: 'Nivel (%)',  type: 'number', placeholder: '85', min: 0, max: 100, required: true },
    ],
  },
  {
    label: 'Experiencia',
    path: 'work-experience',
    icon: '💼',
    orderField: 'startDate',
    fields: [
      { key: 'position',       label: 'Puesto',          type: 'text',     placeholder: 'Senior Developer',  required: true },
      { key: 'company',        label: 'Empresa',         type: 'text',     placeholder: 'Acme Corp',         required: true },
      { key: 'location',       label: 'Ubicación',       type: 'text',     placeholder: 'CDMX, México' },
      { key: 'startDate',      label: 'Fecha inicio',    type: 'text',     placeholder: 'Ene 2022' },
      { key: 'endDate',        label: 'Fecha fin',       type: 'text',     placeholder: 'Presente' },
{ key: 'accomplishments', label: 'Logros (separa con |)', type: 'textarea', rows: 4,
  placeholder: 'Logro 1 | Logro 2 | Logro 3' },
    ],
  },
  {
    label: 'Educación',
    path: 'education',
    icon: '🎓',
    orderField: 'startDate',
    fields: [
      { key: 'degree',     label: 'Título',       type: 'text', placeholder: 'Ing. en Sistemas',  required: true },
      { key: 'university', label: 'Universidad',  type: 'text', placeholder: 'UNAM',              required: true },
      { key: 'startDate',  label: 'Fecha inicio', type: 'text', placeholder: '2018' },
      { key: 'endDate',    label: 'Fecha fin',    type: 'text', placeholder: '2022' },
    ],
  },
  {
    label: 'Certificados',
    path: 'certificates',
    icon: '📜',
    orderField: 'year',
    fields: [
      { key: 'title',       label: 'Título',       type: 'text',     placeholder: 'AWS Solutions Architect', required: true },
      { key: 'Description', label: 'Descripción',  type: 'textarea', rows: 2, placeholder: 'Emitido por...' },
      { key: 'year',        label: 'Año',          type: 'text',     placeholder: '2024' },
    ],
  },
  {
    label: 'Intereses',
    path: 'interests',
    icon: '🌟',
    orderField: 'name',
    fields: [
      { key: 'name', label: 'Interés', type: 'text', placeholder: 'Open Source', required: true },
    ],
  },
{
  label: 'Idiomas',
  path: 'languages',
  icon: '🌐',
  fields: [
    { key: 'language1', label: 'Idioma', type: 'text', placeholder: 'Español', required: true },
    { key: 'language2', label: 'Nivel',  type: 'text', placeholder: 'Nativo' },
  ],
},
];
