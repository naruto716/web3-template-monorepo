declare module '*.json' {
  interface AbiItem {
    type: string;
    name?: string;
    inputs?: Array<{
      name: string;
      type: string;
      indexed?: boolean;
      components?: unknown[];
      internalType?: string;
    }>;
    outputs?: Array<{
      name: string;
      type: string;
      components?: unknown[];
      internalType?: string;
    }>;
    stateMutability?: string;
    anonymous?: boolean;
  }
  
  interface ContractJson {
    abi: AbiItem[];
    address: string;
  }
  
  const value: ContractJson;
  export default value;
} 