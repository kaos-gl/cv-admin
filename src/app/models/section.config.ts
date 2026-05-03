import { SectionConfig } from '../models/cv.models';

export const CV_SECTIONS: SectionConfig[] = [
  {
    label: 'Skills',
    path: 'skills',
    icon: '⚡',
    orderField: 'name',
    fields: [
      { key: 'name', label: 'Skill Name', type: 'text', placeholder: 'e.g. Angular', required: true },
      { key: 'percentaje', label: 'Level (%)', type: 'number', placeholder: '85', min: 0, max: 100, required: true },
    ],
  },
  {
    label: 'Work Experience',
    path: 'work-experience',
    icon: '💼',
    orderField: 'startDate',
    fields: [
      { key: 'position', label: 'Position', type: 'text', placeholder: 'Senior Developer', required: true },
      { key: 'company', label: 'Company', type: 'text', placeholder: 'Acme Corp', required: true },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'CDMX, México' },
      { key: 'startDate', label: 'Start Date', type: 'text', placeholder: 'Jan 2022' },
      { key: 'endDate', label: 'End Date', type: 'text', placeholder: 'Present' },
      { key: 'accomplishments', label: 'Accomplishments', type: 'textarea', rows: 4,
        placeholder: 'Led migration to microservices architecture...' },
    ],
  },
  {
    label: 'Education',
    path: 'education',
    icon: '🎓',
    orderField: 'startDate',
    fields: [
      { key: 'degree', label: 'Degree', type: 'text', placeholder: 'B.Sc. Computer Science', required: true },
      { key: 'university', label: 'University', type: 'text', placeholder: 'UNAM', required: true },
      { key: 'startDate', label: 'Start Date', type: 'text', placeholder: '2018' },
      { key: 'endDate', label: 'End Date', type: 'text', placeholder: '2022' },
    ],
  },
  {
    label: 'Certificates',
    path: 'certificates',
    icon: '📜',
    orderField: 'year',
    fields: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'AWS Solutions Architect', required: true },
      { key: 'Description', label: 'Description', type: 'textarea', rows: 2, placeholder: 'Issued by...' },
      { key: 'year', label: 'Year', type: 'text', placeholder: '2024' },
    ],
  },
  {
    label: 'Interests',
    path: 'interests',
    icon: '🌟',
    orderField: 'name',
    fields: [
      { key: 'name', label: 'Interest', type: 'text', placeholder: 'Open Source Development', required: true },
    ],
  },
  {
    label: 'Languages',
    path: 'languages',
    icon: '🌐',
    fields: [
      { key: 'language1', label: 'Language', type: 'text', placeholder: 'Spanish', required: true },
      { key: 'language2', label: 'Level', type: 'text', placeholder: 'Native' },
    ],
  },
];
