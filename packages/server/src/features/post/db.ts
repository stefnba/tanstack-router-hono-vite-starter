import { post } from '@app/server/db/tables';
import { TableOperationsBuilder } from '@app/server/lib/db/operation';

export const postQueries = new TableOperationsBuilder(post);
