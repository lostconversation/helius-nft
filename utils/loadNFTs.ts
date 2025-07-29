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

// Helper function to determine if an artist is a Drip artist
export function isDripArtist(creatorId: string): boolean {
  const creatorIdStr = String(creatorId);
  const isDrip = creatorIdStr.startsWith("DRIP:");
  const isAtArtist = creatorIdStr.endsWith(" @");
  const isBase58Drip = creatorIdStr.length >= 40 && !creatorIdStr.includes(" ");
  const result = isDrip || isAtArtist || isBase58Drip;

  // Debug logging for @ artists
  if (creatorIdStr.includes("@")) {
    console.log(
      `🔍 isDripArtist check: "${creatorIdStr}" -> isDrip: ${isDrip}, isAtArtist: ${isAtArtist}, isBase58: ${isBase58Drip}, result: ${result}`
    );
  }

  return result;
}

export function getDisplayName(creatorId: string): string {
  if (creatorId.startsWith("DRIP: ")) {
    return creatorId.replace("DRIP: ", "");
  }
  if (creatorId.startsWith("LEGIT: ")) {
    return creatorId.replace("LEGIT: ", "");
  }
  // Handle @ artists - move @ to the end and capitalize
  if (creatorId.startsWith("@")) {
    const nameWithoutAt = creatorId.slice(1); // Remove the @
    const capitalizedName =
      nameWithoutAt.charAt(0).toUpperCase() + nameWithoutAt.slice(1); // Capitalize first letter
    return `${capitalizedName} @`;
  }
  // Handle base58 names (40+ char without spaces) - truncate to first 4 chars + "..."
  if (creatorId.length >= 40 && !creatorId.includes(" ")) {
    return `${creatorId.slice(0, 4)}...`;
  }
  // Handle custom artist names (they should be displayed as-is)
  if (
    creatorId.includes("Superteam") ||
    creatorId.includes("SMB") ||
    creatorId.includes("Faceless") ||
    creatorId.includes("mooar.com") ||
    creatorId.includes("3.land") ||
    creatorId.includes("E3zH") ||
    creatorId.includes("monmonmon") ||
    creatorId.includes("MADhouse") ||
    creatorId.includes("Poetonic") ||
    creatorId.includes("thenetworkstate.com")
  ) {
    return creatorId;
  }
  return creatorId;
}

const CACHE_KEY_PREFIX = "nft_v30_"; // Force cache refresh for custom artist names

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
      // Use display names for sorting to handle @ artists correctly
      const aDisplayName = getDisplayName(aKey);
      const bDisplayName = getDisplayName(bKey);

      switch (sortType) {
        case "quantityDesc":
          return bValue.length - aValue.length;
        case "quantityAsc":
          return aValue.length - bValue.length;
        case "nameAsc":
          // Check if display names start with numbers
          const aStartsWithNumber = /^\d/.test(aDisplayName);
          const bStartsWithNumber = /^\d/.test(bDisplayName);

          // If both start with numbers, sort them alphabetically (as strings)
          if (aStartsWithNumber && bStartsWithNumber) {
            return aDisplayName.localeCompare(bDisplayName);
          }
          // If only one starts with number, put numbers at the very end
          if (aStartsWithNumber && !bStartsWithNumber) {
            return 1; // a goes after b
          }
          if (!aStartsWithNumber && bStartsWithNumber) {
            return -1; // a goes before b
          }
          // Both are letters, use normal alphabetical comparison
          return aDisplayName.localeCompare(bDisplayName);
        case "nameDesc":
          // Check if display names start with numbers
          const aStartsWithNumberDesc = /^\d/.test(aDisplayName);
          const bStartsWithNumberDesc = /^\d/.test(bDisplayName);

          // If both start with numbers, sort them alphabetically (as strings, reverse)
          if (aStartsWithNumberDesc && bStartsWithNumberDesc) {
            return bDisplayName.localeCompare(aDisplayName);
          }
          // If only one starts with number, put numbers at the very end
          if (aStartsWithNumberDesc && !bStartsWithNumberDesc) {
            return 1; // a goes after b
          }
          if (!aStartsWithNumberDesc && bStartsWithNumberDesc) {
            return -1; // a goes before b
          }
          // Both are letters, use reverse alphabetical comparison
          return bDisplayName.localeCompare(aDisplayName);
        default:
          return 0;
      }
    }
  );

  // Debug: Show the first 10 sorted results
  console.log(
    "📊 First 10 sorted results:",
    sorted.slice(0, 10).map(([key]) => getDisplayName(key))
  );

  return sorted;
};

export const loadNFTs = async (
  address: string,
  viewType: "created" | "owned",
  sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc",
  typeFilter: "all" | "drip" | "youtu" | "legit" | "???" | "spam",
  quantityFilter: "all" | ">3" | "1",
  setProgress: (progress: number) => void
): Promise<GroupedNFTs> => {
  // Clear old cache versions
  clearOldCache();

  // Use typeFilter directly for cache key
  const safeFilter = typeFilter;
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

  // Debug: Log what we're about to fetch

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
  console.log(
    `🔍 Starting filtering for ${typeFilter} with ${fetchedNFTs.length} NFTs`
  );

  const filteredNFTs = fetchedNFTs.filter((nft) => {
    processedNFTs++;
    setProgress(20 + Math.floor((processedNFTs / totalNFTs) * 60));

    const creatorId = getCreatorIdentifier(nft);
    const creatorIdStr = String(creatorId);
    const isDrip = creatorIdStr.startsWith("DRIP:");
    // Check original address for @ symbol, not the transformed name
    const originalAddress = nft.authorities?.[0]?.address;
    const isAtSymbol = originalAddress?.startsWith("@");
    const isYoutu = creatorIdStr.toLowerCase().startsWith("youtu");
    const isLegit = isLegitArtist(nft);

    const creatorNFTs = fetchedNFTs.filter(
      (n) => getCreatorIdentifier(n) === creatorId
    );
    const isClaim = nft?.content?.metadata?.name?.startsWith("Claim");

    // Check if it's a base58 name (40+ char without spaces)
    const isBase58 = creatorIdStr.length >= 40 && !creatorIdStr.includes(" ");

    const isSpam =
      (creatorNFTs.length >= 3 &&
        !isDrip &&
        !isAtSymbol &&
        !isYoutu &&
        !isLegit &&
        !isBase58) || // Exclude base58 names from spam
      isClaim;

    // Debug: Log filtering decision for first few NFTs
    if (processedNFTs <= 5) {
      console.log(
        `🔍 NFT ${processedNFTs}: Creator ID = "${creatorIdStr}", typeFilter = ${typeFilter}, isDrip = ${isDrip}, isAtSymbol = ${isAtSymbol}, isSpam = ${isSpam}`
      );
    }

    switch (typeFilter) {
      case "all":
        // Show all NFTs EXCEPT spam
        return !isSpam;
      case "drip":
        // Show OG Drip artists (that start with "DRIP: "), @ artists (ending with " @"), and base58 names
        const shouldIncludeDrip = isDripArtist(creatorIdStr);

        // Debug logging for drip filter
        if (processedNFTs <= 10) {
          console.log(
            `🔍 Drip NFT ${processedNFTs}: Creator ID = "${creatorIdStr}", shouldInclude = ${shouldIncludeDrip}`
          );
        }

        // Log ALL Drip items (not just first 10)
        if (shouldIncludeDrip) {
          console.log(`✅ Drip Item: "${creatorIdStr}" (isDripArtist: true)`);
        }

        return shouldIncludeDrip;
      case "youtu":
        return isYoutu;
      case "legit":
        return isLegit;
      case "spam":
        // Log ALL Spam items to see what's being included
        if (isSpam) {
          console.log(
            `🚨 Spam Item: "${creatorIdStr}" (isDrip: ${isDrip}, isAtSymbol: ${isAtSymbol}, isYoutu: ${isYoutu}, isLegit: ${isLegit}, isBase58: ${isBase58}, isClaim: ${isClaim})`
          );
        }
        return isSpam;
      case "???":
        return !isDrip && !isAtSymbol && !isYoutu && !isLegit && !isSpam;
      default:
        return true;
    }
  });

  // Debug logging after filtering
  console.log(
    `📊 ${typeFilter} Filter complete: ${filteredNFTs.length} NFTs passed the filter`
  );

  if (typeFilter === "all") {
    const spamCount = fetchedNFTs.filter((nft) => {
      const creatorId = getCreatorIdentifier(nft);
      const creatorIdStr = String(creatorId);
      const isDrip = creatorIdStr.startsWith("DRIP:");
      const originalAddress = nft.authorities?.[0]?.address;
      const isAtSymbol = originalAddress?.startsWith("@");
      const isYoutu = creatorIdStr.toLowerCase().startsWith("youtu");
      const isLegit = isLegitArtist(nft);
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
      return isSpam;
    }).length;
    console.log(
      `📊 All Filter complete: Excluded ${spamCount} spam NFTs, ${filteredNFTs.length} NFTs remaining`
    );
  }

  if (typeFilter === "drip") {
    const dripCount = filteredNFTs.filter((nft) => {
      const creatorId = getCreatorIdentifier(nft);
      return creatorId.startsWith("DRIP:");
    }).length;
    const atCount = filteredNFTs.filter((nft) => {
      const creatorId = getCreatorIdentifier(nft);
      return creatorId.endsWith(" @");
    }).length;
    console.log(
      `📊 Drip Filter complete: Found ${dripCount} OG Drip artists, ${atCount} @ artists (${filteredNFTs.length} total)`
    );
  }

  setProgress(80);

  // Group and sort the filtered NFTs
  const tempGrouped = filteredNFTs.reduce((acc: GroupedNFTs, nft) => {
    let creatorId = getCreatorIdentifier(nft);

    // For legit artists, use the custom artist name if available
    if (typeFilter === "legit") {
      const customName = getLegitArtistName(nft);
      if (customName) {
        console.log(
          `🎨 Custom artist detected: "${creatorId}" -> "${customName}"`
        );
        creatorId = customName;
      }
    }

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
  if (nft.authorities?.[0]?.address) {
    const address = nft.authorities[0].address;
    // Check if it starts with @ and move it to the end
    if (address.startsWith("@")) {
      const nameWithoutAt = address.slice(1); // Remove the @
      const capitalizedName =
        nameWithoutAt.charAt(0).toUpperCase() + nameWithoutAt.slice(1); // Capitalize first letter
      return `${capitalizedName} @`;
    }
    return address;
  }

  // Use creator_hash as fallback instead of leaf_id
  if (nft.compression?.creator_hash) {
    const hash = nft.compression.creator_hash;
    return `${hash.slice(0, 4)}...`;
  }

  return "Unknown";
};
