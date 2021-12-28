# Token Providence
On-chain Health-check for ERC-20 tokens without wasting gas.

 **WARNING:** I provide no guarantee of even a single line of code in this repo. The code hasn't even been tested properly, it's merely an extract from my much larger project. Everything is extra here except ```contracts/TokenProvidence.sol```. Reading that alone should be enough for a little experienced people. For the beginners, I present various js scripts and test scripts for help. 

Alpha reveal: On-Chain token checks for:

1. Honeypots: You buy but can't sell.

2. Internal Fee Scams: You buy but there is a huge internal fee (very common during sniping, not particularly a scam but a feature you might want to combat)

3. Buy redirectors: You buy but tokens get redirected to some other address (similar to 2.)

4. Transaction Fee scams: A very high transaction fee (combat this by not setting a very high gasLimit)

5. Off-Chain: A simple check for "verified" tokens on bscscan. Very slow but useful for code-analysis. (Machine learning applications here)

All of the above, instead of sending a real transaction, simulate the run using the `call` method on the real-time chain update, thereby costing you 0 gas (but a little time before actual transaction, through usually always within blocktime for bsc, easily within blocktime for eth, no tests for other chains for now). Simulating transactions is a cool neat trick, have fun! (Much more advance methods exist for simulating dependencies between transactions, `call` can only simulate a single txn with no dependency whatsoever, this is not an ideal case in many MEVs).

tldr: Simulate a contract call that buys, approves and sells a token within a single transaction to detect if the token is a honeypot or if it has some very high internal fee.

#### A cool trivial trick:

[1] Don't want to hold bnb in your own wallet for tests? A neat little trick: You can simulate transactions from any address without private key! Just find an address with large bnb reserve and use it to simulate transactions.

## Mainnet vs Testnet
Everything is in perspective of bsc but can be easily mimicked to eth.
Following changes needs to be made between the testnet and mainnet:

1. Contract: `TokenProvidence.sol`: Line [42-43] (different keccak256) and line [107-114] different PCS router and factory addresses.

2. `TokenProvidence_Mainnet.sol` and `TokenProvidence_Testnet.sol` exist for easy switch.

2. Web3: `config.js`: Different `chainId` and `node`. 

## ```private_key.json``` format:
```
{
    "TESTWALLET": {   
        "walletaddress":"0x...",
        "privatekey":""
    },
    "Some other wallet": {
        "walletaddress":"0x...",
        "privatekey":"..."
    }    
}
```

## ```addresses.json``` format:
```
{
    "tpContactAddress":"0x..."
}
```

## Files:
- `tests/run.js`: Run tests, this is the entry point.
- `scripts/driver.js`: Web3js interactions with the contract.
- `scripts/utils.js`: Some simple utilities.
- `config/config.js`: Configuration for gas price, addresses and more.
- `config/addresses.json`: Contains the deployed contract address.
- `config/private_key.json`: Your private key(s)
- `contracts/TokenProvidence.sol`: The generic contract file.
- `contracts/TokenProvidence_Mainnet.sol`: The contract file for mainnet.
- `contracts/TokenProvidence_Testnet.sol`: The contract file for testnet.
- `abi/tokenProvidence.json`: abi for the contract, get this after contract compilation. I usually just use the [Remix IDE](https://remix-project.org/).

## How to deploy contract?
There are various ways, but I usually use [Remix IDE](https://remix-project.org/). Deploying on mainnet will cost gas, use testnet for learning and testing purposes. Use the [faucet](https://testnet.binance.org/faucet-smart) to get tokens on the testnet.

## Config.js
- Get BSCScan API [here](https://bscscan.com/apis).

## Support
I provide none, feel free to raise pull requests or issues though, might be helpful.


<img src="important/very_important.jpeg" alt="vvvvImporant" style="width:300px;"/>
