type Resource = {
  label: string;
  contact: string;
};

export interface Resources {
  id: string;
  country: string;
  hotlines: Resource[];
}
