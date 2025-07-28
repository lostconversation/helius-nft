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

const CACHE_KEY_PREFIX = "nft_";

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
        // Check if keys start with numbers
        const aStartsWithNumber = /^\d/.test(aKey);
        const bStartsWithNumber = /^\d/.test(bKey);

        // If both start with numbers or both don't, use normal comparison
        if (aStartsWithNumber === bStartsWithNumber) {
          return aKey.localeCompare(bKey);
        }
        // Put numbers at the end
        return aStartsWithNumber ? 1 : -1;
      case "nameDesc":
        // Check if keys start with numbers
        const aStartsWithNumberDesc = /^\d/.test(aKey);
        const bStartsWithNumberDesc = /^\d/.test(bKey);

        // If both start with numbers or both don't, use normal comparison
        if (aStartsWithNumberDesc === bStartsWithNumberDesc) {
          return bKey.localeCompare(aKey);
        }
        // Put numbers at the end
        return aStartsWithNumberDesc ? 1 : -1;
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
  const cacheKey = `${CACHE_KEY_PREFIX}${address}_${viewType}_${typeFilter}_${sortType}`;

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
      // Ensure creatorId is a string
      const creatorIdStr = String(creatorId);
      const isDrip = creatorIdStr.startsWith("DRIP:");
      const isAtSymbol = creatorIdStr.startsWith("@");
      const isYoutu = creatorIdStr.toLowerCase().startsWith("youtu");
      const isLongName = creatorIdStr.length >= 20;

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
  try {
    localStorage.setItem(cacheKey, JSON.stringify(groupedNFTs));
  } catch (error) {
    console.warn("Failed to cache NFTs data:", error);
    // If localStorage is full, try to clear old cache entries
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));
      if (cacheKeys.length > 10) {
        // Remove oldest cache entries
        cacheKeys.slice(0, 5).forEach((key) => localStorage.removeItem(key));
        // Try to cache again
        localStorage.setItem(cacheKey, JSON.stringify(groupedNFTs));
      }
    } catch (clearError) {
      console.warn("Failed to clear cache:", clearError);
    }
  }

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
