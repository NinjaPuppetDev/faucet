"use client";

import FaucetClaim from "./components/FaucetClaim";
import { Providers } from "./providers";

export default function Page() {
  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Mock USDC Faucet
          </h1>
          <p className="text-gray-600 md:text-lg">
            Claim free Mock USDC on the Base Sepolia network. Connect your wallet and get started!
          </p>
        </div>

        <FaucetClaim />
      </div>
    </Providers>
  );
}
