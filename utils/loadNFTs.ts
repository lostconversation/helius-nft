import { fetchNFTsByOwner, NFTAsset } from "@/utils/helius";
import { isLegitArtist, getLegitArtistName } from "@/utils/legitArtists";

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

export function getDisplayName(creatorId: string): string {
  if (creatorId.startsWith("DRIP: ")) {
    return creatorId.replace("DRIP: ", "");
  }
  if (creatorId.startsWith("LEGIT: ")) {
    return creatorId.replace("LEGIT: ", "");
  }
  return creatorId;
}

const CACHE_KEY_PREFIX = "nft_v22_";

// Clear old cache versions
const clearOldCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const oldCacheKeys = keys.filter(
      (key) => key.startsWith("nft_") && !key.startsWith(CACHE_KEY_PREFIX)
    );
    oldCacheKeys.forEach((key) => localStorage.removeItem(key));
    console.log(`Cleared ${oldCacheKeys.length} old cache entries`);
  } catch (error) {
    console.warn("Failed to clear old cache:", error);
  }
};

// Shared sorting function
export const sortGroupedNFTs = (
  groupedNFTs: GroupedNFTs,
  sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc"
) => {
  console.log(
    `🔀 Sorting ${Object.keys(groupedNFTs).length} artists by ${sortType}`
  );

  // Debug: Show first few artist names
  const artistNames = Object.keys(groupedNFTs);
  console.log("📋 Sample artist names:", artistNames.slice(0, 10));

  const sorted = Object.entries(groupedNFTs).sort(
    ([aKey, aValue], [bKey, bValue]) => {
      switch (sortType) {
        case "quantityDesc":
          return bValue.length - aValue.length;
        case "quantityAsc":
          return aValue.length - bValue.length;
        case "nameAsc":
          // Check if keys start with numbers
          const aStartsWithNumber = /^\d/.test(aKey);
          const bStartsWithNumber = /^\d/.test(bKey);

          // If both start with numbers, sort them alphabetically (as strings)
          if (aStartsWithNumber && bStartsWithNumber) {
            return aKey.localeCompare(bKey);
          }
          // If only one starts with number, put numbers at the very end
          if (aStartsWithNumber && !bStartsWithNumber) {
            return 1; // a goes after b
          }
          if (!aStartsWithNumber && bStartsWithNumber) {
            return -1; // a goes before b
          }
          // Both are letters, use normal alphabetical comparison
          return aKey.localeCompare(bKey);
        case "nameDesc":
          // Check if keys start with numbers
          const aStartsWithNumberDesc = /^\d/.test(aKey);
          const bStartsWithNumberDesc = /^\d/.test(bKey);

          // If both start with numbers, sort them alphabetically (as strings, reverse)
          if (aStartsWithNumberDesc && bStartsWithNumberDesc) {
            return bKey.localeCompare(aKey);
          }
          // If only one starts with number, put numbers at the very end
          if (aStartsWithNumberDesc && !bStartsWithNumberDesc) {
            return 1; // a goes after b
          }
          if (!aStartsWithNumberDesc && bStartsWithNumberDesc) {
            return -1; // a goes before b
          }
          // Both are letters, use reverse alphabetical comparison
          return bKey.localeCompare(aKey);
        default:
          return 0;
      }
    }
  );

  // Debug: Show the first 10 sorted results
  console.log(
    "📊 First 10 sorted results:",
    sorted.slice(0, 10).map(([key]) => key)
  );

  return sorted;
};

export const loadNFTs = async (
  address: string,
  viewType: "created" | "owned",
  sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc",
  typeFilter: "all" | "drip" | "@" | "youtu" | "legit" | "???" | "spam",
  quantityFilter: "all" | ">3" | "1",
  setProgress: (progress: number) => void
): Promise<GroupedNFTs> => {
  // Clear old cache versions
  clearOldCache();

  // Replace @ with at in cache key to avoid URL issues
  const safeFilter = typeFilter === "@" ? "at" : typeFilter;
  const cacheKey = `${CACHE_KEY_PREFIX}${address}_${viewType}_${safeFilter}`;

  // Check if cached data exists
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    console.log("✅ Using cached data for:", typeFilter, "Key:", cacheKey);
    const parsedData = JSON.parse(cachedData);
    console.log(
      "📊 Cached data has",
      Object.keys(parsedData).length,
      "artists"
    );
    setProgress(100);
    return parsedData;
  }

  if (!address) return {};
  console.log("🔄 Fetching fresh data for:", typeFilter, "Key:", cacheKey);

  // Set initial progress
  setProgress(5);

  const fetchedNFTs = await fetchNFTsByOwner(address, viewType);
  console.log("📥 Fetched NFTs:", fetchedNFTs.length);

  // Set progress after fetch
  setProgress(20);

  const totalNFTs = fetchedNFTs.length;
  let processedNFTs = 0;

  // Filter NFTs based on typeFilter
  let atSymbolCount = 0;
  const filteredNFTs = fetchedNFTs.filter((nft) => {
    processedNFTs++;
    setProgress(20 + Math.floor((processedNFTs / totalNFTs) * 60));

    const creatorId = getCreatorIdentifier(nft);
    const creatorIdStr = String(creatorId);
    const isDrip = creatorIdStr.startsWith("DRIP:");
    const isAtSymbol = creatorIdStr.startsWith("@");
    const isYoutu = creatorIdStr.toLowerCase().startsWith("youtu");
    const isLegit = isLegitArtist(nft);

    // Debug logging for @ filter
    if (typeFilter === "@") {
      if (processedNFTs <= 10) {
        console.log(
          `🔍 NFT ${processedNFTs}: Creator ID = "${creatorIdStr}", isAtSymbol = ${isAtSymbol}`
        );
      }
      if (isAtSymbol) {
        atSymbolCount++;
      }
    }

    const creatorNFTs = fetchedNFTs.filter(
      (n) => getCreatorIdentifier(n) === creatorId
    );
    const isClaim = nft?.content?.metadata?.name?.startsWith("Claim");
    const isSpam =
      (creatorNFTs.length >= 3 &&
        !isDrip &&
        !isAtSymbol &&
        !isYoutu &&
        !isLegit) ||
      isClaim;

    switch (typeFilter) {
      case "drip":
        return isDrip;
      case "@":
        return isAtSymbol;
      case "youtu":
        return isYoutu;
      case "legit":
        return isLegit;
      case "spam":
        return isSpam;
      case "???":
        return !isDrip && !isAtSymbol && !isYoutu && !isLegit && !isSpam;
      default:
        return true;
    }
  });

  // Debug logging after filtering
  if (typeFilter === "@") {
    console.log(
      `📊 @ Filter complete: Found ${atSymbolCount} NFTs with @ creators`
    );
  }

  setProgress(80);

  // Group and sort the filtered NFTs
  const tempGrouped = filteredNFTs.reduce((acc: GroupedNFTs, nft) => {
    const creatorId = getCreatorIdentifier(nft);
    if (!acc[creatorId]) {
      acc[creatorId] = [];
    }
    acc[creatorId].push(nft);
    return acc;
  }, {});

  setProgress(90);
  const sortedGrouped = sortGroupedNFTs(tempGrouped, sortType);
  const result = Object.fromEntries(sortedGrouped);

  // Cache the result
  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
    console.log("💾 Cached result for:", typeFilter);
  } catch (error) {
    console.warn("Failed to cache data:", error);
  }

  setProgress(100);
  return result;
};

export const getCreatorIdentifier = (nft: NFTAsset): string => {
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
  if (nft.content.metadata.symbol) return nft.content.metadata.symbol;
  if (nft.authorities?.[0]?.address) return nft.authorities[0].address;

  // Use creator_hash as fallback instead of leaf_id
  if (nft.compression?.creator_hash) {
    const hash = nft.compression.creator_hash;
    return `${hash.slice(0, 4)}...`;
  }

  return "Unknown";
};
