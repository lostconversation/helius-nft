import { getCustomArtistName, isCustomArtist } from "./customArtists";

export function getLegitArtistName(nft: any): string | null {
  try {
    // Get the creator identifier using the same logic as getCreatorIdentifier
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
      } else if (nft.compression?.leaf_id) {
        creatorId = nft.compression.leaf_id;
      } else if (nft.content.metadata.symbol) {
        creatorId = nft.content.metadata.symbol;
      } else {
        creatorId = nft.authorities?.[0]?.address || "Unknown";
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
    // Get the creator identifier using the same logic as getCreatorIdentifier
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
      } else if (nft.compression?.leaf_id) {
        creatorId = nft.compression.leaf_id;
      } else if (nft.content.metadata.symbol) {
        creatorId = nft.content.metadata.symbol;
      } else {
        creatorId = nft.authorities?.[0]?.address || "Unknown";
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
