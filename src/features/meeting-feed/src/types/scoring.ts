
export interface SubParameter {
  id?: string | number;
  name: string;
  instruction: string;
  score?: number;
  selectedType?: string;
}

export interface Parameter {
  id?: string | number;
  params: string;
  instruction: string;
  custom?: boolean;
  score?: number;
  selectedType?: string;
  sub_parameters?: SubParameter[];
}
