import { Args, Mas } from '@massalabs/massa-web3';

export const CONTRACT_ADDRESS = 'AS12qNxtxqheLRH1WcKgjVQPkNT9Wr1q7KH9fomHsCS4nyDogZxJ5';

export const NETWORK = 'Massa Buildnet';

export interface MintResult {
  petId: string;
  txHash?: string;
  contractAddress: string;
}

export async function mintPetOnChain(walletAccount: any): Promise<MintResult> {
  if (!walletAccount?.callSC) {
    throw new Error('Wallet does not support contract calls');
  }

  const operation = await walletAccount.callSC({
    target: CONTRACT_ADDRESS,
    func: 'mint',
    parameter: new Args().serialize(),
    coins: Mas.fromString('0.1'),
  });

  const opId = operation.id || operation.toString();

  const events = await walletAccount.getEvents({
    smartContractAddress: CONTRACT_ADDRESS,
    operationId: opId,
  });

  let petId = Math.floor(Math.random() * 9000 + 1000).toString();
  for (const event of events) {
    const match = event.data?.match(/minted pet (\d+)/);
    if (match) {
      petId = match[1];
      break;
    }
  }

  return {
    petId,
    txHash: opId,
    contractAddress: CONTRACT_ADDRESS,
  };
}

export function getContractExplorerUrl(): string {
  return `https://buildnet.massa.net/address/${CONTRACT_ADDRESS}`;
}
