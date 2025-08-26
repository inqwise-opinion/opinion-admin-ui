export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface State {
  id: number;
  name: string;
  code: string;
  countryId: number;
}

export const countries: Country[] = [
  { id: 232, name: 'United States', code: 'US' },
  { id: 39, name: 'Canada', code: 'CA' },
  { id: 230, name: 'United Kingdom', code: 'GB' },
  { id: 81, name: 'Germany', code: 'DE' },
  { id: 76, name: 'France', code: 'FR' },
  { id: 14, name: 'Australia', code: 'AU' },
  { id: 109, name: 'Japan', code: 'JP' },
  { id: 30, name: 'Brazil', code: 'BR' },
  { id: 106, name: 'Italy', code: 'IT' },
  { id: 204, name: 'Spain', code: 'ES' },
  { id: 156, name: 'Netherlands', code: 'NL' },
  { id: 41, name: 'China', code: 'CN' },
  { id: 103, name: 'India', code: 'IN' },
  { id: 193, name: 'Russia', code: 'RU' },
  { id: 135, name: 'Mexico', code: 'MX' },
];

// US States
export const usStates: State[] = [
  { id: 1, name: 'Alabama', code: 'AL', countryId: 232 },
  { id: 2, name: 'Alaska', code: 'AK', countryId: 232 },
  { id: 3, name: 'Arizona', code: 'AZ', countryId: 232 },
  { id: 4, name: 'Arkansas', code: 'AR', countryId: 232 },
  { id: 5, name: 'California', code: 'CA', countryId: 232 },
  { id: 6, name: 'Colorado', code: 'CO', countryId: 232 },
  { id: 7, name: 'Connecticut', code: 'CT', countryId: 232 },
  { id: 8, name: 'Delaware', code: 'DE', countryId: 232 },
  { id: 9, name: 'Florida', code: 'FL', countryId: 232 },
  { id: 10, name: 'Georgia', code: 'GA', countryId: 232 },
  { id: 11, name: 'Hawaii', code: 'HI', countryId: 232 },
  { id: 12, name: 'Idaho', code: 'ID', countryId: 232 },
  { id: 13, name: 'Illinois', code: 'IL', countryId: 232 },
  { id: 14, name: 'Indiana', code: 'IN', countryId: 232 },
  { id: 15, name: 'Iowa', code: 'IA', countryId: 232 },
  { id: 16, name: 'Kansas', code: 'KS', countryId: 232 },
  { id: 17, name: 'Kentucky', code: 'KY', countryId: 232 },
  { id: 18, name: 'Louisiana', code: 'LA', countryId: 232 },
  { id: 19, name: 'Maine', code: 'ME', countryId: 232 },
  { id: 20, name: 'Maryland', code: 'MD', countryId: 232 },
  { id: 21, name: 'Massachusetts', code: 'MA', countryId: 232 },
  { id: 22, name: 'Michigan', code: 'MI', countryId: 232 },
  { id: 23, name: 'Minnesota', code: 'MN', countryId: 232 },
  { id: 24, name: 'Mississippi', code: 'MS', countryId: 232 },
  { id: 25, name: 'Missouri', code: 'MO', countryId: 232 },
  { id: 26, name: 'Montana', code: 'MT', countryId: 232 },
  { id: 27, name: 'Nebraska', code: 'NE', countryId: 232 },
  { id: 28, name: 'Nevada', code: 'NV', countryId: 232 },
  { id: 29, name: 'New Hampshire', code: 'NH', countryId: 232 },
  { id: 30, name: 'New Jersey', code: 'NJ', countryId: 232 },
  { id: 31, name: 'New Mexico', code: 'NM', countryId: 232 },
  { id: 32, name: 'New York', code: 'NY', countryId: 232 },
  { id: 33, name: 'North Carolina', code: 'NC', countryId: 232 },
  { id: 34, name: 'North Dakota', code: 'ND', countryId: 232 },
  { id: 35, name: 'Ohio', code: 'OH', countryId: 232 },
  { id: 36, name: 'Oklahoma', code: 'OK', countryId: 232 },
  { id: 37, name: 'Oregon', code: 'OR', countryId: 232 },
  { id: 38, name: 'Pennsylvania', code: 'PA', countryId: 232 },
  { id: 39, name: 'Rhode Island', code: 'RI', countryId: 232 },
  { id: 40, name: 'South Carolina', code: 'SC', countryId: 232 },
  { id: 41, name: 'South Dakota', code: 'SD', countryId: 232 },
  { id: 42, name: 'Tennessee', code: 'TN', countryId: 232 },
  { id: 43, name: 'Texas', code: 'TX', countryId: 232 },
  { id: 44, name: 'Utah', code: 'UT', countryId: 232 },
  { id: 45, name: 'Vermont', code: 'VT', countryId: 232 },
  { id: 46, name: 'Virginia', code: 'VA', countryId: 232 },
  { id: 47, name: 'Washington', code: 'WA', countryId: 232 },
  { id: 48, name: 'West Virginia', code: 'WV', countryId: 232 },
  { id: 49, name: 'Wisconsin', code: 'WI', countryId: 232 },
  { id: 50, name: 'Wyoming', code: 'WY', countryId: 232 },
  { id: 51, name: 'District of Columbia', code: 'DC', countryId: 232 },
];

// Canadian Provinces and Territories
export const canadianProvinces: State[] = [
  { id: 100, name: 'Alberta', code: 'AB', countryId: 39 },
  { id: 101, name: 'British Columbia', code: 'BC', countryId: 39 },
  { id: 102, name: 'Manitoba', code: 'MB', countryId: 39 },
  { id: 103, name: 'New Brunswick', code: 'NB', countryId: 39 },
  { id: 104, name: 'Newfoundland and Labrador', code: 'NL', countryId: 39 },
  { id: 105, name: 'Northwest Territories', code: 'NT', countryId: 39 },
  { id: 106, name: 'Nova Scotia', code: 'NS', countryId: 39 },
  { id: 107, name: 'Nunavut', code: 'NU', countryId: 39 },
  { id: 108, name: 'Ontario', code: 'ON', countryId: 39 },
  { id: 109, name: 'Prince Edward Island', code: 'PE', countryId: 39 },
  { id: 110, name: 'Quebec', code: 'QC', countryId: 39 },
  { id: 111, name: 'Saskatchewan', code: 'SK', countryId: 39 },
  { id: 112, name: 'Yukon', code: 'YT', countryId: 39 },
];

// Combined states array for easy lookup
export const allStates: State[] = [...usStates, ...canadianProvinces];

// Helper functions
export const getCountryById = (id: number): Country | undefined => {
  return countries.find(country => country.id === id);
};

export const getStateById = (id: number): State | undefined => {
  return allStates.find(state => state.id === id);
};

export const getStatesByCountryId = (countryId: number): State[] => {
  return allStates.filter(state => state.countryId === countryId);
};

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const hasStates = (countryId: number): boolean => {
  return countryId === 232 || countryId === 39; // US or Canada
};
