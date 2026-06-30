export interface District {
  id: number;
  name: string;
}

export const DISTRICTS: District[] = [
  { id: 0, name: 'N/A' },
  { id: 1, name: 'District 1' },
  { id: 2, name: 'District 2' },
  { id: 3, name: 'District 3' },
  { id: 4, name: 'District 4' },
  { id: 5, name: 'District 5' },
  { id: 6, name: 'District 6' },
  { id: 7, name: 'District 7' },
];

export const SUFFIXES = [
  { id: '', name: 'None' },
  { id: 'Jr.', name: 'Jr.' },
  { id: 'Jr. II', name: 'Jr. II' },
  { id: 'Sr.', name: 'Sr.' },
  { id: 'II', name: 'II' },
  { id: 'III', name: 'III' },
  { id: 'IV', name: 'IV' },
  { id: 'V', name: 'V' },
  { id: 'VI', name: 'VI' },
];
