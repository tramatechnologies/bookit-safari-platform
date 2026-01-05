// Tanzania Regions Data
export const TANZANIA_REGIONS = [
  { id: 'arusha', name: 'Arusha', popular: true },
  { id: 'dar-es-salaam', name: 'Dar es Salaam', popular: true },
  { id: 'dodoma', name: 'Dodoma', popular: true },
  { id: 'geita', name: 'Geita', popular: false },
  { id: 'iringa', name: 'Iringa', popular: false },
  { id: 'kagera', name: 'Kagera', popular: false },
  { id: 'katavi', name: 'Katavi', popular: false },
  { id: 'kigoma', name: 'Kigoma', popular: false },
  { id: 'kilimanjaro', name: 'Kilimanjaro', popular: true },
  { id: 'lindi', name: 'Lindi', popular: false },
  { id: 'manyara', name: 'Manyara', popular: false },
  { id: 'mara', name: 'Mara', popular: false },
  { id: 'mbeya', name: 'Mbeya', popular: true },
  { id: 'morogoro', name: 'Morogoro', popular: true },
  { id: 'mtwara', name: 'Mtwara', popular: false },
  { id: 'mwanza', name: 'Mwanza', popular: true },
  { id: 'njombe', name: 'Njombe', popular: false },
  { id: 'pemba-north', name: 'Pemba North', popular: false },
  { id: 'pemba-south', name: 'Pemba South', popular: false },
  { id: 'pwani', name: 'Pwani (Coast)', popular: false },
  { id: 'rukwa', name: 'Rukwa', popular: false },
  { id: 'ruvuma', name: 'Ruvuma', popular: false },
  { id: 'shinyanga', name: 'Shinyanga', popular: false },
  { id: 'simiyu', name: 'Simiyu', popular: false },
  { id: 'singida', name: 'Singida', popular: false },
  { id: 'songwe', name: 'Songwe', popular: false },
  { id: 'tabora', name: 'Tabora', popular: false },
  { id: 'tanga', name: 'Tanga', popular: true },
  { id: 'unguja-north', name: 'Unguja North (Zanzibar)', popular: false },
  { id: 'unguja-south', name: 'Unguja South (Zanzibar)', popular: false },
  { id: 'zanzibar-city', name: 'Zanzibar City', popular: true },
] as const;

export type RegionId = typeof TANZANIA_REGIONS[number]['id'];

// Popular Routes (using region IDs)
export const POPULAR_ROUTES = [
  {
    id: 1,
    from: '69f1637e-8e92-4f58-a9b7-2e5354bbfd1f', // Dar es Salaam
    to: 'accf65a1-6529-43be-8a62-ac5702b91cfd', // Arusha
    fromName: 'Dar es Salaam',
    toName: 'Arusha',
    duration: '9-10 hrs',
    image: '/placeholder.svg',
  },
  {
    id: 2,
    from: '69f1637e-8e92-4f58-a9b7-2e5354bbfd1f', // Dar es Salaam
    to: '183f2036-980a-435f-b9ad-aab370c1a791', // Mwanza
    fromName: 'Dar es Salaam',
    toName: 'Mwanza',
    duration: '14-16 hrs',
    image: '/placeholder.svg',
  },
  {
    id: 3,
    from: 'accf65a1-6529-43be-8a62-ac5702b91cfd', // Arusha
    to: '603177e5-f47c-492c-9b40-414cb94b3a9c', // Kilimanjaro
    fromName: 'Arusha',
    toName: 'Moshi',
    duration: '1-2 hrs',
    image: '/placeholder.svg',
  },
  {
    id: 4,
    from: '69f1637e-8e92-4f58-a9b7-2e5354bbfd1f', // Dar es Salaam
    to: '1b846c1a-060b-4355-b638-d64ea082081a', // Dodoma
    fromName: 'Dar es Salaam',
    toName: 'Dodoma',
    duration: '6-7 hrs',
    image: '/placeholder.svg',
  },
  {
    id: 5,
    from: '69f1637e-8e92-4f58-a9b7-2e5354bbfd1f', // Dar es Salaam
    to: 'e9ad27af-f146-4ab4-8e49-244ff462eaab', // Mbeya
    fromName: 'Dar es Salaam',
    toName: 'Mbeya',
    duration: '10-12 hrs',
    image: '/placeholder.svg',
  },
  {
    id: 6,
    from: '183f2036-980a-435f-b9ad-aab370c1a791', // Mwanza
    to: 'accf65a1-6529-43be-8a62-ac5702b91cfd', // Arusha
    fromName: 'Mwanza',
    toName: 'Arusha',
    duration: '8-10 hrs',
    image: '/placeholder.svg',
  },
];

// Format price in TZS
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
