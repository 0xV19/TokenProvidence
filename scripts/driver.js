// [1] Don't want to hold bnb in your own wallet for tests?
// A neat little trick: You can simulate transactions from any address without private key!
// Just find an address with large bnb reserve and use it to simulate transactions.


const { ethers } = require("ethers");
const utils = require("./utils.js")
const config = require("../config/config.js")
const tp_abi = require('../abi/tokenProvidence.json');
const fs = require('fs');
const fetch = require('node-fetch');

module.exports = class SafeChecks {
    constructor(providerNode){
        console.log("Node: ", providerNode)
        
        // if(ipc)
        //     this.provider = new ethers.providers.IpcProvider(providerNode);
        // else
        //     this.provider = new ethers.providers.WebSocketProvider(providerNode);

        this.provider = ethers.getDefaultProvider(providerNode)
            
        this.tpContactAddress = utils.readJson(config.address_f)['tpContactAddress']
        this.tpContract = new ethers.utils.Interface(tp_abi);
        
        let walletNames = config.walletNames //can use multiple wallets
        this.walletName = config.walletName //which wallet to use  
        this.bnbReserveAddress = config.bnbReserveAddress //A neat little trick explained in [1]

        this.loadWallets(walletNames)
        this.initNonces(walletNames)
        this.verified = []

    }

    async initNonces(walletNames){
        this.baseNonces = {}
        this.nonceOffsets = {}
        for(var i=0; i<walletNames.length; i++){
            let walletName = walletNames[i];
            this.baseNonces[walletName] = this.provider.getTransactionCount(this.wallets[walletName]['address']);
            this.nonceOffsets[walletName] = 0;
            // console.log("Nonce for: ", walletName, " is: ", this.baseNonces[walletName])
        }
    }

    getNonce(walletName) {
        return this.baseNonces[walletName].then((nonce) => (nonce + (this.nonceOffsets[walletName]++)));
    }

    loadWallets(walletNames){
        this.wallets = {}
        let keys = utils.readJson(config.privatekey_f)
        for(var i=0; i<walletNames.length; i++){
            let walletName = walletNames[i];
            this.wallets[walletName] = {
                "address": keys[walletName]['walletaddress'],
                "wallet": new ethers.Wallet(keys[walletName]['privatekey']),
                "walletWithProvider": new ethers.Wallet(keys[walletName]['privatekey'], this.provider),
            }
            console.log("Loading wallet: ", walletName)
        }
    }
    
    tokenToleranceCheck = async(tokenAddress, ethIn, tolerance) => {
        console.log("TESTING [tokenToleranceCheck]: ", tokenAddress)

        var processedData = this.tpContract.encodeFunctionData(
            'tokenToleranceCheck', [tokenAddress, ethIn, tolerance]
        );
        var checkTxn = {
            from: this.bnbReserveAddress,
            to: this.tpContactAddress,
            data: processedData,
            value: ethIn,
            gasPrice: ethers.BigNumber.from(config.gasPrice),
            gasLimit: ethers.BigNumber.from(config.gasLimit), //for txn fee scam check              
        }
        try{
            // let result = await this.wallets[this.motherWalletName]['walletWithProvider'].call(checkTxn);
            let result = await this.provider.call(checkTxn);
            console.log("SAFE [tokenToleranceCheck]")
            return result;
        }
        catch{
            console.log("UNSAFE [tokenToleranceCheck]")
            return false;
        }
    }

    checkInternalFee = async(tokenAddress, ethIn, tolerance) => {
        console.log("TESTING [checkInternalFee]: ", tokenAddress)

        var processedData = this.tpContract.encodeFunctionData(
            'checkInternalFee', [tokenAddress, ethIn, tolerance]
        );
        var checkTxn = {
            from: this.bnbReserveAddress,
            to: this.tpContactAddress,
            data: processedData,
            value: ethIn,
            gasPrice: ethers.BigNumber.from(config.gasPrice),
            gasLimit: ethers.BigNumber.from(config.gasLimit), //for txn fee scam check            
        }
        try{
            let result = await this.provider.call(checkTxn);
            console.log("SAFE [checkInternalFee]")
            return result;
        }
        catch{
            console.log("UNSAFE [checkInternalFee]")
            return false;
        }
    }   
    

    async makeTransaction(wallet, rawTransaction, provider){
        let signedTransaction = await wallet.signTransaction(rawTransaction).catch(
                                    e => console.log('Error: ', e.message)
                                );
        console.log("--------------SENDING TRANSACTION---------------")
        let responseTransaction = await provider.sendTransaction(signedTransaction).catch(
                                console.log
                                );
        console.log("responseTransaction===========")
        console.log(responseTransaction)
        // console.log("Hash: ","https://bscscan.com/tx/"+responseTransaction.hash)
        // console.log("Hash: ","https://testnet.bscscan.com/tx/"+responseTransaction.hash) //too lazy to check
    }    

    approve = async(tokenAddress, gasPrice, gasLimit) => {
        //this is not a simulation, an actual call. 
        //Here just for showcasing an example + maybe debugging purposes.

        console.log("Approving [approve]: ", tokenAddress)

        var processedData = this.tpContract.encodeFunctionData(
            'approve', [tokenAddress]
        );
        var nonce = await this.getNonce(this.walletName)
        var approveTxn = {
            from: this.wallets[this.walletName]['address'],
            to: this.tpContactAddress,
            data: processedData,
            value: "0x",
            chainId: config.chainId,
            gasPrice: ethers.BigNumber.from(gasPrice),
            gasLimit: ethers.BigNumber.from(gasLimit),  
            nonce: nonce,          

        }
        console.log(approveTxn)
        let wallet = this.wallets[this.walletName]['wallet'];
        await this.makeTransaction(wallet, approveTxn, this.provider);
    }      
    

    isVerified = async(tokenAddress) => {
        return new Promise((resolve, reject)=>{
            if(this.verified.includes[tokenAddress]){
                resolve("coin is verified")
                return 
            }
            try{
                fetch('https://api.bscscan.com/api?module=contract&action=getsourcecode&address=' + tokenAddress + '&apikey=' + config.bsc_scan_api_key)
                .then(res => res.json())
                .then((json) => {
                    let result = json['result'][0]['ABI']
                    if(result===undefined||result.toString() === "Contract source code not verified"){
                        reject(tokenAddress+ ": not verified")
                        return
                    }
                    else{
                        this.verified.push(tokenAddress)
                        resolve(tokenAddress+ ": is verified");
                    }
                        })
                .catch((e)=>{reject(e)}) 
            }
            catch(e){
                reject(tokenAddress+ ": not verified")
            }
        })
    }        


}