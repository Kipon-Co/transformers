<p align="">
  <img src="https://github.com/user-attachments/assets/99c4a739-826b-474f-a340-d6e622cc4464" />
</p>

# Transformers (JSON Mapping)

Package to transform columnar results from SQL queries (with joins) into complex JSON objects with nested relationships, with support for custom transformations.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Basic Usage](#basic-usage)
- [Value Transformations](#value-transformations)
- [Nested Relationships](#nested-relationships)
- [Using TransformFactory](#using-transformfactory)
- [Creating Reusable Transformers](#creating-reusable-transformers)
- [API Reference](#api-reference)
  - [transformResult](#transformresultrows-schema)
  - [TransformFactory](#transformfactory)
    - [Basic Transformations](#basic-transformations)
    - [Advanced Transformations](#advanced-transformations)
    - [Relations Configuration](#relations-configuration)
    - [Utility Methods](#utility-methods)
- [Integration with SQL Libraries](#integration-with-sql-libraries)
  - [PostgreSQL (pg)](#postgresql-pg)
  - [With Squel-ts](#with-squel-ts)
  - [With Serverless-postgres](#with-serverless-postgres)
- [Why Use This Library](#why-use-this-library)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
# Using npm
npm install json-sql-transformer

# Using yarn
yarn add json-sql-transformer

# Using pnpm
pnpm add json-sql-transformer
```

## Features

- Easily transform SQL query results into nested JSON structures
- Support for one-to-one and one-to-many relationships
- Value transformations (convert strings to Date, Number, Boolean)
- Field mapping (aliases)
- Support for deeply nested relationships
- Factory for creating reusable transformers
- Written in TypeScript with full type definitions
- Zero dependencies (except es-toolkit for utility functions)

## Basic Usage

```typescript
import { transformResult } from 'json-sql-transformer';

// Result from a SQL query with joins
const queryResults = [
  {
    id: 101,
    name: 'John Doe',
    department_id: 5,
    department_name: 'Engineering',
    project_id: 301,
    project_name: 'API Redesign'
  }
];

// Transform into structured object
const result = transformResult(queryResults, {
  one: ['department'],  // One-to-one relationship
  many: ['project']     // One-to-many relationship
});

console.log(result);
/* Output:
{
  id: 101,
  name: 'John Doe',
  department: {
    id: 5,
    name: 'Engineering'
  },
  project: [
    {
      id: 301,
      name: 'API Redesign'
    }
  ]
}
*/
```

## Value Transformations

```typescript
import { transformResult } from 'json-sql-transformer';

const result = transformResult(queryResults, {
  transforms: {
    // Convert string to Date
    created_at: (value) => new Date(value),

    // Map field to another
    updated_at: 'updated_time',

    // Convert string to Boolean
    is_active: (value) => value === 'true',

    // Convert string to Number
    count: (value) => parseInt(value, 10)
  },
  one: ['department'],
  many: ['project']
});
```

## Nested Relationships

```typescript
import { transformResult } from 'json-sql-transformer';

const result = transformResult(queryResults, {
  one: [
    {
      prefix: 'department',
      one: ['manager']  // Nested relationship: department -> manager
    }
  ],
  many: [
    {
      prefix: 'project',
      many: ['task']    // Nested relationship: project -> task
    }
  ]
});

/* Output:
{
  id: 101,
  name: 'John Doe',
  department: {
    id: 5,
    name: 'Engineering',
    manager: {
      id: 201,
      name: 'Jane Smith'
    }
  },
  project: [
    {
      id: 301,
      name: 'API Redesign',
      task: [
        { id: 401, name: 'Database Migration' },
        { id: 402, name: 'API Documentation' }
      ]
    }
  ]
}
*/
```

## Using TransformFactory

```typescript
import { TransformFactory } from 'json-sql-transformer';

// Create specific transformations
const dateTransforms = TransformFactory.datesToDate('created_at', 'updated_at');
const fieldMappings = TransformFactory.mapFields({ display_name: 'full_name' });
const booleanTransforms = TransformFactory.stringsToBooleans('is_active', 'is_admin');
const numberTransforms = TransformFactory.stringToNumbers('count', 'price');

// Merge schemas
const schema = TransformFactory.mergeSchemas(
  dateTransforms,
  fieldMappings,
  booleanTransforms,
  numberTransforms,
  {
    one: ['department'],
    many: ['project']
  }
);

// Apply the schema
const result = transformResult(queryResults, schema);
```

## Creating Reusable Transformers

```typescript
import { TransformFactory } from 'json-sql-transformer';

// Create a reusable transformer
const userTransformer = TransformFactory.createTransformer({
  transforms: {
    created_at: (value) => new Date(value),
    updated_at: 'updated_time',
    is_active: (value) => value === 'true'
  },
  one: ['department'],
  many: ['project']
});

// Use the transformer in different places
const users1 = userTransformer(queryResults1);
const users2 = userTransformer(queryResults2);
```

## API Reference

### transformResult(rows, schema)

Transforms SQL result rows into structured objects.

- **rows**: Array of objects returned by the SQL query
- **schema**: Transformation configuration

#### Transformation Schema

```typescript
interface TransformSchema {
  prefix?: string;                        // Column prefix (optional for root)
  key?: string;                           // Key field for identification (default: "id")
  one?: string[] | TransformSchema | (string | TransformSchema)[];  // One-to-one relationships
  many?: string[] | TransformSchema | (string | TransformSchema)[]; // One-to-many relationships
  transforms?: {                          // Custom transformations
    [key: string]: string | ((value: any) => any)
  }
}
```

### TransformFactory

Utility for creating and combining transformations.

#### Basic Transformations

- **`datesToDate(...fieldNames): TransformSchema`**
  Creates transformations to convert strings to Date objects.

  ```typescript
  // Example
  const schema = TransformFactory.datesToDate('created_at', 'updated_at');
  ```

- **`mapFields(mappings): TransformSchema`**
  Creates transformations to map fields from one name to another.

  ```typescript
  // Example
  const schema = TransformFactory.mapFields({
    'updated_at': 'updated_time',
    'display_name': 'full_name'
  });
  ```

- **`stringsToBooleans(...fieldNames): TransformSchema`**
  Creates transformations to convert strings to boolean values.

  ```typescript
  // Example
  const schema = TransformFactory.stringsToBooleans('is_active', 'is_admin');
  ```

- **`stringToNumbers(...fieldNames): TransformSchema`**
  Creates transformations to convert strings to numbers.

  ```typescript
  // Example
  const schema = TransformFactory.stringToNumbers('count', 'price');
  ```

#### Advanced Transformations

- **`formatStrings(mappings): TransformSchema`**
  Creates transformations to format strings (uppercase, lowercase, etc).

  ```typescript
  // Example
  const schema = TransformFactory.formatStrings({
    'username': 'lowercase',
    'title': 'capitalize',
    'code': 'uppercase'
  });
  ```

- **`customTransforms(mappings): TransformSchema`**
  Creates custom transformations with user-defined functions.

  ```typescript
  // Example
  const schema = TransformFactory.customTransforms({
    'full_name': (value) => `${value.first_name} ${value.last_name}`,
    'age': (value) => new Date().getFullYear() - value.birth_year
  });
  ```

#### Relations Configuration

- **`oneToOne(...relations): TransformSchema`**
  Creates a one-to-one relationship configuration.

  ```typescript
  // Example
  const schema = TransformFactory.oneToOne('profile', 'address');
  ```

- **`oneToMany(...relations): TransformSchema`**
  Creates a one-to-many relationship configuration.

  ```typescript
  // Example
  const schema = TransformFactory.oneToMany('posts', 'comments');
  ```

- **`nestedRelation(prefix, key, config): TransformSchema`**
  Creates a nested relationship configuration.

  ```typescript
  // Example
  const schema = TransformFactory.nestedRelation('department', 'id', {
    one: ['manager'],
    many: ['employees']
  });
  ```

#### Utility Methods

- **`identity(): TransformSchema`**
  Returns an empty schema (useful as placeholder).

- **`mergeSchemas(...schemas): TransformSchema`**
  Combines multiple schemas into one.

  ```typescript
  // Example
  const schema = TransformFactory.mergeSchemas(
    schema1,
    schema2,
    schema3
  );
  ```

- **`conditional(condition, trueSchema, falseSchema): TransformSchema`**
  Returns different schemas based on a condition.

  ```typescript
  // Example
  const schema = TransformFactory.conditional(
    includeDetails,
    detailedSchema,
    simpleSchema
  );
  ```

- **`createTransformer(schema): Function`**
  Creates a reusable transformer function from a schema.

  ```typescript
  // Example
  const transformer = TransformFactory.createTransformer(schema);
  ```

- **`createNamedTransformer(name, schema): Object`**
  Creates a named transformer function for better traceability.

  ```typescript
  // Example
  const { userTransformer } = TransformFactory.createNamedTransformer('userTransformer', schema);
  ```

## Integration with SQL Libraries

### PostgreSQL (pg)

```typescript
import { Pool } from 'pg';
import { transformResult } from 'json-sql-transformer';

const pool = new Pool();

async function getUserWithRelations(userId) {
  const { rows } = await pool.query(`
    SELECT
      u.id, u.name, u.email, u.created_at,
      d.id as department_id, d.name as department_name,
      p.id as project_id, p.name as project_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN user_projects up ON u.id = up.user_id
    LEFT JOIN projects p ON up.project_id = p.id
    WHERE u.id = $1
  `, [userId]);

  return transformResult(rows, {
    transforms: {
      created_at: (value) => new Date(value)
    },
    one: ['department'],
    many: ['project']
  });
}
```

### With Squel-ts

```typescript
import * as squel from 'squel-ts';
import { transformResult } from 'json-sql-transformer';

async function getUsersWithRelations(db) {
  const query = squel.select()
    .from('users', 'u')
    .field('u.id').field('u.name').field('u.email')
    .field('d.id', 'department_id').field('d.name', 'department_name')
    .field('p.id', 'project_id').field('p.name', 'project_name')
    .left_join('departments', 'd', 'u.department_id = d.id')
    .left_join('user_projects', 'up', 'u.id = up.user_id')
    .left_join('projects', 'p', 'up.project_id = p.id')
    .toString();

  const { rows } = await db.query(query);

  return transformResult(rows, {
    one: ['department'],
    many: ['project']
  });
}
```

### With Serverless-postgres

```typescript
import { Client } from 'serverless-postgres';
import { transformResult, TransformFactory } from 'json-sql-transformer';

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL
});

// Create a reusable transformer
const userTransformer = TransformFactory.createTransformer({
  transforms: {
    created_at: (value) => new Date(value),
    updated_at: 'updated_time'
  },
  one: ['department'],
  many: ['project']
});

async function getUsers() {
  await pgClient.connect();

  try {
    const { rows } = await pgClient.query(`
      SELECT
        u.id, u.name, u.email, u.created_at, u.updated_time,
        d.id as department_id, d.name as department_name,
        p.id as project_id, p.name as project_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN user_projects up ON u.id = up.user_id
      LEFT JOIN projects p ON up.project_id = p.id
    `);

    return userTransformer(rows);
  } finally {
    await pgClient.clean();
  }
}
```

## Why Use This Library

- **Simplifies code:** Eliminates the need for complex loops to structure data
- **Improves readability:** Separates query logic from transformation logic
- **Avoids common mistakes:** Automatically manages uniqueness of records in relationships
- **Supports deep nesting:** Facilitates creation of complex data structures
- **TypeScript typing:** Offers type safety and autocompletion
- **Flexible transformations:** Allows formatting data during transformation

## Contributing

Contributions are welcome! Please feel free to submit a PR.

1. Fork the repository
2. Create your feature branch: `git checkout -b my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-feature`
5. Submit a pull request

## License

MIT

This README includes a comprehensive Table of Contents with anchor links to each section, making it easy for users to navigate the documentation. The content covers all aspects of the library, from basic usage to advanced features and integration with various SQL libraries.
