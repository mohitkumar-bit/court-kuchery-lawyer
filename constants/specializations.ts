export const SPECIALIZATION_OPTIONS = [
  { value: "criminal", label: "Criminal" },
  { value: "family", label: "Family" },
  { value: "corporate", label: "Corporate" },
  { value: "civil", label: "Civil" },
  { value: "property", label: "Property" },
  { value: "cyber", label: "Cyber" },
] as const;

export type SpecializationValue =
  (typeof SPECIALIZATION_OPTIONS)[number]["value"];
