"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import faucetAbi from "../abis/MockUSDCFaucet.json";
import erc20Abi from "../abis/MockERC20.json";

const FAUCET_ADDRESS = "0xf2335e995494c1b7d24e6d94ae30A8970fE45706";
const MOCK_USDC_ADDRESS = "0x0dFA97F1d8b29e366bbf08Fa253e82d9272a1f03";
const BASE_SEPOLIA_CHAIN_ID = 84532;
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

export default function FaucetClaim() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [networkWarning, setNetworkWarning] = useState<string>("");

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (err) {
      console.error("Wallet connect failed:", err);
    }
  };

  // Get provider: MetaMask first, fallback to JSON-RPC
  const getProvider = () => {
    if (typeof window !== "undefined" && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum as any);
    }
    return new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  };

  // Auto-switch to Base Sepolia network
  const switchToBaseSepolia = async () => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          { chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` } as any, // TS-safe
        ],
      });
      return true;
    } catch (err: any) {
      console.error("Network switch failed:", err);
      setNetworkWarning("⚠️ Please switch your wallet manually to Base Sepolia.");
      return false;
    }
  };

  // Fetch USDC balance
  const fetchBalance = async () => {
    if (!isConnected || !address) return;
    try {
      const provider = getProvider();
      const token = new ethers.Contract(MOCK_USDC_ADDRESS, erc20Abi, provider);
      const bal = await token.balanceOf(address);
      setBalance(ethers.formatUnits(bal, 6));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalance("0");
    }
  };

  // Claim faucet
  const claimUSDC = async () => {
    if (!isConnected || !address || !window.ethereum) return alert("Connect your wallet first!");
    setLoading(true);
    setNetworkWarning("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const network = await provider.getNetwork();

      if (Number(network.chainId) !== BASE_SEPOLIA_CHAIN_ID) {
        setNetworkWarning("⚠️ Wrong network. Switching to Base Sepolia...");
        const switched = await switchToBaseSepolia();
        if (!switched) {
          setLoading(false);
          return;
        }
        setNetworkWarning("");
      }

      const signer = await provider.getSigner();
      const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signer);
      const tx = await faucet.claim();
      await tx.wait();

      setClaimed(true);
      await fetchBalance();
    } catch (err) {
      console.error("Faucet claim failed:", err);
      setNetworkWarning("❌ Failed to claim. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) fetchBalance();
  }, [isConnected, address]);

  // Truncate wallet address safely
  const truncateAddress = (addr: string | undefined) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg flex flex-col gap-6">
      <h2 className="text-center text-2xl font-bold text-gray-800">Mock USDC Faucet</h2>

      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          {networkWarning && (
            <p className="text-center text-orange-500 font-semibold">{networkWarning}</p>
          )}

          <button
            onClick={claimUSDC}
            disabled={loading || claimed}
            className={`w-full py-3 font-bold rounded-lg transition ${
              claimed
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {loading ? "Claiming..." : claimed ? "Already Claimed" : "Claim 1000 Mock USDC"}
          </button>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-2 break-words">
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">Wallet:</span>{" "}
              <span className="font-mono">{truncateAddress(address)}</span>
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">Balance:</span>{" "}
              <span className="font-mono">{balance} Mock USDC</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
