import { Table } from 'drizzle-orm';

import { InferTableSchema } from '@app/shared/lib/db/drizzle/types';
import { SCHEMA_KEYS } from '@app/shared/lib/resource/builder';
import {
    AnyZodArray,
    AnyZodObject,
    AnyZodShape,
    AnyZodType,
} from '@app/shared/lib/validation/zod/types';

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
    keys: {
        userId: string;
        ids: string[];
    };
    schemas: {
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
};

export type AnyDrizzleResourceBuilderReturn<R extends DrizzleResourceBuilderReturn> = {
    table: R['table'];
    keys: {
        userId: R['keys']['userId'];
        ids: R['keys']['ids'];
    };
    schemas: {
        base: R['schemas']['base'];
        rawTable: {
            create: R['schemas']['rawTable']['create'];
            select: R['schemas']['rawTable']['select'];
            update: R['schemas']['rawTable']['update'];
        };
        returnCols: R['schemas']['returnCols'];
        operation: {
            // create
            create: {
                [SCHEMA_KEYS.input]: R['schemas']['operation']['create'][typeof SCHEMA_KEYS.input];
                [SCHEMA_KEYS.data]: R['schemas']['operation']['create'][typeof SCHEMA_KEYS.data];
            };
            createMany: {
                [SCHEMA_KEYS.input]: R['schemas']['operation']['createMany'][typeof SCHEMA_KEYS.input];
                [SCHEMA_KEYS.data]: R['schemas']['operation']['createMany'][typeof SCHEMA_KEYS.data];
            };
            // update
            updateById: {
                [SCHEMA_KEYS.input]: R['schemas']['operation']['updateById'][typeof SCHEMA_KEYS.input];
                [SCHEMA_KEYS.data]: R['schemas']['operation']['updateById'][typeof SCHEMA_KEYS.data];
                [SCHEMA_KEYS.identifiers]: R['schemas']['operation']['updateById'][typeof SCHEMA_KEYS.identifiers];
            };
            // get
            getMany: {
                [SCHEMA_KEYS.input]: R['schemas']['operation']['getMany']['input'];
                [SCHEMA_KEYS.identifiers]: R['schemas']['operation']['getMany'][typeof SCHEMA_KEYS.identifiers];
                [SCHEMA_KEYS.pagination]: R['schemas']['operation']['getMany'][typeof SCHEMA_KEYS.pagination];
                [SCHEMA_KEYS.filters]: R['schemas']['operation']['getMany'][typeof SCHEMA_KEYS.filters];
                [SCHEMA_KEYS.ordering]: R['schemas']['operation']['getMany'][typeof SCHEMA_KEYS.ordering];
            };
            getById: {
                [SCHEMA_KEYS.input]: R['schemas']['operation']['getById'][typeof SCHEMA_KEYS.input];
                [SCHEMA_KEYS.identifiers]: R['schemas']['operation']['getById'][typeof SCHEMA_KEYS.identifiers];
            };
            // remove
            removeById: {
                [SCHEMA_KEYS.input]: R['schemas']['operation']['removeById'][typeof SCHEMA_KEYS.input];
                [SCHEMA_KEYS.identifiers]: R['schemas']['operation']['removeById'][typeof SCHEMA_KEYS.identifiers];
            };
        };
        identifier: {
            userId: R['schemas']['identifier']['userId'];
            otherIds: R['schemas']['identifier']['otherIds'];
        };
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
