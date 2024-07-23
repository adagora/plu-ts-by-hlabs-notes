# Cardano Typescript: from beginner to advanced

# Part1. UTXO vs account based

account model blockchain keeps track of your funds by associating number to my address.

UTXO model ada are on utxos, ada not associated directly with my address, utxos are associated with my address and my utxos have my ada.

10_000ALICE ADA send 10A to BOB
all utxos has same hash (can be more than 1, e.g 6) because same transaction, but different index, index correspond to order in which output were created in that transaction.

signing

```bash
    witnesses: {

        “vkeyWitnesses”: [

            “vkey”:  “…”, // just public key corresponding to my private key

            “signature”:”…” // signature transaction hash body
        ],
    }
```

## What is this repo?

here you find an introductory course on how to use [plu-ts](https://github.com/HarmonicLabs/plu-ts), a typescript framework for Cardano smart contracts and an off-chain library for transaction creation.
