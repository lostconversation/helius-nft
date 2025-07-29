const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

if (!HELIUS_API_KEY) {
  console.error("Missing HELIUS_API_KEY in environment variables");
}

const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export interface NFTAsset {
  id: string;
  content: {
    metadata: {
      name: string;
      symbol: string;
      description: string;
      image: string;
      uri: string;
      attributes?: {
        trait_type: string;
        value: string;
      }[];
      properties?: {
        creators?: {
          address: string;
          share: number;
          verified?: boolean;
        }[];
        files?: {
          uri: string;
          type: string;
        }[];
      };
    };
    links?: {
      image?: string;
      animation_url?: string;
      external_url?: string;
    };
    json_uri: string;
  };
  authorities?: {
    address: string;
    scopes?: string[];
  }[];
  collection?: {
    key: string;
    name?: string;
    family?: string;
  };
  mutable: boolean;
  compression?: {
    compressed: boolean;
    leaf_id: string;
    tree_id: string;
    creator_hash?: string;
    data_hash?: string;
    asset_hash?: string;
    tree?: string;
    seq?: number;
  };
}

export async function fetchNFTsByOwner(
  ownerAddress: string,
  type: "owned" | "created" = "owned"
): Promise<NFTAsset[]> {
  try {
    const response = await fetch(heliusUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "helius-test",
        method: type === "owned" ? "getAssetsByOwner" : "getAssetsByCreator",
        params: {
          [type === "owned" ? "ownerAddress" : "creatorAddress"]: ownerAddress,
        },
      }),
    });

    const data = await response.json();

    if (!data.result) {
      console.error("No result in the response", data);
      return [];
    }

    return data.result.items || [];
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
}
