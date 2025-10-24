// app/rainbowKitConfig.ts
"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";

// require the env var (fail fast so you see the error during startup)
const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
if (!wcProjectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set in .env.local");
}

export const config = getDefaultConfig({
  appName: "Plateau Faucet",
  projectId: wcProjectId,
  chains: [baseSepolia],
  ssr: true,
});
