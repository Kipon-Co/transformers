// src/types.ts

/**
 * TransformSchema interface for configuring the transformation.
 */
export interface TransformSchema {
  id?: string; // Field to group by (default is 'id')
  prefix?: string; // Optional prefix for aggregated columns
  property?: string; // Optional renaming of the aggregated object key
  one?: Array<string | TransformSchema>; // One-to-one relationships
  many?: Array<string | TransformSchema>; // One-to-many relationships
  transforms?: {
    // Custom field transformations: if value is a string, it maps to another field name;
    // if it is a function, it transforms the value.
    [key: string]: string | ((value: any) => any);
  };
}
