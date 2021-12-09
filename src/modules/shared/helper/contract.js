import Web3 from 'web3';
import abi from '../../../abi.json';
import paxAbi from '../../../paxAbi.json';
import prntrAbi from '../../../prntrAbi.json';
import { config } from '../../../config';

export const web3 = new Web3(config.provider);

export const contract = new web3.eth.Contract(abi, config.contractAddress);
export const paxContract = new web3.eth.Contract(paxAbi, config.paxAddress);
export const prntrContract = new web3.eth.Contract(prntrAbi, config.prntrAddress);

// Contract functions...
export const getBalance = (address) => {
  return paxContract.methods.balanceOf(address).call();
}
export const getPrntrBalance = (address) => {
  return prntrContract.methods.balanceOf(address).call();
}
export const getAllowance = (address) => {
  return paxContract.methods.allowance(address, config.contractAddress).call();
}
export const approveAmount = (address, amount) => {
  return paxContract.methods.approve(config.contractAddress, amount).send({ from: address });
}
export const deposit = (address, amount) => {
  return contract.methods.deposit(amount).send({ from: address });
}
export const claim = (address) => {
  return contract.methods.claim().send({ from: address });
}
export const getDecimals = () => paxContract.methods.decimals().call();

