import { Table } from 'drizzle-orm';
import z from 'zod';

import { InferTableSchema } from '@shared/lib/db/drizzle/types';
import { SCHEMA_KEYS } from '@shared/lib/resource/builder';
import { AnyZodArray, AnyZodObject, AnyZodShape } from '@shared/lib/validation/zod/types';

export type ResourceBuilderConfig<T extends Table> = {
    table: T;
    raw: RawTableShapes<T>;
    base: AnyZodShape;
    userId: AnyZodShape;
    id: AnyZodShape;

    updateData: AnyZodShape;
    createData: AnyZodShape;
    returnCols: AnyZodShape;

    filters: AnyZodShape;
    pagination: AnyZodShape;
    ordering: AnyZodArray;
};

export type RawTableShapes<T extends Table> = {
    create: InferTableSchema<T, 'insert'>['shape'];
    select: InferTableSchema<T, 'select'>['shape'];
    update: InferTableSchema<T, 'update'>['shape'];
};

export type DrizzleResourceBuilderReturn = {
    base: AnyZodObject;
    rawTable: {
        create: AnyZodObject;
        select: AnyZodObject;
        update: AnyZodObject;
    };
    returnCols: AnyZodObject;
    operation: {
        create: {
            [SCHEMA_KEYS.input]: AnyZodObject;
            [SCHEMA_KEYS.data]: AnyZodObject;
        };
        update: {
            [SCHEMA_KEYS.input]: AnyZodObject;
            [SCHEMA_KEYS.data]: AnyZodObject;
            [SCHEMA_KEYS.identifiers]: AnyZodObject;
        };
        getMany: {
            [SCHEMA_KEYS.input]: AnyZodObject;
            [SCHEMA_KEYS.identifiers]: AnyZodObject;
            [SCHEMA_KEYS.pagination]: z.ZodOptional<AnyZodObject>;
            [SCHEMA_KEYS.filters]: AnyZodObject;
            [SCHEMA_KEYS.ordering]: AnyZodArray;
        };
        getById: {
            [SCHEMA_KEYS.identifiers]: AnyZodObject;
        };
    };
    identifier: {
        userId: AnyZodObject;
        otherIds: AnyZodObject;
    };
};
