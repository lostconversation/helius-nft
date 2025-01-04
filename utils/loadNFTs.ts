import { fetchNFTsByOwner, NFTAsset } from "@/utils/helius";

interface GroupedNFTs {
  [symbol: string]: NFTAsset[];
}

const CACHE_KEY_PREFIX = "nfts_cache_";

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
      const isDrip =
        creatorId.startsWith("DRIP:") || creatorId.includes("DRIP:");
      const isAtSymbol = creatorId.startsWith("@") || creatorId.includes("@");
      const isYoutu = creatorId.toLowerCase().includes("youtu");
      const isLongName =
        creatorId.length >= 40 && !isDrip && !isAtSymbol && !isYoutu;

      // Debug logging
      if (creatorId.includes("DRIP:") || creatorId.includes("@")) {
        console.log("Found potential intruder:", {
          creatorId,
          isDrip,
          isAtSymbol,
          isYoutu,
          isLongName,
          typeFilter,
        });
      }

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
  const sortedGrouped = Object.entries(tempGrouped).sort(
    ([aKey, aValue], [bKey, bValue]) => {
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
    }
  );

  console.log("Sorted grouped NFTs:", sortedGrouped);
  const groupedNFTs = Object.fromEntries(sortedGrouped);

  // Cache the result
  localStorage.setItem(cacheKey, JSON.stringify(groupedNFTs));

  return groupedNFTs;
};

const getCreatorIdentifier = (nft: NFTAsset): string => {
  // First check for DRIP projects
  const dripHausUrl = nft.content.links?.external_url;
  const isDripProject =
    dripHausUrl?.startsWith("https://drip.haus/") ||
    dripHausUrl === "https://drip.haus";
  const dripArtist = isDripProject ? dripHausUrl?.split("/").pop() : null;
  if (isDripProject) return `DRIP: ${dripArtist || "drip.haus"}`;

  // Then check for artist attribute
  const artistAttribute = nft.content.metadata.attributes?.find(
    (attr) => (attr.trait_type || attr.traitType)?.toLowerCase() === "artist"
  );
  if (artistAttribute?.value) {
    // If artist value starts with @, return as is
    if (artistAttribute.value.startsWith("@")) return artistAttribute.value;
    // If it's a URL, clean it up
    if (artistAttribute.value.startsWith("http")) {
      return artistAttribute.value
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "");
    }
    return artistAttribute.value;
  }

  // Then check external URL
  if (dripHausUrl) {
    return dripHausUrl
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");
  }

  // Finally, fallback to other identifiers
  if (nft.compression?.creator_hash) return nft.compression.creator_hash;
  if (nft.content.metadata.symbol) return nft.content.metadata.symbol;
  return nft.authorities?.[0]?.address || "Unknown";
};
