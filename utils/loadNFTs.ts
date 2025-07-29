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

const CACHE_KEY_PREFIX = "nft_v5_";

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
  typeFilter: "all" | "drip" | "@" | "youtu" | "legit" | "???" | "spam",
  quantityFilter: "all" | ">3" | "1",
  setProgress: (progress: number) => void
): Promise<GroupedNFTs> => {
  // Clear old cache versions
  clearOldCache();
  const cacheKey = `${CACHE_KEY_PREFIX}${address}_${viewType}`;

  // Check if cached data exists
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    console.log("Using cached NFTs data");
    const cachedDataParsed = JSON.parse(cachedData);

    // Check if cached data is already grouped (old format) or raw array (new format)
    if (Array.isArray(cachedDataParsed)) {
      // New format: raw NFT array
      const rawNFTs = cachedDataParsed;

      // Apply filtering to cached data
      const filteredNFTs = rawNFTs.filter((nft: any) => {
        const creatorId = getCreatorIdentifier(nft);

        // Type filter
        if (typeFilter !== "all") {
          const creatorIdStr = String(creatorId);
          const isDrip = creatorIdStr.startsWith("DRIP:");
          const isAtSymbol = creatorIdStr.startsWith("@");
          const isYoutu = creatorIdStr.toLowerCase().startsWith("youtu");
          const isLegit = isLegitArtist(nft);

          if (
            (typeFilter === "drip" && !isDrip) ||
            (typeFilter === "@" && !isAtSymbol) ||
            (typeFilter === "youtu" && !isYoutu) ||
            (typeFilter === "legit" && !isLegit) ||
            (typeFilter === "???" &&
              (isDrip || isAtSymbol || isYoutu || isLegit))
          ) {
            return false;
          }
        }

        return true;
      });

      // Group and sort the filtered NFTs
      const tempGrouped = filteredNFTs.reduce((acc: GroupedNFTs, nft: any) => {
        const creatorId = getCreatorIdentifier(nft);
        if (!acc[creatorId]) {
          acc[creatorId] = [];
        }
        acc[creatorId].push(nft);
        return acc;
      }, {});

      const sortedGrouped = sortGroupedNFTs(tempGrouped, sortType);
      return Object.fromEntries(sortedGrouped);
    } else {
      // Old format: already grouped data, return as-is
      return cachedDataParsed;
    }
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

    console.log("FILTERING NFT - typeFilter:", typeFilter);

    const creatorId = getCreatorIdentifier(nft);

    // Type filter
    if (typeFilter !== "all") {
      // Ensure creatorId is a string
      const creatorIdStr = String(creatorId);
      const isDrip = creatorIdStr.startsWith("DRIP:");
      const isAtSymbol = creatorIdStr.startsWith("@");
      const isYoutu = creatorIdStr.toLowerCase().startsWith("youtu");
      const isLongName = creatorIdStr.length >= 20;

      // Check if this is a legit artist
      const isLegit = isLegitArtist(nft);

      // Debug: log NFT names to see what they actually are

      if (
        (typeFilter === "drip" && !isDrip) ||
        (typeFilter === "@" && !isAtSymbol) ||
        (typeFilter === "youtu" && !isYoutu) ||
        (typeFilter === "legit" && !isLegit) ||
        (typeFilter === "???" && (isDrip || isAtSymbol || isYoutu || isLegit))
      ) {
        return false;
      }

      // Debug for legit filter
      if (typeFilter === "legit") {
        console.log("Legit filter check:", {
          nftName: nft.content.metadata.name,
          isLegit,
          description: nft.content.metadata.description?.substring(0, 100),
        });
      }

      // Spam filter: show only artists with >10 NFTs that are not known types
      if (typeFilter === "spam") {
        const creatorNFTs = fetchedNFTs.filter(
          (n) => getCreatorIdentifier(n) === creatorId
        );
        if (
          isDrip ||
          isAtSymbol ||
          isYoutu ||
          isLegit ||
          creatorNFTs.length <= 10
        ) {
          return false;
        }
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

  // Cache the raw NFT data (before filtering)
  try {
    localStorage.setItem(cacheKey, JSON.stringify(fetchedNFTs));
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
  // Check if this is a legit artist first
  const nftDisplayName = nft.content.metadata.name;
  const legitArtistName = getLegitArtistName(nftDisplayName);
  if (legitArtistName) {
    return `LEGIT: ${legitArtistName}`;
  }

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
