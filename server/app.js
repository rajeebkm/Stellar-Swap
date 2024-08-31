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
    
    // lpDepositTransaction
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

    // lpSwapTransaction
    const traderKeypair = Keypair.random();
    console.log("Trader Public Key:", traderKeypair.publicKey());
    await fundAccountWithFriendbot(traderKeypair.publicKey());
    const traderAccount = await server.getAccount(traderKeypair.publicKey());
    const pathPaymentTransaction = new TransactionBuilder(traderAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
    })
        .addOperation(Operation.changeTrust({
            asset: nexusAsset,
            source: traderKeypair.publicKey()
        }))
        .addOperation(Operation.pathPaymentStrictReceive({
            sendAsset: Asset.native(),
            sendMax: '1000',
            destination: traderKeypair.publicKey(),
            destAsset: nexusAsset,
            destAmount: '50',
            source: traderKeypair.publicKey()
        }))
        .setTimeout(30)
        .build();

    pathPaymentTransaction.sign(traderKeypair);
    try {
        const result = await server.sendTransaction(pathPaymentTransaction);
        console.log("Swap Performed. Transaction URL:",
            `https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    } catch (error) {
        console.log(`Error performing swap: ${error}`);
    }

    // lpWithdrawTransaction
    const lpWithdrawTransaction = new TransactionBuilder(defiAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
    })
        .addOperation(Operation.liquidityPoolWithdraw({
            liquidityPoolId: liquidityPoolId,
            amount: '50',
            minAmountA: '0',
            minAmountB: '0'
        }))
        .setTimeout(30)
        .build();
    lpWithdrawTransaction.sign(defiKeypair);
    try {
        const result = await server.sendTransaction(lpWithdrawTransaction);
        console.log("Withdrawal Successful. Transaction URL:",
            `https://stellar.expert/explorer/testnet/tx/${result.hash}`);

    } catch (error) {
        console.log(`Error withdrawing from Liquidity Pool: ${error}`);
    }

}

runDeFiOperations().catch(console.error);

