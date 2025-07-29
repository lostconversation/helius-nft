import { getCustomArtistName, isCustomArtist } from "./customArtists";

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
