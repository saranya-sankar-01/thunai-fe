import * as z from "zod";
import { Schema } from "@/types/Schema";

export function buildDynamicSchema(schema: Schema) {
  const shape: Record<string, any> = {};

  schema.attribute_mapping.forEach(attr => {
    const field = attr.attribute_name;
    const isRequired = schema.mandatory_attributes.includes(attr.attribute_name);

    let validator;

    switch (attr.attribute_type) {
      case "text":
        validator = z.string();
        break;
      case "number":
        validator = z
          .string()
          .refine(val => !isNaN(Number(val)), "Must be a number");
        break;
      case "date":
        validator = z.string(); // keep string, convert before submit
        break;
      default:
        validator = z.string();
    }

    shape[field] = isRequired ? validator.min(1, "Required") : validator.optional();
  });

  return z.object(shape);
}
