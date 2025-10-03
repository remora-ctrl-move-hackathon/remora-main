import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useMemo } from "react";

export const useAptos = () => {
  const aptos = useMemo(() => {
    const config = new AptosConfig({ network: Network.TESTNET });
    return new Aptos(config);
  }, []);

  return { aptos };
};
