import type { Category, PropertyGroup, PropertyStatus, PropertyType } from "@/types";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "FOR_SALE", label: "For Sale" },
  { value: "FOR_RENT", label: "For Rent" },
];

export const STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "SOLD", label: "Sold" },
  { value: "UNDER_OFFER", label: "Under Offer" },
  { value: "INACTIVE", label: "Inactive" },
];

export const PROPERTY_GROUPS: { value: PropertyGroup; label: string }[] = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "LAND", label: "Land" },
];

export const PROPERTY_TYPES: Record<PropertyGroup, { value: PropertyType; label: string }[]> = {
  RESIDENTIAL: [
    { value: "Apartment", label: "Apartment" },
    { value: "Duplex", label: "Duplex" },
    { value: "Villa", label: "Villa" },
    { value: "Chalet", label: "Chalet" },
    { value: "Studio", label: "Studio" },
    { value: "Penthouse", label: "Penthouse" },
    { value: "Triplex", label: "Triplex" },
    { value: "House", label: "House" },
  ],
  COMMERCIAL: [
    { value: "Office", label: "Office" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Shop", label: "Shop" },
    { value: "Showroom", label: "Showroom" },
    { value: "Clinic", label: "Clinic" },
    { value: "Hotel", label: "Hotel" },
    { value: "Industrial", label: "Industrial" },
    { value: "Building", label: "Building" },
  ],
  LAND: [
    { value: "Land", label: "Land" },
    { value: "Farm", label: "Farm" },
  ],
};

// All property types flattened
export const ALL_PROPERTY_TYPES = Object.values(PROPERTY_TYPES).flat();

// Countries Golden Land actively operates in — pinned at the top of admin
// dropdowns and shown explicitly in the public filter. Anything outside this
// list is grouped under "Other" on the public site.
export const PRIMARY_COUNTRIES = ["Lebanon", "Cyprus", "Greece", "Georgia"] as const;

// Sentinel value used by the public country filter to mean "anything not in
// PRIMARY_COUNTRIES" (matched server-side via $nin).
export const OTHER_COUNTRY_VALUE = "__OTHER__";

// Listings created before this date are treated as archive and hidden from the
// public site. Admin can opt back in via the "Show pre-2022" toggle.
export const MIN_LISTING_DATE = new Date("2022-01-01T00:00:00.000Z");

// Comprehensive country list (UN members + commonly-listed territories),
// minus the four PRIMARY_COUNTRIES which are listed separately.
export const OTHER_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
  "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada",
  "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Czech Republic",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Germany", "Ghana", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
  "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe",
] as const;

export const CURRENCIES = ["USD", "EUR"] as const;

// Search/filter defaults
export const DEFAULT_PAGE_SIZE = 24;

// Slider ranges per category — derived from real listing data
export const SLIDER_CONFIG = {
  FOR_SALE: {
    price: { min: 0, max: 1_500_000, step: 10_000 },
    area: { min: 0, max: 1_000, step: 10 },
  },
  FOR_RENT: {
    price: { min: 0, max: 5_000, step: 50 },
    area: { min: 0, max: 500, step: 5 },
  },
} as const;

export const DEFAULT_SLIDER_CONFIG = SLIDER_CONFIG.FOR_SALE;

export function getSliderConfig(category: string | null) {
  if (category === "FOR_RENT") return SLIDER_CONFIG.FOR_RENT;
  if (category === "FOR_SALE") return SLIDER_CONFIG.FOR_SALE;
  return DEFAULT_SLIDER_CONFIG;
}

export const PREDEFINED_FEATURES = [
  "Pool",
  "Garden",
  "Terrace",
  "Parking",
  "Gym",
  "Security",
  "Concierge",
  "Furnished",
  "Sea View",
  "Central Cooling & Heating",
  "Smart Home",
  "Storage",
  "Balcony",
  "Beach Front",
  "Historic",
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "relevance", label: "Most Relevant" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "area_desc", label: "Area: Large to Small" },
] as const;

export const ADMIN_SORT_OPTIONS = [
  { value: "modified", label: "Last Modified" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "area_desc", label: "Area: Large to Small" },
] as const;
