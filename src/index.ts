import {
  ICosmosWalletOptions,
  IRandomBytesFunc,
  IKeyStore,
  IFormatAddressFunc
} from "./types";
import * as utils from "./utils";
import { DEFAULT_DERIVATION_PATH } from "./defaults";

class CosmosWallet {
  public derivationPath: string;
  public randomBytesFunc: IRandomBytesFunc;
  public formatAddress: IFormatAddressFunc;
  public keystore: IKeyStore;
  public password: string;
  public name: string;

  constructor(opts: ICosmosWalletOptions) {
    this.derivationPath = opts.derivationPath || DEFAULT_DERIVATION_PATH;
    this.randomBytesFunc =
      opts.randomBytesFunc || utils.standardRandomBytesFunc;
    this.formatAddress = opts.formatAddress || utils.formatCosmosAddress;

    if (!opts.password) {
      throw new Error("Password is required");
    }

    this.password = opts.password;

    if (!opts.name) {
      throw new Error("Name is required");
    }

    this.name = opts.keystore ? opts.keystore.name : opts.name || "";

    if (opts.keystore && opts.password) {
      const check = utils.testPassword(opts.keystore, opts.password);
      if (!check) {
        throw new Error("Keystore password is incorrect");
      }
    }

    if (opts.keystore && opts.seed) {
      throw new Error("Can't generate wallet with both keystore and seed");
    }

    this.keystore =
      opts.keystore ||
      (opts.seed
        ? utils.importWalletFromSeed(
            this.name,
            this.password,
            opts.seed,
            this.derivationPath,
            this.formatAddress
          )
        : utils.createNewWallet(
            this.name,
            this.password,
            this.derivationPath,
            this.randomBytesFunc,
            this.formatAddress
          ));
  }

  set address(value) {
    // empty
  }

  get address() {
    return this.keystore.address;
  }

  sign(message: string) {
    const walletJson = utils.openKeystore(this.keystore, this.password);
    const signature = utils.signWithPrivateKey(message, walletJson.privateKey);
    return signature;
  }

  export(password: string) {
    if (!password) {
      throw new Error("Password is required");
    }
    const walletJson = utils.openKeystore(this.keystore, this.password);
    const keystore = utils.createKeystore(this.name, this.password, walletJson);
    return keystore;
  }
}

export default CosmosWallet;
