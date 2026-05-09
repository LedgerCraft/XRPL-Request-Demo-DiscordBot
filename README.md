# XRPL Request Discord Bot

A demo Discord bot built with [XRPL Request](https://xrplre.quest) — a wallet-agnostic XRPL transaction signing API. It exposes a single `/connect` slash command that lets users verify their XRPL wallet address without ever leaving Discord. This repo is designed to be a clean, readable template for developers who want to add XRPL wallet signing to their own bots. For the full walkthrough and additional payload types, see the [XRPL Request docs](https://docs.xrplre.quest) and the [complete Discord bot example](https://docs.xrplre.quest/examples/discord-bot).

---

## Prerequisites

- **Node.js 18+**
- A Discord application with a bot user — [Discord Developer Portal](https://discord.com/developers/applications)
- An XRPL Request account and API key — [xrplre.quest/dashboard](https://xrplre.quest/dashboard)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/ledgercraft/xrpl-request-demo-discordbot.git
cd xrpl-request-demo-discordbot
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then open `.env` and fill in the three values (see below for where to find each one).

---

## Creating the Discord app

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Navigate to **Bot** in the left sidebar.
   - Click **Reset Token** to generate a bot token and copy it → set as `DISCORD_TOKEN`.
   - Disable **Public Bot** if you don't want others to add it to their servers.
3. Navigate to **General Information**.
   - Copy the **Application ID** → set as `DISCORD_CLIENT_ID`.
4. Navigate to **OAuth2 → URL Generator**.
   - Select scopes: `bot` and `applications.commands`.
   - Select bot permission: **Send Messages**.
   - Copy the generated URL and open it in your browser to invite the bot to your server.

---

## Register the slash command

```bash
npm run register
```

Run this **once** (and again any time you rename or change command definitions). Guild-scoped bots see changes immediately; global registration can take up to 1 hour to propagate across all servers.

---

## Run the bot

```bash
npm run dev
```

The bot will log in and print `✅ Logged in as <BotName>#0000` when it's ready.

---

## How it works

1. A user runs `/connect` in any channel the bot can see.
2. The bot calls the XRPL Request API to create a `connect` payload with a 3-minute TTL.
3. The bot sends the user an **ephemeral** message (only they can see it) containing a button that links to the signing page — no sensitive URLs are broadcast to the channel.
4. The user clicks the button, selects their wallet app, and approves the connection request.
5. The bot polls the XRPL Request API every 3 seconds until the payload is resolved.
6. Once resolved, the bot edits the reply to show the outcome:
   - **Signed** → the verified XRPL address
   - **Rejected** → a cancellation notice
   - **Expired** → a prompt to try again

See the [SDK reference](https://docs.xrplre.quest/sdk) for the full list of methods and options.

---

## Extending this bot

This template covers the `connect` payload type, which verifies wallet ownership. XRPL Request also supports:

- **`signAndSubmit`** — sign and submit a transaction (payments, offers, NFTs, etc.)
- **`signMessage`** — sign an arbitrary message for off-chain proof

See the [full docs examples](https://docs.xrplre.quest/examples/discord-bot) for complete implementations of each payload type.

---

## Project structure

```
src/
├── index.ts           # Bot entry point — client setup, login, event routing
├── register.ts        # One-time slash command registration script
└── commands/
    └── connect.ts     # /connect command handler
.env.example           # Environment variable template
```
