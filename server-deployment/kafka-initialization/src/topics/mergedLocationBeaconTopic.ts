import { log } from '../utils/logger';
import query from '../ksql-queries/joinBeaconLocations';
import { executeKSQL } from '../helpers/topicCreationHelper';

export default async function createJoinedBeaconLocationsTopic (): Promise<void> {
    await executeKSQL(query.QUERY, query.options, 'Merge thingy location/beacon topic');
    log('Merge thingy location/beacon topic created');
};
