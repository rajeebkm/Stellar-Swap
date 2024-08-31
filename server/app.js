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

async function runDeFiOperations() {
    const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
    const defiKeypair = Keypair.random();
    console.log("DeFi Provider Public Key:", defiKeypair.publicKey());
    await fundAccountWithFriendbot(defiKeypair.publicKey());
    const defiAccount = await server.getAccount(defiKeypair.publicKey());
    const nexusAsset = new Asset('Nexus', defiKeypair.publicKey());
    const lpAsset = new LiquidityPoolAsset(Asset.native(), nexusAsset, 30);
    const liquidityPoolId = getLiquidityPoolId('constant_product',
        lpAsset).toString('hex');

    console.log("Custom Asset:", nexusAsset);
    console.log("Liquidity Pool Asset:", lpAsset);
    console.log("Liquidity Pool ID:", liquidityPoolId);

    const lpDepositTransaction = new TransactionBuilder(defiAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
    })
        .addOperation(Operation.changeTrust({
            asset: lpAsset
        }))
        .addOperation(Operation.liquidityPoolDeposit({
            liquidityPoolId: liquidityPoolId,
            maxAmountA: '100',
            maxAmountB: '100',
            minPrice: { n: 1, d: 1 },
            maxPrice: { n: 1, d: 1 }
        }))
        .setTimeout(30)
        .build();
    lpDepositTransaction.sign(defiKeypair);
    try {
        const result = await server.sendTransaction(lpDepositTransaction);
        console.log("Liquidity Pool Created. Transaction URL:",
            `https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    } catch (error) {

        console.log(`Error creating Liquidity Pool: ${error}`);
        return;
    }
}

runDeFiOperations().catch(console.error);

