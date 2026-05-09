// One-time script to register the /connect slash command with Discord.
// Run with: npm run register
// Re-run whenever command names or descriptions change.
import "dotenv/config";
import { REST, Routes } from "discord.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token) throw new Error("Missing DISCORD_TOKEN in environment");
if (!clientId) throw new Error("Missing DISCORD_CLIENT_ID in environment");

const commands = [
  {
    name: "connect",
    description: "Connect your XRPL wallet and verify your address",
  },
];

const rest = new REST().setToken(token);

console.log("Registering slash commands...");

try {
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log("✅ Slash commands registered successfully.");
  console.log("Note: Global commands can take up to 1 hour to appear in all servers.");
} catch (error) {
  console.error("❌ Failed to register slash commands:", error);
  process.exit(1);
}
