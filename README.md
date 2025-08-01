# 🖼️ Solana NFT Viewer

A powerful NFT viewer for Solana wallets with intelligent clustering and filtering!

---

## How it Looks

https://github.com/user-attachments/assets/e3df79aa-7e9f-4cb9-b103-57702b1f0345

---

## How it Works

### 🎨 Collector (Easy Mode)

Paste wallet address to instantly preview my NFTs (maybe max ~100 for this view).

Enjoy a clean, pre-organized view by artist or style.

Check spam or irrelevant NFTs.

### 🧠 Curator (Pro Mode)

Connect wallet to preview all my NFTs.

Create, tag, and refine personal collections.

Remove spam and polish my on-chain presence.

### 🔌 Platform Integrator

Embed Flexin's gallery engine into my product.

Display curated NFTs from wallets or users directly.

Hook into Drip feeds, metaverse viewers or burn tools.

---

## Core Architecture

The app uses a sophisticated multi-layer approach to organize and display NFTs by analyzing and processing vanilla metadata.

### **NFT Fetching Layer**

- **Helius API Integration**: Direct RPC calls to fetch NFTs by owner/creator
- **Smart Caching**: Versioned localStorage keys to avoid redundant API calls
- **Batch Processing**: Loads all categories simultaneously for instant filtering

### **Clustering Engine**

- **Creator ID Extraction**: Priority-based algorithm to identify artists
  1. Drip.haus URLs → `DRIP: artistname`
  2. External URLs → domain name
  3. Artist attribute → artist name
  4. Symbol → collection symbol
  5. Authority address → wallet address
  6. Creator hash → truncated hash

### **Filtering System**

- **Category Filters**: `all`, `drip`, `legit`, `spam`, `???`
- **Quantity Filters**: `all`, `>3`, `1`
- **Inspector Filters**: `all`, `animations`, `immutable`, `cNFT`
- **Custom Artist Mapping**: Manual definitions for legit artists

### **Sorting Algorithms**

- **Quantity-based**: `quantityDesc`, `quantityAsc` (by NFT count per artist)
- **Name-based**: `nameAsc`, `nameDesc` (alphabetical with number handling)
- **Smart Number Sorting**: Numbers appear at the end of alphabetical lists

---

## Features

- **Lightning-Fast Loading**: Intelligent caching with versioned keys
- **Multi-Category Support**: View all, drip artists, legit artists, spam, or unknown
- **Custom Artist Mapping**: Manual definitions for important artists
- **Advanced Filtering**: By type, quantity, compression, animations
- **Flexible Views**: Multiple display modes (View2, View3)
- **Zoom Controls**: Normal, zoomed, and super-zoomed viewing
- **Real-time Sorting**: Instant client-side sorting without re-fetching
- **No Authority Required**: Just enter any Solana wallet address

---

## Core Logic Deep Dive

### **NFT Processing Pipeline**

1. **Fetch**: Helius API → Raw NFT data
2. **Filter**: Apply category rules (drip, legit, spam detection)
3. **Extract**: Creator ID using priority algorithm
4. **Map**: Apply custom artist names for legit artists
5. **Group**: Cluster by creator ID
6. **Sort**: Apply sorting algorithm (quantity/name)
7. **Cache**: Store results with versioned keys
8. **Display**: Render in selected view mode

### **Clustering Algorithm**

```typescript
// Priority-based creator ID extraction
const creatorId = dripHausUrl
  ? `DRIP: ${artist}`
  : externalUrl
  ? domain
  : artistAttr
  ? artistName
  : symbol
  ? symbol
  : authority
  ? address
  : creatorHash
  ? hash
  : "Unknown";
```

### **Custom Artist Rules**

```typescript
// Rule types for custom artist matching
type RuleType =
  | "creatorId" // Match creator ID
  | "nftNameStartsWith" // Match NFT name prefix
  | "anyContains"; // Match anywhere in ID/name
```

---

## 🧠 Curator (Pro Mode)

Here the user will be able to customize their wallet by creating onchain collections and burning the spam.

**Coming Soon**

---

## Quick Start

### Requirements

- [Node.js](https://nodejs.org/) (v18+)
- [Next.js](https://nextjs.org/)
- [Helius API Key](https://dev.helius.xyz/)

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/yourusername/sol-NFT-viewer.git
   cd sol-NFT-viewer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   # Add your Helius API key
   NEXT_PUBLIC_HELIUS_API_KEY=your_api_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` and enter any Solana wallet address!

---

## 🌐 Network

- **Mainnet Only**: This viewer works with Solana mainnet NFTs.
- **Any Wallet**: View NFTs from any public Solana wallet address.
