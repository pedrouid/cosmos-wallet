import { fromHex } from '@cosmjs/encoding';
import { makeSignDoc, makeAuthInfoBytes } from '@cosmjs/proto-signing';

import Wallet from '../src';

import {
  TEST_COSMOS_ADDRESS,
  TEST_COSMOS_AMINO_SIGNATURE,
  TEST_COSMOS_CHAIN_REFERENCE,
  TEST_COSMOS_DIRECT_SIGNATURE,
  TEST_COSMOS_INPUTS,
  TEST_COSMOS_KEYPAIR,
} from './shared/';

describe('Wallet', () => {
  let wallet: Wallet;
  beforeAll(async () => {
    wallet = await Wallet.init(TEST_COSMOS_KEYPAIR.privateKey);
  });
  it('getAccounts', async () => {
    const result = await wallet.getAccounts();
    expect(result).toBeTruthy();
    expect(result[0].address).toEqual(TEST_COSMOS_ADDRESS);
    expect(result[0].algo).toEqual('secp256k1');
  });
  it('signDirect', async () => {
    const signerAddress = TEST_COSMOS_ADDRESS;
    const {
      fee,
      pubkey,
      gasLimit,
      accountNumber,
      sequence,
      bodyBytes,
    } = TEST_COSMOS_INPUTS.direct;
    const authInfoBytes = makeAuthInfoBytes(
      [pubkey as any],
      fee,
      gasLimit,
      sequence
    );
    const signDoc = makeSignDoc(
      fromHex(bodyBytes),
      authInfoBytes,
      TEST_COSMOS_CHAIN_REFERENCE,
      accountNumber
    );
    const result = await wallet.signDirect(signerAddress, signDoc);
    expect(result).toBeTruthy();
    expect(result.signature.signature).toEqual(TEST_COSMOS_DIRECT_SIGNATURE);
  });
  it('signAmino', async () => {
    const signerAddress = TEST_COSMOS_ADDRESS;
    const signDoc = TEST_COSMOS_INPUTS.amino;
    const result = await wallet.signAmino(signerAddress, signDoc);
    expect(result).toBeTruthy();
    expect(result.signature.signature).toEqual(TEST_COSMOS_AMINO_SIGNATURE);
  });
});