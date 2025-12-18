import { Table } from 'drizzle-orm';

import { InferTableSchema } from '../../lib/db/drizzle/types';
import { SCHEMA_KEYS } from '../../lib/resource/builder';
import { AnyZodArray, AnyZodObject, AnyZodShape, AnyZodType } from '../../lib/validation/zod/types';

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
    table: Table;
    base: AnyZodObject;
    rawTable: {
        create: AnyZodObject;
        select: AnyZodObject;
        update: AnyZodObject;
    };
    returnCols: AnyZodObject;
    operation: {
        // create
        create: {
            [SCHEMA_KEYS.input]: AnyZodObject;
            [SCHEMA_KEYS.data]: AnyZodObject;
        };
        createMany: {
            [SCHEMA_KEYS.input]: AnyZodObject;
            [SCHEMA_KEYS.data]: AnyZodArray;
        };
        // update
        updateById: {
            [SCHEMA_KEYS.input]: AnyZodObject;
            [SCHEMA_KEYS.data]: AnyZodObject;
            [SCHEMA_KEYS.identifiers]: AnyZodObject;
        };
        // get
        getMany: {
            [SCHEMA_KEYS.input]: AnyZodObject;
            [SCHEMA_KEYS.identifiers]: AnyZodObject;
            [SCHEMA_KEYS.pagination]: AnyZodObject;
            [SCHEMA_KEYS.filters]: AnyZodObject;
            [SCHEMA_KEYS.ordering]: AnyZodArray;
        };
        getById: {
            [SCHEMA_KEYS.input]: AnyZodObject;
            [SCHEMA_KEYS.identifiers]: AnyZodType;
        };
        // remove
        removeById: {
            [SCHEMA_KEYS.input]: AnyZodObject;
            [SCHEMA_KEYS.identifiers]: AnyZodObject;
        };
    };
    identifier: {
        userId: AnyZodObject;
        otherIds: AnyZodObject;
    };
};

export type AnyDrizzleResourceBuilderReturn<R extends DrizzleResourceBuilderReturn> = {
    table: R['table'];
    base: R['base'];
    rawTable: {
        create: R['rawTable']['create'];
        select: R['rawTable']['select'];
        update: R['rawTable']['update'];
    };
    returnCols: R['returnCols'];
    operation: {
        // create
        create: {
            [SCHEMA_KEYS.input]: R['operation']['create'][typeof SCHEMA_KEYS.input];
            [SCHEMA_KEYS.data]: R['operation']['create'][typeof SCHEMA_KEYS.data];
        };
        createMany: {
            [SCHEMA_KEYS.input]: R['operation']['createMany'][typeof SCHEMA_KEYS.input];
            [SCHEMA_KEYS.data]: R['operation']['createMany'][typeof SCHEMA_KEYS.data];
        };
        // update
        updateById: {
            [SCHEMA_KEYS.input]: R['operation']['updateById'][typeof SCHEMA_KEYS.input];
            [SCHEMA_KEYS.data]: R['operation']['updateById'][typeof SCHEMA_KEYS.data];
            [SCHEMA_KEYS.identifiers]: R['operation']['updateById'][typeof SCHEMA_KEYS.identifiers];
        };
        // get
        getMany: {
            [SCHEMA_KEYS.input]: R['operation']['getMany']['input'];
            [SCHEMA_KEYS.identifiers]: R['operation']['getMany'][typeof SCHEMA_KEYS.identifiers];
            [SCHEMA_KEYS.pagination]: R['operation']['getMany'][typeof SCHEMA_KEYS.pagination];
            [SCHEMA_KEYS.filters]: R['operation']['getMany'][typeof SCHEMA_KEYS.filters];
            [SCHEMA_KEYS.ordering]: R['operation']['getMany'][typeof SCHEMA_KEYS.ordering];
        };
        getById: {
            [SCHEMA_KEYS.input]: R['operation']['getById'][typeof SCHEMA_KEYS.input];
            [SCHEMA_KEYS.identifiers]: R['operation']['getById'][typeof SCHEMA_KEYS.identifiers];
        };
        // remove
        removeById: {
            [SCHEMA_KEYS.input]: R['operation']['removeById'][typeof SCHEMA_KEYS.input];
            [SCHEMA_KEYS.identifiers]: R['operation']['removeById'][typeof SCHEMA_KEYS.identifiers];
        };
    };
    identifier: {
        userId: R['identifier']['userId'];
        otherIds: R['identifier']['otherIds'];
    };
};

/**
 * Compile-time test: Ensures PreservedResourceTypes matches DrizzleResourceBuilderReturn structure
 */
type _StructureCheck =
    AnyDrizzleResourceBuilderReturn<DrizzleResourceBuilderReturn> extends DrizzleResourceBuilderReturn
        ? DrizzleResourceBuilderReturn extends AnyDrizzleResourceBuilderReturn<DrizzleResourceBuilderReturn>
            ? true
            : 'PreservedResourceTypes has extra keys'
        : 'PreservedResourceTypes is missing keys from DrizzleResourceBuilderReturn';

// This should equal 'true', otherwise you'll get a descriptive error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _assertStructure: _StructureCheck = true;
