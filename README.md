# Cardano Typescript: from beginner to advanced

# Part1. UTXO vs account based

Account Model blockchain keeps track of your funds by associating number to my address.

In UTXO model ADA asset are on utxo, ADA is not associated directly with my address, utxos are associated with my address and my utxos have my ADA.

```bash
10_000 ADA ALICE send 10A to BOB
all utxos has same hash (can be more than 1, e.g 6) because same transaction, but different index, index correspond to order in which output were created in that transaction.
```

signing

```javascript
    witnesses: {

        “vkeyWitnesses”: [

            “vkey”:  “…”, // just public key corresponding to my private key

            “signature”:”…” // signature transaction hash body
        ],
    }
```

# Simple

we use script of any kind, `NativeScript | PlutusScriptV1 | PlutusScriptV2 | PlutusScriptV3` to restrict what transaction can do, impose rules on the transaction. We can really do anything in transaction, there are no limit what transaction can do. If NativeScript suits your case go ahead, is efficient, you do not pay additional fees. PlutusScript is turing complete, so higher fees.
In theory you do not need smart contract, smart contracts are useful if you don't know counter-party or you do not trust counter-party.
contract is having look at transaction and checking if it's respecting given rules.

!important
we do not call the contract when we send funds to contract, the contract (source code) only runs once we e.g spend, when for example, we can sign input from us, and additional input from contract itself and in that case contract is spending that input so it has access to transaction

cardano has deterministic transaction for example we are able evaluate fully the logic of the script before even submitting.
for the same exact onchain logic (plutus script), we have the same hash

```javascript
let tx = txBuilder.buildSync({
  inputs: [
    {
      utxo: utxos[0],
      inputScript: {
        script: script,
        redeemer: new DataI(0)
      }
    }
  ],
  collaterals: [myUtxos[0]],
  changeAddress: addr0
});
```

# Purpose:

different constuctors:
spending and others. We are not limited to only spending.

```javascript
export const PScriptInfo = pstruct({
   // example: mint new token and add rules by which a token can be minted, and so can be created
   Minting: currencySym: PCurrencySymbol.type },
   Spending: {
       // we have access to utxo reference of the utxos we are validating
       utxoRef: PTxOutRef.type,
       // data which is present on utxo, optional in V3
       datum: PMaybe(data).type
   },
   // we can write contract to automatically to withdrawal stake rewards due to staking ADA to pool from L1.
   Rewarding: {stakeCredential: PCredential.type},
   // programmatically validate a given certificate for example certificate for registering stake credential, certificate to delegate your stake, to delegate your vote and more
   // for example if you want to stake ADA you need to register your stake address, first you need to register using Certifying constructor than you need Rewarding to withdrawal your accumulated stake rewards. Usually fields used together if you programaticaly withdrawing stake reward
   Certifying: {
       index: int,
       cert: PCertificate.type
   },
   // programmatically vote on proposal
   Voting: {
       voter: PVoter.type
   },
   // programmatically propose governance actions
   Proposing: {
       index: int,
       proposal: PProposalProcedure.type
   }
})

```

**datum** is some info stored at a utxo, the **redeemer** is the info passed to the validator to unlock the utxo

- `Spend` runs for each UTxO spent from its script address, so it can be executed more than once in a single transaction.
- `Mint` runs once for minting and/or burning tokens of each "collection."
- `Withdraw` runs once for reward withdrawal of each staking scripts.
- `Certifying`, which may or may not run depending on its `DCert`. The two `DCert`s that matter here are:
  1. Registration of a staking credential
  2. De-registration of a staking credential

In order to withdraw from a staking script, it first needs to be registered. This registration requires a deposit of 2 ADA, an amount specified as a protocol parameter (from [https://cexplorer.io/params](https://t.co/rMTtiuFjMq))
This registration transaction does not execute the script. However, de-registering a script requires its validation in order to allow this deposit to be reclaimed.

# DOCS

[docs](https://pluts.harmoniclabs.tech/)

## What is this repo?

here you find an introductory course on how to use [plu-ts](https://github.com/HarmonicLabs/plu-ts), a typescript framework for Cardano smart contracts and an off-chain library for transaction creation.

# eUTxO

an extended version of Bitcoin's UTxO model that introduces the concept of on-chain validators, custom code that can be attached to utxos to enforce rules on how it can be consumed. Validator is just functions that assert that a transaction is valid, make sure all parties in transaction are playing the rules. They do not contain any business logic (no output, no side efffects)

So where is all the business logic?

In Cardano dApps, the magic happens at the moment of **building the transactions**.

Transactions in the utxo model are deterministic (they defined outcome of the interaction). This is quite different to what happens in blockchains that use the alternative "account" model, where transactions describes the "action" that the blockchain node needs to execute.

utxo relies on immutable data structures (UTxO) that encode pieces of ledger state, those structure can only be created or eliminated. Each structure has specific locker attached to it.

To eliminate eUTxO one must prove that he has the key to the locker, typically a signature to prove ownership of the private key corresponding to the public key used a locker.

## eUTxO versus Programmable Accounts

It is common to compare eUTxO with its counterpart based on the notion of programmable accounts.

State of the ledger is still comprised of data structures called accounts, each account is owned by a user
identified with a public key or a program (smart contract). The difference with **eUTxO is that accounts are mutable** and thus, the programmability model is different

While eUTxO scripts serve as validators of state transitions computed statically and depend only on transaction’s local context, most of the stuff with accounts happen in runtime. Whole state of the ledger is involved in transactions and is resolved when transaction is executed (being added to block) and corresponding mutations to that state are computed based on that states dynamically. An ability for one smart contract to call another smart contract in runtime enables composability, making it possible for many different protocols to interoperate.

case UTXO:

initial and final state are known by the time the transaction is formed. Validator script of the store looks up for the next output containing the store’s state, checks that the balance of the store was increased by the fixed amount of coins, the counter of the desired pet was decreased by one and the UTxO is guarded with the same script, so the chain of state transitions can be continually validated. Then it looks for buyer’s output and validates that it received one desired pet.

In the case of account None other transaction effect are known until transaction is executed, on the other hand only the minimal amount of data has to be included into the transaction and thus transited over the network.

In the case of eUTxO the initial and final states of pet store are computed in advance, and the validator script only verifies the transition in runtime. The whole updated state of the pet store has to be included into the transaction, although only part of it actually changed.

**eUTxO is deterministic while requires more data transmition. Account approach is non-deterministic but requires fewer data transmition.**

**_eUTxO requires developers to think in terms of state transitions and validations._**

(**Uniswap V2 in Depth)[**https://mirror.xyz/0x0cf5C6d3c1122504091EAd6a3Dc5BD31f7BbeDE3/BMg6IoBHO8fNuyvmAuSDqjWf3ur-YZEAsNyG-aA1f9Y]

UTxO can be spent one once, this race condition would result in cancellation of many transactions.

to tacle this problem a two phase scheme is used on practice:

- user puts base assets required for an operation into an order and commits in into blockchain
- off-chain service that monitor blockchain and executes orders against actual pool states.
- state sharding e.g A liquidity book pool is modelled as an infinity number of discrete UTxOs each tracking a particular range of bins.
- 1.1 the larger amount of single swap is, the more shards of the pool are required to execute transaction. In extreme cases all of them may not fit one transaction and would require series of transactions.
- 1.2 liquidity provider wants to provide liquidity in wide range bins, again more shards of the pool are required to execute transaction. And again, chain of transaction is required.

Limitation of eUTxO that leads to inefficient utilization of network resources is the requirement to include full version of new state into transaction even if modifications are minimal.

https://spectrum.fi/eutxo_in_production.pdf

https://aiken-lang.org/fundamentals/eutxo
