import { fetchNFTsByOwner, NFTAsset } from "@/utils/helius";

interface GroupedNFTs {
  [symbol: string]: NFTAsset[];
}

// ============================================================================
// CUSTOM ARTIST DEFINITIONS - MANUALLY UPDATED CONTENT
// ============================================================================

// Custom artist definitions with different rule types
export interface CustomArtist {
  name: string;
  ruleType: "creatorId" | "nftNameStartsWith" | "anyContains";
  value: string | string[]; // The value to match against (can be array for multiple keywords)
  exclude?: string[]; // Optional array of exact names to exclude
}

export const customArtists: CustomArtist[] = [
  {
    name: "Solana Ecosystem Call",
    ruleType: "nftNameStartsWith",
    value: "Solana Ecosystem Call",
  },
  {
    name: "Superteam",
    ruleType: "anyContains",
    value: ["superteam", "red hoodie"],
    exclude: ["SuperteamDAO Loot Box", "Superteam Member NFT"],
  },
  {
    name: "Faceless",
    ruleType: "nftNameStartsWith",
    value: "Faceless",
  },
  {
    name: "SMB Raffle",
    ruleType: "nftNameStartsWith",
    value: "SMB Raffle Ticket",
  },
  {
    name: "SMB Monke",
    ruleType: "nftNameStartsWith",
    value: "SMB Gen3",
  },
  {
    name: "E3zH...",
    ruleType: "creatorId",
    value: "E3zHh78ujEffBETguxjVnqPP9Ut42BCbbxXkdk9YQjLC",
  },
  {
    name: "thenetworkstate.com",
    ruleType: "creatorId",
    value: "thenetworkstate.com",
  },
];

// ============================================================================
// END CUSTOM ARTIST DEFINITIONS
// ============================================================================

// ============================================================================
// DRIP ARTIST DEFINITIONS - MANUALLY UPDATED CONTENT
// ============================================================================

// Additional Drip artists that should get the badge
export const additionalDripArtists = [
  "mooar.com",
  "3.land",
  "MADhouse",
  "monmonmon",
  "Poetonic",
];

// Hard exclusions - artists that should NEVER be in Drip
export const dripExclusions = [
  "blogs.shyft",
  // Add more exclusions here as needed
];

// ============================================================================
// END DRIP ARTIST DEFINITIONS
// ============================================================================

// Helper functions for custom artists
export function getCustomArtistName(
  creatorId: string,
  nftName?: string
): string | null {
  // Remove "LEGIT:" prefix if present
  const cleanCreatorId = creatorId.replace(/^LEGIT:\s*/, "");

  for (const artist of customArtists) {
    if (artist.ruleType === "creatorId") {
      const value = Array.isArray(artist.value)
        ? artist.value[0]
        : artist.value;
      if (cleanCreatorId.startsWith(value)) {
        return artist.name;
      }
    } else if (artist.ruleType === "nftNameStartsWith") {
      const value = Array.isArray(artist.value)
        ? artist.value[0]
        : artist.value;
      if (nftName && nftName.startsWith(value)) {
        return artist.name;
      }
    } else if (artist.ruleType === "anyContains") {
      // Handle both single string and array of strings
      const values = Array.isArray(artist.value)
        ? artist.value
        : [artist.value];

      // Check both creatorId and nftName for any of the values
      const creatorContains = values.some((value) =>
        cleanCreatorId.toLowerCase().includes(value.toLowerCase())
      );
      const nftContains =
        nftName &&
        values.some((value) =>
          nftName.toLowerCase().includes(value.toLowerCase())
        );

      // Check if this NFT should be excluded
      const shouldExclude =
        artist.exclude &&
        nftName &&
        artist.exclude.some(
          (excludeName) => nftName.toLowerCase() === excludeName.toLowerCase()
        );

      if ((creatorContains || nftContains) && !shouldExclude) {
        return artist.name;
      }
    }
  }
  return null;
}

export function isCustomArtist(creatorId: string, nftName?: string): boolean {
  return getCustomArtistName(creatorId, nftName) !== null;
}

// ============================================================================
// LEGIT ARTIST FUNCTIONS
// ============================================================================

export function getLegitArtistName(nft: any): string | null {
  try {
    // Use the same logic as getCreatorIdentifier
    const dripHausUrl = nft.content.links?.external_url;
    const isDripProject =
      dripHausUrl?.startsWith("https://drip.haus/") ||
      dripHausUrl === "https://drip.haus";
    const dripArtist = isDripProject ? dripHausUrl?.split("/").pop() : null;

    let creatorId;
    if (isDripProject) {
      creatorId = `DRIP: ${dripArtist || "drip.haus"}`;
    } else if (dripHausUrl) {
      creatorId = dripHausUrl
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "");
    } else {
      const artistAttribute = nft.content.metadata.attributes?.find(
        (attr: any) => attr.trait_type?.toLowerCase() === "artist"
      );
      if (artistAttribute?.value) {
        creatorId = artistAttribute.value;
      } else if (nft.content.metadata.symbol) {
        creatorId = nft.content.metadata.symbol;
      } else if (nft.authorities?.[0]?.address) {
        const address = nft.authorities[0].address;
        // Check if it starts with @ and move it to the end
        if (address.startsWith("@")) {
          const nameWithoutAt = address.slice(1); // Remove the @
          const capitalizedName =
            nameWithoutAt.charAt(0).toUpperCase() + nameWithoutAt.slice(1); // Capitalize first letter
          creatorId = `${capitalizedName} @`;
        } else {
          creatorId = address;
        }
      } else if (nft.compression?.creator_hash) {
        const hash = nft.compression.creator_hash;
        creatorId = `${hash.slice(0, 4)}...`;
      } else {
        creatorId = "Unknown";
      }
    }

    if (!creatorId) return null;

    const nftName = nft?.content?.metadata?.name;
    const result = getCustomArtistName(creatorId, nftName);
    return result;
  } catch (error) {
    console.warn("Error checking legit artist:", error);
    return null;
  }
}

export function isLegitArtist(nft: any): boolean {
  try {
    // Use the same logic as getCreatorIdentifier
    const dripHausUrl = nft.content.links?.external_url;
    const isDripProject =
      dripHausUrl?.startsWith("https://drip.haus/") ||
      dripHausUrl === "https://drip.haus";
    const dripArtist = isDripProject ? dripHausUrl?.split("/").pop() : null;

    let creatorId;
    if (isDripProject) {
      creatorId = `DRIP: ${dripArtist || "drip.haus"}`;
    } else if (dripHausUrl) {
      creatorId = dripHausUrl
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "");
    } else {
      const artistAttribute = nft.content.metadata.attributes?.find(
        (attr: any) => attr.trait_type?.toLowerCase() === "artist"
      );
      if (artistAttribute?.value) {
        creatorId = artistAttribute.value;
      } else if (nft.content.metadata.symbol) {
        creatorId = nft.content.metadata.symbol;
      } else if (nft.authorities?.[0]?.address) {
        const address = nft.authorities[0].address;
        // Check if it starts with @ and move it to the end
        if (address.startsWith("@")) {
          const nameWithoutAt = address.slice(1); // Remove the @
          const capitalizedName =
            nameWithoutAt.charAt(0).toUpperCase() + nameWithoutAt.slice(1); // Capitalize first letter
          creatorId = `${capitalizedName} @`;
        } else {
          creatorId = address;
        }
      } else if (nft.compression?.creator_hash) {
        const hash = nft.compression.creator_hash;
        creatorId = `${hash.slice(0, 4)}...`;
      } else {
        creatorId = "Unknown";
      }
    }

    if (!creatorId) return false;

    const nftName = nft?.content?.metadata?.name;
    const result = isCustomArtist(creatorId, nftName);
    return result;
  } catch (error) {
    console.warn("Error checking if legit artist:", error);
    return false;
  }
}

// ============================================================================
// END LEGIT ARTIST FUNCTIONS
// ============================================================================

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

  // For URLs without file extensions, try to add a default image type
  if (url && !url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i)) {
    // If it's a URL that looks like it should be an image but has no extension,
    // we'll keep it as is since Next.js should handle it
    // console.log("🖼️ Image URL without extension:", url);
  }

  // Handle Superteam membership URLs that might redirect
  if (url.includes("superteam-nft-membership.vercel.app")) {
    // console.log("🖼️ Superteam membership URL detected:", url);
    // Try to force direct image loading by adding image-specific parameters
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}format=png&direct=true`;
  }

  return url;
}

// Helper function to determine if an artist is a Drip artist
export function isDripArtist(creatorId: string): boolean {
  const creatorIdStr = String(creatorId);
  const isDrip = creatorIdStr.startsWith("DRIP:");
  const isAtArtist = creatorIdStr.endsWith(" @");
  const isBase58Drip = creatorIdStr.length >= 40 && !creatorIdStr.includes(" ");

  const isAdditionalDrip = additionalDripArtists.some((artist) =>
    creatorIdStr.toLowerCase().includes(artist.toLowerCase())
  );

  // Check for @ artists (Early Drip)
  const isAtArtistInName = creatorIdStr.includes("@");

  const isExcluded = dripExclusions.some((exclusion) =>
    creatorIdStr.toLowerCase().includes(exclusion.toLowerCase())
  );

  const result =
    (isDrip ||
      isAtArtist ||
      isBase58Drip ||
      isAdditionalDrip ||
      isAtArtistInName) &&
    !isExcluded;

  // Debug logging for @ artists
  // if (creatorIdStr.includes("@")) {
  //   console.log(
  //     `🔍 isDripArtist check: "${creatorIdStr}" -> isDrip: ${isDrip}, isAtArtist: ${isAtArtist}, isBase58: ${isBase58Drip}, additional: ${isAdditionalDrip}, isAtArtistInName: ${isAtArtistInName}, result: ${result}`
  //   );
  // }

  return result;
}

export function getDisplayName(creatorId: string): string {
  if (creatorId.startsWith("DRIP: ")) {
    return creatorId.replace("DRIP: ", "");
  }
  // Handle @ artists - move @ to the end and capitalize
  if (creatorId.startsWith("@")) {
    const nameWithoutAt = creatorId.slice(1); // Remove the @
    const capitalizedName =
      nameWithoutAt.charAt(0).toUpperCase() + nameWithoutAt.slice(1); // Capitalize first letter
    return `${capitalizedName} @`;
  }
  // Handle @ artists that end with " @" - remove the " @" suffix
  if (creatorId.endsWith(" @")) {
    const nameWithoutSuffix = creatorId.slice(0, -2); // Remove " @" suffix
    return nameWithoutSuffix;
  }
  // Handle base58 names (40+ char without spaces) - truncate to first 4 chars + "..."
  if (creatorId.length >= 40 && !creatorId.includes(" ")) {
    return `${creatorId.slice(0, 4)}...`;
  }
  // Handle custom artist names (they should be displayed as-is)

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
    // console.log(`Cleared ${oldCacheKeys.length} old cache entries`);
  } catch (error) {
    console.warn("Failed to clear old cache:", error);
  }
};

// Shared sorting function
export const sortGroupedNFTs = (
  groupedNFTs: GroupedNFTs,
  sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc"
) => {
  // console.log(
  //   `🔀 Sorting ${Object.keys(groupedNFTs).length} artists by ${sortType}`
  // );

  // Debug: Show first few artist names
  const artistNames = Object.keys(groupedNFTs);
  // console.log("📋 Sample artist names:", artistNames.slice(0, 10));

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
  // console.log(
  //   "📊 First 10 sorted results:",
  //   sorted.slice(0, 10).map(([key]) => getDisplayName(key))
  // );

  return sorted;
};

export const loadNFTs = async (
  address: string,
  viewType: "created" | "owned",
  sortType: "quantityDesc" | "quantityAsc" | "nameAsc" | "nameDesc",
  typeFilter: "all" | "drip" | "legit" | "???" | "spam",
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
    // console.log("✅ Using cached data for:", typeFilter, "Key:", cacheKey);
    const parsedData = JSON.parse(cachedData);
    // console.log(
    //   "📊 Cached data has",
    //   Object.keys(parsedData).length,
    //   "artists"
    // );
    setProgress(100);
    return parsedData;
  }

  if (!address) return {};
  // console.log("🔄 Fetching fresh data for:", typeFilter, "Key:", cacheKey);

  // Debug: Log what we're about to fetch

  // Set initial progress
  setProgress(5);

  const fetchedNFTs = await fetchNFTsByOwner(address, viewType);
  // console.log("📥 Fetched NFTs:", fetchedNFTs.length);

  // Set progress after fetch
  setProgress(20);

  const totalNFTs = fetchedNFTs.length;
  let processedNFTs = 0;

  // Filter NFTs based on typeFilter
  let atSymbolCount = 0;
  // console.log(
  //   `🔍 Starting filtering for ${typeFilter} with ${fetchedNFTs.length} NFTs`
  // );

  const filteredNFTs = fetchedNFTs.filter((nft) => {
    processedNFTs++;
    setProgress(20 + Math.floor((processedNFTs / totalNFTs) * 60));

    const creatorId = getCreatorIdentifier(nft);
    const creatorIdStr = String(creatorId);
    const isDrip = creatorIdStr.startsWith("DRIP:");
    // Check original address for @ symbol, not the transformed name
    const originalAddress = nft.authorities?.[0]?.address;
    const isAtSymbol = originalAddress?.startsWith("@");
    // Removed youtu detection
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
        // Removed youtu check &&
        !isLegit &&
        !isBase58 &&
        !isDripArtist(creatorIdStr) &&
        !isLegit) || // Exclude any Drip and Legit artists from spam
      isClaim ||
      (nft.content.links?.external_url &&
        !isDripArtist(creatorIdStr) &&
        !isLegit); // Include NFTs with external links in spam (but not Drip/Legit)

    // Debug: Log filtering decision for first few NFTs
    // if (processedNFTs <= 5) {
    //   console.log(
    //     `🔍 NFT ${processedNFTs}: Creator ID = "${creatorIdStr}", typeFilter = ${typeFilter}, isDrip = ${isDrip}, isAtSymbol = ${isAtSymbol}, isSpam = ${isSpam}`
    //   );
    // }

    switch (typeFilter) {
      case "all":
        // Show all NFTs EXCEPT spam
        const shouldIncludeInAll = !isSpam;

        // Debug logging for All filter
        // if (processedNFTs <= 10) {
        //   console.log(
        //     `🔍 All NFT ${processedNFTs}: Creator ID = "${creatorIdStr}", isSpam = ${isSpam}, shouldInclude = ${shouldIncludeInAll}`
        //   );
        // }

        // Log ALL items that are excluded from All (not just first 10)
        // if (isSpam) {
        //   console.log(`🚫 Excluded from All: "${creatorIdStr}" (isSpam: true)`);
        // }

        return shouldIncludeInAll;
      case "drip":
        // Show OG Drip artists (that start with "DRIP: "), @ artists (ending with " @"), and base58 names
        const shouldIncludeDrip = isDripArtist(creatorIdStr) || isBase58;

        // Exclude the specific E3zH... address from Drip (it's a legit artist)
        const isExcludedLegit = creatorIdStr.startsWith("E3zH");
        const finalDripInclude = shouldIncludeDrip && !isExcludedLegit;

        // Debug logging for drip filter
        // if (processedNFTs <= 10) {
        //   console.log(
        //     `🔍 Drip NFT ${processedNFTs}: Creator ID = "${creatorIdStr}", shouldInclude = ${finalDripInclude}`
        //   );
        // }

        // Log ALL Drip items (not just first 10)
        // if (finalDripInclude) {
        //   console.log(
        //     `✅ Drip Item: "${creatorIdStr}" (isDripArtist: ${isDripArtist(
        //       creatorIdStr
        //     )}, isBase58: ${isBase58})`
        //   );
        // }

        // Additional debug for @ artists
        // if (creatorIdStr.includes("@")) {
        //   console.log(
        //     `🔍 @ Artist found: "${creatorIdStr}" - isDripArtist: ${shouldIncludeDrip}`
        //   );
        // }

        return finalDripInclude;
      // Removed youtu case
      case "legit":
        return isLegit;
      case "spam":
        // Log ALL Spam items to see what's being included
        // if (isSpam) {
        //   console.log(
        //     `🚨 Spam Item: "${creatorIdStr}" (isDrip: ${isDrip}, isAtSymbol: ${isAtSymbol}, isLegit: ${isLegit}, isBase58: ${isBase58}, isClaim: ${isClaim})`
        //   );
        // }
        return isSpam;
      case "???":
        // ??? should exclude Drip artists and those with links should go to spam
        const hasExternalLink = nft.content.links?.external_url;
        if (hasExternalLink) {
          return false; // Don't include in ??? if they have external links
        }
        return (
          !isDrip &&
          !isAtSymbol &&
          // Removed youtu check &&
          !isLegit &&
          !isSpam &&
          !isDripArtist(creatorIdStr)
        );
      default:
        return true;
    }
  });

  // Debug logging after filtering
  // console.log(
  //   `📊 ${typeFilter} Filter complete: ${filteredNFTs.length} NFTs passed the filter`
  // );

  // Additional debug for All filter
  // if (typeFilter === "all") {
  //   console.log(
  //     `🔍 All filter summary: ${filteredNFTs.length} NFTs included, ${
  //       fetchedNFTs.length - filteredNFTs.length
  //     } NFTs excluded as spam`
  //   );
  // }

  // if (typeFilter === "all") {
  //   const spamCount = fetchedNFTs.filter((nft) => {
  //     const creatorId = getCreatorIdentifier(nft);
  //     const creatorIdStr = String(creatorId);
  //     const isDrip = creatorIdStr.startsWith("DRIP:");
  //     const originalAddress = nft.authorities?.[0]?.address;
  //     const isAtSymbol = originalAddress?.startsWith("@");
  //     // Removed youtu detection
  //     const isLegit = isLegitArtist(nft);
  //     const creatorNFTs = fetchedNFTs.filter(
  //       (n) => getCreatorIdentifier(n) === creatorId
  //     );
  //     const isClaim = nft?.content?.metadata?.name?.startsWith("Claim");
  //     const isSpam =
  //       (creatorNFTs.length >= 3 &&
  //         !isDrip &&
  //         !isAtSymbol &&
  //         // Removed youtu check &&
  //         !isLegit) ||
  //       isClaim;
  //     return isSpam;
  //   }).length;
  //   console.log(
  //     `📊 All Filter complete: Excluded ${spamCount} spam NFTs, ${filteredNFTs.length} NFTs remaining`
  //   );
  // }

  // if (typeFilter === "drip") {
  //   const dripCount = filteredNFTs.filter((nft) => {
  //     const creatorId = getCreatorIdentifier(nft);
  //     return creatorId.startsWith("DRIP:");
  //   }).length;
  //   const atCount = filteredNFTs.filter((nft) => {
  //     const creatorId = getCreatorIdentifier(nft);
  //     const creatorIdStr = String(creatorId);
  //     return creatorIdStr.length >= 40 && !creatorIdStr.includes(" ");
  //   }).length;
  //   console.log(
  //     `📊 Drip Filter complete: Found ${dripCount} OG Drip artists, ${atCount} @ artists (${filteredNFTs.length} total)`
  //   );
  // }

  setProgress(80);

  // Group and sort the filtered NFTs
  const tempGrouped = filteredNFTs.reduce((acc: GroupedNFTs, nft) => {
    let creatorId = getCreatorIdentifier(nft);

    // For legit artists, use the custom artist name if available
    if (typeFilter === "legit") {
      const customName = getLegitArtistName(nft);
      if (customName) {
        // console.log(
        //   `🎨 Custom artist detected: "${creatorId}" -> "${customName}"`
        // );
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
    // console.log("💾 Cached result for:", typeFilter);
  } catch (error) {
    console.warn("Failed to cache data:", error);
  }

  setProgress(100);

  // Summary logging for current view
  const totalNFTsInWallet = fetchedNFTs.length;
  const nftsInCurrentView = filteredNFTs.length;
  const artistsInCurrentView = Object.keys(result).length;
  const videosInCurrentView = filteredNFTs.filter((nft) =>
    nft.content.metadata?.properties?.files?.some(
      (file: any) =>
        file.type?.startsWith("video/") ||
        file.uri?.includes(".mp4") ||
        file.uri?.includes(".webm") ||
        file.uri?.includes(".mov")
    )
  ).length;

  console.log(`Total NFTs in wallet: ${totalNFTsInWallet}`);
  console.log(`NFTs (${typeFilter}): ${nftsInCurrentView}`);
  console.log(`Artists: ${artistsInCurrentView}`);
  console.log(`Videos: ${videosInCurrentView}`);

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
