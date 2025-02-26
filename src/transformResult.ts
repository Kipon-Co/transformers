// src/transformResult.ts

import { TransformSchema } from './types';
import { groupRowsBy, processOneRelations, processManyRelations, applyTransforms, cleanupBase } from './helpers';

/**
 * Transforms SQL query result rows into a structured object (or array of objects) based on the provided schema.
 *
 * @param rows - Array of SQL query result rows.
 * @param schema - Transformation configuration schema.
 * @returns Structured object or array of objects.
 */
export function transformResult(rows: any[], schema: TransformSchema): any {
  const keyField = schema.id || 'id';
  const groupedRows = groupRowsBy(rows, keyField);
  const transformedResults: any[] = [];

  groupedRows.forEach((group) => {
    // Use the first row as the base for the root object
    let base = { ...group[0] };

    // Apply custom transforms on the base object
    base = applyTransforms(base, schema);
    // Remove aggregated keys and mapped fields from the base object
    base = cleanupBase(base, schema);

    // Process one-to-one relationships if defined
    if (schema.one) {
      base = processOneRelations(base, group, Array.isArray(schema.one) ? schema.one : [schema.one]);
    }

    // Process one-to-many relationships if defined
    if (schema.many) {
      base = processManyRelations(base, group, Array.isArray(schema.many) ? schema.many : [schema.many]);
    }

    transformedResults.push(base);
  });

  // Return a single object if only one result exists; otherwise, return an array
  return transformedResults.length === 1 ? transformedResults[0] : transformedResults;
}
