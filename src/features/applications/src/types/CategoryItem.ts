interface Filter {
  key_name: string;
  key_value: string;
  operator: string;
}

export interface CategoryItem {
  text: string;
  value: string;
  filter: Filter[];
}
