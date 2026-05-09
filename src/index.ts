// Bot entry point — sets up the Discord client, routes interactions, and logs in.
import "dotenv/config";
import { Client, GatewayIntentBits, type Interaction } from "discord.js";
import { XRPLRequest } from "@xrplrequest/sdk";
import { handleConnect } from "./commands/connect.js";

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error("Missing DISCORD_TOKEN in environment");

const apiKey = process.env.XRPL_REQUEST_API_KEY;
if (!apiKey) throw new Error("Missing XRPL_REQUEST_API_KEY in environment");

// Initialise the XRPL Request client once and share it with command handlers.
// Keeping it here avoids re-instantiating per interaction and centralises API key access.
export const xrplRequest = new XRPLRequest({ apiKey });

// The bot only needs to know which guilds it's in — no message content required.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "connect") {
    await handleConnect(interaction, xrplRequest);
  }
});

client.login(token);
