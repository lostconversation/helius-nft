// Custom "Legit" artist mappings based on NFT descriptions
export function getLegitArtistName(nft: any): string | null {
  try {
    const description =
      nft?.content?.metadata?.description?.toLowerCase() || "";

    // Superteam: NFTs with "ecosystem call" in description
    if (description.includes("ecosystem call")) {
      return "Superteam";
    }

    return null;
  } catch (error) {
    console.warn("Error checking legit artist:", error);
    return null;
  }
}

// Function to check if an NFT belongs to a legit artist
export function isLegitArtist(nft: any): boolean {
  try {
    return getLegitArtistName(nft) !== null;
  } catch (error) {
    console.warn("Error checking if legit artist:", error);
    return false;
  }
}
