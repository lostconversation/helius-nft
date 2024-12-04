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
    };
    links?: {
      image?: string;
    };
    json_uri: string;
  };
  authorities?: {
    address: string;
  }[];
  collection?: {
    key: string;
  };
  mutable: boolean;
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
