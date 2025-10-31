import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/contract';

export const useWallet = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [userAccount, setUserAccount] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const browserProvider = new BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletSigner = await browserProvider.getSigner();
        const account = await walletSigner.getAddress();

        setProvider(browserProvider);
        setSigner(walletSigner);
        setUserAccount(account);
        setConnected(true);

        if (CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x') {
          const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, walletSigner);
          setContract(contractInstance);
        } else {
          setError('Please deploy the contract first and update the contract address.');
        }
      } else {
        setError('Please install MetaMask to use this application');
        setConnected(false);
      }
    } catch (err: any) {
      console.error('Error connecting to wallet:', err);
      setError('Failed to connect to wallet');
      setConnected(false);
    }
  };

  useEffect(() => {
    connectWallet();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setConnected(false);
          setUserAccount(null);
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    provider,
    signer,
    contract,
    userAccount,
    connected,
    error,
    connectWallet,
  };
};
