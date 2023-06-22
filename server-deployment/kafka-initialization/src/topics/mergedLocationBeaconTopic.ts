import { log } from '../utils/logger';
import QUERY from '../ksql-queries/joinBeaconLocations';
import { executeKSQL } from '../helpers/topicCreationHelper';

export default async function createJoinedBeaconLocationsTopic (): Promise<void> {
    await executeKSQL(QUERY, 'Merge thingy location/beacon topic');
    log('Merge thingy location/beacon topic created');
};
