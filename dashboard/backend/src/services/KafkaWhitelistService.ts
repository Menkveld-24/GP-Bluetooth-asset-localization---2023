import { encodeKey, encodeValue, produce, whitelistProducer } from '@serviceproviders/KafkaServiceProvider';
import { log } from '@utils/logger';

export async function addToWhitelist (mac: string): Promise<boolean> {
    const key = await encodeKey({
        mac
    });
    const value = await encodeValue({
        mac,
        whitelisted: true
    });

    const produced = await produce(whitelistProducer, key, value);
    if (!produced) {
        log(`Failed to whitelist ${mac}`);
        return false;
    }

    log(`Whitelisted ${mac}`);
    return true;
}

export async function removeFromWhitelist (mac: string): Promise<boolean> {
    const key = await encodeKey({
        mac
    });
    const value = await encodeValue({
        mac,
        whitelisted: false
    });

    // const key = JSON.stringify({
    //     mac
    // });
    // const value = JSON.stringify({
    //     mac,
    //     whitelisted: false
    // });

    const produced = await produce(whitelistProducer, key, value);
    if (!produced) {
        log(`Failed to remove ${mac} from whitelist`);
        return false;
    }

    log(`Removed ${mac} from whitelist`);
    return true;
}
