import { fetchNFTsByOwner, NFTAsset } from "@/utils/helius";

interface GroupedNFTs {
  [symbol: string]: NFTAsset[];
}

// Image URL transformation utilities
export function getImageUrl(url: string): string {
  if (!url) return "";

  // Remove @ symbol if it exists at the start of the URL
  if (url.startsWith("@")) {
    url = url.substring(1);
  }

  // Handle IPFS URLs
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  // Handle Arweave URLs
  if (url.startsWith("ar://")) {
    return url.replace("ar://", "https://arweave.net/");
  }

  return url;
}

const CACHE_KEY_PREFIX = "nfts_cache_";

// Shared sorting function
export const sortGroupedNFTs = (
  groupedNFTs: GroupedNFTs,
  sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc"
) => {
  return Object.entries(groupedNFTs).sort(([aKey, aValue], [bKey, bValue]) => {
    switch (sortType) {
      case "quantityDesc":
        return bValue.length - aValue.length;
      case "quantityAsc":
        return aValue.length - bValue.length;
      case "nameAsc":
        return aKey.localeCompare(bKey);
      case "nameDesc":
        return bKey.localeCompare(aKey);
      default:
        return 0;
    }
  });
};

export const loadNFTs = async (
  address: string,
  viewType: "created" | "owned",
  sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc",
  typeFilter: "all" | "drip" | "@" | "youtu" | "???" | "spam",
  quantityFilter: "all" | ">3" | "1",
  setProgress: (progress: number) => void
): Promise<GroupedNFTs> => {
  const cacheKey = `${CACHE_KEY_PREFIX}${address}_${viewType}_${typeFilter}`;

  // Check if cached data exists
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    console.log("Using cached NFTs data");
    return JSON.parse(cachedData);
  }

  if (!address) return {};
  console.log("Fetching NFTs for address:", address);
  const fetchedNFTs = await fetchNFTsByOwner(address, viewType);
  console.log("Fetched NFTs:", fetchedNFTs);

  // Simulate progress update
  const totalNFTs = fetchedNFTs.length;
  let loadedNFTs = 0;

  const filteredNFTs = fetchedNFTs.filter((nft) => {
    loadedNFTs++;
    setProgress(Math.floor((loadedNFTs / totalNFTs) * 100));

    const creatorId = getCreatorIdentifier(nft);

    // Type filter
    if (typeFilter !== "all") {
      const isDrip = creatorId.startsWith("DRIP:");
      const isAtSymbol = creatorId.startsWith("@");
      const isYoutu = creatorId.toLowerCase().startsWith("youtu");
      const isLongName = creatorId.length >= 20;

      if (
        (typeFilter === "drip" && !isDrip) ||
        (typeFilter === "@" && !isAtSymbol) ||
        (typeFilter === "youtu" && !isYoutu) ||
        (typeFilter === "???" && !isLongName) ||
        (typeFilter === "spam" &&
          (isDrip || isAtSymbol || isYoutu || isLongName))
      ) {
        return false;
      }
    }

    // Quantity filter
    const creatorNFTs = fetchedNFTs.filter(
      (n) => getCreatorIdentifier(n) === creatorId
    );
    if (quantityFilter === ">3" && creatorNFTs.length <= 3) {
      return false;
    }
    if (quantityFilter === "1" && creatorNFTs.length !== 1) {
      return false;
    }

    return true;
  });

  console.log("Filtered NFTs:", filteredNFTs);
  const tempGrouped = filteredNFTs.reduce((acc: GroupedNFTs, nft) => {
    const creatorId = getCreatorIdentifier(nft);
    if (!acc[creatorId]) {
      acc[creatorId] = [];
    }
    acc[creatorId].push(nft);
    return acc;
  }, {});

  console.log("Grouped NFTs by creator:", tempGrouped);

  // Apply sorting based on sortType
  const sortedGrouped = sortGroupedNFTs(tempGrouped, sortType);

  console.log("Sorted grouped NFTs:", sortedGrouped);
  const groupedNFTs = Object.fromEntries(sortedGrouped);

  // Cache the result
  localStorage.setItem(cacheKey, JSON.stringify(groupedNFTs));

  return groupedNFTs;
};

const getCreatorIdentifier = (nft: NFTAsset): string => {
  const dripHausUrl = nft.content.links?.external_url;
  const isDripProject =
    dripHausUrl?.startsWith("https://drip.haus/") ||
    dripHausUrl === "https://drip.haus";
  const dripArtist = isDripProject ? dripHausUrl?.split("/").pop() : null;
  if (isDripProject) return `DRIP: ${dripArtist || "drip.haus"}`;
  if (dripHausUrl) {
    return dripHausUrl
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");
  }
  const artistAttribute = nft.content.metadata.attributes?.find(
    (attr) => attr.trait_type?.toLowerCase() === "artist"
  );
  if (artistAttribute?.value) return artistAttribute.value;
  if (nft.compression?.leaf_id) return nft.compression.leaf_id;
  if (nft.content.metadata.symbol) return nft.content.metadata.symbol;
  return nft.authorities?.[0]?.address || "Unknown";
};
