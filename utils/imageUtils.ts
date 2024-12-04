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
