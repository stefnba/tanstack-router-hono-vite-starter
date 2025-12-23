# Architecture Overview: The Builder Chain

This document outlines the architectural layers and the builder pattern used to construct features in this application. Each layer has a specific responsibility and input, ensuring a clean separation of concerns and type safety across the stack.

## The Builder Chain

| Layer                       | Builder Name           | Responsibility                                                                                                   | Input                                | Output                             |
| :-------------------------- | :--------------------- | :--------------------------------------------------------------------------------------------------------------- | :----------------------------------- | :--------------------------------- |
| **1. Data Definition**      | **`defineResource`**   | Defines the table structure, identifiers, filters, and raw Zod shapes. Maps Drizzle schemas to domain resources. | Drizzle Table (`pgTable`)            | `Resource` (Zod Shapes + Metadata) |
| **2. Interface Definition** | **`defineContract`**   | Defines the "Agreement" for the feature. Specifies the inputs/outputs for Query, Service, and Endpoint layers.   | `Resource`                           | `Contract` (Operations Schemas)    |
| **3. Query Layer**          | **`defineRepository`** | Implements database access logic (CRUD, complex joins). Strictly typed to the contract's query schemas.          | `Resource` + `Contract['query']`     | `Repository` (Data Access Methods) |
| **4. Service Layer**        | **`defineService`**    | Implements business logic, permissions, and orchestration. Connects repositories to the application flow.        | `Repository` + `Contract['service']` | `Service` (Business Methods)       |
| **5. Transport Layer**      | **`defineEndpoint`**   | Implements the HTTP interface (Hono). Handles request parsing and response formatting based on the contract.     | `Service` + `Contract['endpoint']`   | `Hono App` (Router)                |

## Example Flow

### 1. Data Definition (`features/post/table.ts`)

```typescript
export const post = pgTable('post', { ... });
```

### 2. Resource & Contract (`features/post/contract.ts`)

```typescript
// 1. Define Resource (Data Shape)
const postResource = defineResource(post)
    .setUserId('authorId')
    .enableFilters({ status: z.string() })
    .done();

// 2. Define Contract (API Surface)
export const postContract = defineContract(postResource)
    .registerAllStandard() // Adds create, update, list, etc.
    .addOperation('publish', ({ schemas }) => ({
        service: schemas.base.pick({ id: true }),
        endpoint: { json: schemas.base.pick({ id: true }) },
    }))
    .done();
```

### 3. Implementation (Future)

- **Repository**: Uses `postResource` to know _how_ to query the DB and `postContract.query` to validate inputs.
- **Service**: Uses `postContract.service` to validate business inputs and calls the repository.
- **Endpoint**: Uses `postContract.endpoint` to generate Hono validators automatically.
