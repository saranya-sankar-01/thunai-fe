import { Attribute } from "@/types/Attribute";

export interface Schema {
  id: string;
  attribute_mapping: Attribute[];
  is_default: boolean;
  mandatory_attributes: string[];
  primary_attribute: string;
  schema_name: string;
  version: string;
  created: string;
  updated: string;
}
