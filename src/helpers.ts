// src/helpers.ts

import { TransformSchema } from './types.ts';
import { transformResult } from './transformResult.ts';

/**
 * Groups rows by the given key.
 */
export function groupRowsBy(rows: any[], key: string): any[][] {
  const groups = new Map();
  for (const row of rows) {
    const id = row[key];
    if (!groups.has(id)) {
      groups.set(id, []);
    }
    groups.get(id).push(row);
  }
  return Array.from(groups.values());
}

/**
 * Extracts relation data from a row using the specified prefix.
 * Example: for prefix 'company', extracts fields like 'company_id', 'company_name', etc.
 */
export function extractRelationData(row: any, prefix: string): any {
  const result: any = {};
  const prefixWithUnderscore = prefix + '_';
  for (const key in row) {
    if (key.startsWith(prefixWithUnderscore)) {
      const newKey = key.slice(prefixWithUnderscore.length);
      result[newKey] = row[key];
    }
  }
  return result;
}

/**
 * Cleans up the base object by removing keys that were used for aggregated relations
 * and keys that have been mapped to new names.
 */
export function cleanupBase(base: any, schema: TransformSchema): any {
  // Gather all prefixes from one-to-one and one-to-many relations
  const relationPrefixes: string[] = [];
  if (schema.one) {
    const ones = Array.isArray(schema.one) ? schema.one : [schema.one];
    ones.forEach(rel => {
      if (typeof rel === 'string') {
        relationPrefixes.push(rel);
      } else if (rel.prefix) {
        relationPrefixes.push(rel.prefix);
      }
    });
  }
  if (schema.many) {
    const manys = Array.isArray(schema.many) ? schema.many : [schema.many];
    manys.forEach(rel => {
      if (typeof rel === 'string') {
        relationPrefixes.push(rel);
      } else if (rel.prefix) {
        relationPrefixes.push(rel.prefix);
      }
    });
  }
  // Remove keys that start with any of these prefixes followed by an underscore.
  for (const key in base) {
    for (const prefix of relationPrefixes) {
      if (key.startsWith(prefix + '_')) {
        delete base[key];
        break;
      }
    }
  }
  // Remove keys from transforms where mapping is a string (if different from the new key)
  if (schema.transforms) {
    for (const newKey in schema.transforms) {
      const mapping = schema.transforms[newKey];
      if (typeof mapping === 'string' && mapping !== newKey && base.hasOwnProperty(mapping)) {
        delete base[mapping];
      }
    }
  }
  return base;
}

/**
 * Processes one-to-one relationships.
 * Groups data based on the specified relation's id key and applies nested transformations if defined.
 */
export function processOneRelations(
  result: any,
  groupRows: any[],
  relations: Array<string | TransformSchema>
): any {
  relations.forEach((rel) => {
    const relSchema: TransformSchema = typeof rel === 'string' ? { prefix: rel } : rel;
    const prefix = relSchema.prefix!;
    // Use the provided id key or default to 'id'
    const groupIdKey = relSchema.id || 'id';
    let relData: any = null;
    for (const row of groupRows) {
      const data = extractRelationData(row, prefix);
      if (data && Object.keys(data).length > 0 && data[groupIdKey] != null) {
        // Recursively transform the relation if nested relations exist
        relData = transformResult([data], relSchema);
        break;
      }
    }
    // If no data found, assign an empty object
    result[relSchema.property || prefix] = relData || {};
  });
  return result;
}

/**
 * Processes one-to-many relationships.
 * Aggregates related rows by the specified id key and applies nested transformations if defined.
 */
export function processManyRelations(
  result: any,
  groupRows: any[],
  relations: Array<string | TransformSchema>
): any {
  relations.forEach((rel) => {
    const relSchema: TransformSchema = typeof rel === 'string' ? { prefix: rel } : rel;
    const prefix = relSchema.prefix!;
    const groupIdKey = relSchema.id || 'id';
    const relMap = new Map();
    for (const row of groupRows) {
      const data = extractRelationData(row, prefix);
      if (data && Object.keys(data).length > 0 && data[groupIdKey] != null) {
        const relId = data[groupIdKey];
        if (!relMap.has(relId)) {
          relMap.set(relId, data);
        } else {
          // Merge data if necessary (customize merge logic as needed)
          const existing = relMap.get(relId);
          relMap.set(relId, { ...existing, ...data });
        }
      }
    }
    // Transform each grouped relation row
    const arr = Array.from(relMap.values()).map((item) => transformResult([item], relSchema));
    result[relSchema.property || prefix] = arr;
  });
  return result;
}

/**
 * Applies custom transformations defined in the schema.
 */
export function applyTransforms(row: any, schema: TransformSchema): any {
  let result = { ...row };
  if (schema.transforms) {
    for (const key in schema.transforms) {
      const mapping = schema.transforms[key];
      if (typeof mapping === 'function') {
        result[key] = mapping(row[key]);
      } else if (typeof mapping === 'string') {
        result[key] = row[mapping];
      }
    }
  }
  return result;
}
