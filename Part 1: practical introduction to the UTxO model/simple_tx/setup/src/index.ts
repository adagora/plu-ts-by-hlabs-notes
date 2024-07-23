import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
import { Address, harden, TxBuilder, Value, XPrv } from "@harmoniclabs/plu-ts";
import { mnemonicToEntropy } from "bip39";
import { config } from "dotenv";

config();

void (async function main() {
  // extract the (extended) private key from the seed phrase
  const xprv = XPrv.fromEntropy(mnemonicToEntropy(process.env.SEED_PHRASE!));

  // get the default address of the private key
  //
  // payment key at path "m/1852'/1815'/0'/0/0"
  // stake key at path "m/1852'/1815'/0'/2/0"
  const addr = Address.fromXPrv(xprv, "testnet");

  // make sure the addres is the same shown by eternl
  console.log(addr.toString());

  // alternatively you can get the `Address` object
  // from the address string that eternl shows you
  // by calling `Address.fromString`
  //
  // however in this way we don't have access to the private key
  // that we will need to sign transactions later
  // const realAddr = Address.fromString("<your eternl address here>")

  const blockfrost = new BlockfrostPluts({
    projectId: process.env.BLOCKFROST_API_KEY!
  });

  const utxos = await blockfrost.addressUtxos(addr);

  console.log(
    JSON.stringify(
      utxos.map((u) => u.toJson()),
      undefined,
      2
    )
  );

  const bobAddress = Address.fromString(
    "addr_test1qrh86xll3mpepfeqve7d0t6zqkgamm4wee5v3lpxflp73t29tltqc7m3z7wk2fxtj0mm3g89s42cvc7j62qg9rhr0qvspljjhc"
  );
  const txBuilder = new TxBuilder(await blockfrost.getProtocolParameters());

  const tx = txBuilder.buildSync({
    inputs: [{ utxo: utxos[0] }],
    changeAddress: addr,
    outputs: [
      {
        address: bobAddress,
        value: Value.lovelaces(10_000_000)
      }
    ]
  });

  // payment key at path "m/1852'/1815'/0'/0/0"
  const privateKey = xprv
    .derive(harden(1852))
    .derive(harden(1815))
    .derive(harden(0))
    .derive(0)
    .derive(0);

  tx.signWith(privateKey);

  console.log(JSON.stringify(tx.toJson(), undefined, 2));

  await blockfrost.submitTx(tx);

  console.log(tx.hash.toString());
})();
