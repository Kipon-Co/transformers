// src/factory.ts

import { TransformSchema } from './types';
import { transformResult } from './transformResult';

export class TransformFactory {
  /**
   * Creates transformations to convert specified fields to Date objects.
   */
  static datesToDate(...fields: string[]): TransformSchema {
    const transforms: any = {};
    fields.forEach((field) => {
      transforms[field] = (value: any) => new Date(value);
    });
    return { transforms };
  }

  /**
   * Creates field mappings.
   */
  static mapFields(mappings: { [key: string]: string }): TransformSchema {
    const transforms: any = {};
    for (const key in mappings) {
      transforms[key] = mappings[key];
    }
    return { transforms };
  }

  /**
   * Creates transformations to convert specified string fields to booleans.
   */
  static stringsToBooleans(...fields: string[]): TransformSchema {
    const transforms: any = {};
    fields.forEach((field) => {
      transforms[field] = (value: any) => value === 'true';
    });
    return { transforms };
  }

  /**
   * Creates transformations to convert specified string fields to numbers.
   */
  static stringToNumbers(...fields: string[]): TransformSchema {
    const transforms: any = {};
    fields.forEach((field) => {
      transforms[field] = (value: any) => Number(value);
    });
    return { transforms };
  }

  /**
   * Merges multiple schemas into one.
   */
  static mergeSchemas(...schemas: TransformSchema[]): TransformSchema {
    const result: TransformSchema = {};
    schemas.forEach((schema) => {
      if (schema.transforms) {
        result.transforms = { ...(result.transforms || {}), ...schema.transforms };
      }
      if (schema.one) {
        result.one = result.one ? result.one.concat(schema.one) : schema.one;
      }
      if (schema.many) {
        result.many = result.many ? result.many.concat(schema.many) : schema.many;
      }
      // Merge additional properties if needed (id, prefix, property)
      if (schema.id) result.id = schema.id;
      if (schema.prefix) result.prefix = schema.prefix;
      if (schema.property) result.property = schema.property;
    });
    return result;
  }

  /**
   * Creates a reusable transformer function from a schema.
   */
  static createTransformer(schema: TransformSchema): (rows: any[]) => any {
    return (rows: any[]) => transformResult(rows, schema);
  }
}
