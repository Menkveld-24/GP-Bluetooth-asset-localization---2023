import type whitelistEntry from '@app/interfaces/WhitelistEntryInterface';
import ksql from '@serviceproviders/KsqlServiceProvider';
import config from '@utils/appConfig';
import { log } from '@utils/logger';
import { type Response } from 'ksqldb-client';

export async function getWhitelist (): Promise<whitelistEntry[]> {
    const response: Response = await ksql.query(`SELECT MAC, WHITELISTED FROM ${config.ksql.whitelistTable};`);

    if (response.status !== 200) log('Something went wrong while fetching the whitelist!', response);
    return response.data?.rows as whitelistEntry[];
}
