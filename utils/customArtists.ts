// Custom artist definitions with different rule types
export interface CustomArtist {
  name: string;
  ruleType:
    | "creatorId"
    | "nftNameStartsWith"
    | "nftNameContains"
    | "anyContains";
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
    exclude: ["SuperteamDAO Loot Box"],
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
    name: "mooar.com",
    ruleType: "creatorId",
    value: "mooar.com",
  },
  {
    name: "3.land",
    ruleType: "creatorId",
    value: "3.land",
  },
  {
    name: "E3zH...",
    ruleType: "creatorId",
    value: "E3zHh78ujEffBETguxjVnqPP9Ut42BCbbxXkdk9YQjLC",
  },
  {
    name: "monmonmon",
    ruleType: "creatorId",
    value: "monmonmon",
  },
  {
    name: "MADhouse",
    ruleType: "creatorId",
    value: "MADhouse",
  },
  {
    name: "Poetonic",
    ruleType: "creatorId",
    value: "Poetonic",
  },
  {
    name: "thenetworkstate.com",
    ruleType: "creatorId",
    value: "thenetworkstate.com",
  },
  // Example of "contains" rule
  {
    name: "Solana Ecosystem",
    ruleType: "nftNameContains",
    value: "solana",
  },
];

// Function to get custom artist name for an NFT
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
    } else if (artist.ruleType === "nftNameContains") {
      const value = Array.isArray(artist.value)
        ? artist.value[0]
        : artist.value;
      if (nftName && nftName.toLowerCase().includes(value.toLowerCase())) {
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

// Function to check if an NFT belongs to a custom artist
export function isCustomArtist(creatorId: string, nftName?: string): boolean {
  return getCustomArtistName(creatorId, nftName) !== null;
}
