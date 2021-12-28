const { ethers } = require("ethers");
const config = require("../config/config.js")
const Driver = require("../scripts/driver.js")

const NODE = config.node //TestNet
const driver = new Driver(NODE)

const gasPrice = "10000000001"
const gasLimit = "1000000"
const BUSDtokenAddress_testnet = "0x8301f2213c0eed49a7e28ae4c3e91722919b8b47" //busd @testnet, we run tests for this.
const BUSDtokenAddress_mainnet = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
const ethIn = ethers.utils.parseUnits("0.0001", "ether")
const tolerance = ethers.utils.parseUnits("0.0000001", "ether")

driver.tokenToleranceCheck(BUSDtokenAddress_testnet, ethIn, tolerance)
driver.checkInternalFee(BUSDtokenAddress_testnet, ethIn, tolerance)
driver.approve(BUSDtokenAddress_testnet, gasPrice, gasLimit)
driver.isVerified(BUSDtokenAddress_mainnet) //busd @mainnet (no api for testnet ig?)