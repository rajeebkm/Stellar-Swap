import {
    Keypair,
    SorobanRpc,
    TransactionBuilder,
    Asset,
    Operation,
    LiquidityPoolAsset,
    getLiquidityPoolId,
    BASE_FEE,
    Networks
} from '@stellar/stellar-sdk';

import fetch from 'node-fetch';

async function fundAccountWithFriendbot(address) {
    const friendbotUrl = `https://friendbot.stellar.org?addr=${address}`;
    try {
        let response = await fetch(friendbotUrl);
        if (response.ok) {
            console.log(`Account ${address} successfully funded.`);
            return true;
        } else {
            console.log(`Something went wrong funding account: ${address}.`);
            return false;
        }
    } catch (error) {
        console.error(`Error funding account ${address}:`, error);
        return false;
    }
}
