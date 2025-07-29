// Custom artist definitions with different rule types
export interface CustomArtist {
  name: string;
  ruleType: "creatorId" | "nftNameStartsWith" | "nftNameContains";
  value: string; // The value to match against
}

export const customArtists: CustomArtist[] = [
  {
    name: "Superteam",
    ruleType: "nftNameStartsWith",
    value: "Solana Ecosystem Call",
  },
  {
    name: "Superteam Red Hoodie",
    ruleType: "nftNameStartsWith",
    value: "Red Hoodie",
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
    value: "solanamonkey.business",
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
    name: "E3zHh78ujEffBETguxjVnqPP9Ut42BCbbxXkdk9YQjLC",
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
      if (cleanCreatorId.startsWith(artist.value)) {
        return artist.name;
      }
    } else if (artist.ruleType === "nftNameStartsWith") {
      if (nftName && nftName.startsWith(artist.value)) {
        return artist.name;
      }
    } else if (artist.ruleType === "nftNameContains") {
      if (
        nftName &&
        nftName.toLowerCase().includes(artist.value.toLowerCase())
      ) {
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
