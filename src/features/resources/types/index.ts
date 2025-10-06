type Resource = {
  label: string;
  contact: string;
  link?: string;
};

export interface Resources {
  id: string;
  country: string;
  hotlines: Resource[];
}
