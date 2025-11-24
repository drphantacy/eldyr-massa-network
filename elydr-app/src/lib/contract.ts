export const CONTRACT_ADDRESS = 'AS12qNxtxqheLRH1WcKgjVQPkNT9Wr1q7KH9fomHsCS4nyDogZxJ5';

export const NETWORK = 'Massa Buildnet';

export interface MintResult {
  petId: string;
  txHash?: string;
  contractAddress: string;
}

export async function mintPetOnChain(walletAccount: any): Promise<MintResult> {
  const petId = Math.floor(Math.random() * 9000 + 1000).toString();

  // For demo: simulate blockchain delay
  // In production: use walletAccount.callSC() to call the contract
  await new Promise(resolve => setTimeout(resolve, 2000));

  // TODO: Real implementation would be:
  // const operation = await walletAccount.callSC({
  //   targetAddress: CONTRACT_ADDRESS,
  //   targetFunction: 'mint',
  //   parameter: [],
  //   coins: 100000000n, // 0.1 MAS in nanoMAS
  // });
  // await operation.waitFinal();

  return {
    petId,
    txHash: `tx_${Date.now().toString(36)}`,
    contractAddress: CONTRACT_ADDRESS,
  };
}

export function getContractExplorerUrl(): string {
  return `https://buildnet.massa.net/address/${CONTRACT_ADDRESS}`;
}
