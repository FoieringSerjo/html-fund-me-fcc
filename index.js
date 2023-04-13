//note: in nodejs require(), in front-end javascript we can't use require, instead import.
import { ethers } from './ethers-5.1.esm.min.js'; // https://cdn.ethers.io/lib/ethers-5.1.esm.min.js
import { abi, contractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const balanceButton = document.getElementById('balanceButton');
const withdrawButton = document.getElementById('withdrawButton');

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.log(error);
    }
    connectButton.innerHTML = 'Connected';
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    // console.log(accounts);
  } else {
    connectButton.innerHTML = 'Please install MetaMask';
  }
}

async function getBalance() {
  if (typeof window.ethereum != 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function fund() {
  const ethAmount = document.getElementById('ethAmount').value;
  console.log(`Funding with ${ethAmount}`);
  if (typeof window.ethereum !== 'undefined') {
    // provider / connection to the blockchain
    // signer / wallet/ someone with gas
    // contract that we are interacting with
    // ^ ABI & Address
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // Listen for the tx to be mined
      // Listen for an event
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Done!');
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  // listen for transaction finish: https://docs.ethers.org/v5/api/providers/provider/#Provider--event-methods
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function withdraw() {
  if (typeof window.ethereum != 'undefined') {
    console.log('Withdrawing...');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}
