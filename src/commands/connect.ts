// /connect command — walks the user through connecting their XRPL wallet.
// Flow: create payload → send signing link → poll for result → report outcome.
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { XRPLRequest } from "@xrplrequest/sdk";

export async function handleConnect(
  interaction: ChatInputCommandInteraction,
  client: XRPLRequest
): Promise<void> {
  // Defer the reply as ephemeral so the wallet address isn't shown to the whole channel.
  // Deferring also buys us time to call the API — Discord's initial 3-second response
  // window would otherwise expire while we wait for the payload to be created.
  await interaction.deferReply({ ephemeral: true });

  try {
    // Step 1: Create a connect payload with a 3-minute TTL.
    const payload = await client.payloads.create({
      type: "connect",
      options: { expiresIn: 180 },
    });

    // Step 2: Send the signing link as an embed + button so the URL is clearly presented.
    const embed = new EmbedBuilder()
      .setTitle("Connect your XRPL Wallet")
      .setDescription(
        "Click the button below to open the signing page and verify your wallet address. " +
        "The request expires in **3 minutes**."
      )
      .setColor(0x7c3aed); // brand purple

    const button = new ButtonBuilder()
      .setLabel("Open Signing Page")
      .setStyle(ButtonStyle.Link)
      .setURL(payload.signingUrl);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await interaction.editReply({ embeds: [embed], components: [row] });

    // Step 3: Poll the API until the payload resolves (signed, rejected, or expired).
    // The 3-second interval is the minimum for the free tier of XRPL Request.
    // The timeout matches the payload TTL so we don't poll a dead payload.
    const result = await client.payloads.poll(payload.uuid, {
      timeout: 180_000,
      interval: 3_000,
    });

    // Step 4: Reply based on what the user did.
    // Editing the reply clears the button now that a decision has been made.
    if (result.status === "signed") {
      await interaction.editReply({
        content: `✅ Wallet connected! Address: \`${result.signerAddress}\``,
        embeds: [],
        components: [],
      });
    } else if (result.status === "rejected") {
      await interaction.editReply({
        content: "❌ Request was rejected.",
        embeds: [],
        components: [],
      });
    } else {
      // "expired" — payload TTL elapsed without a decision
      await interaction.editReply({
        content: "⏰ Request expired. Use `/connect` to try again.",
        embeds: [],
        components: [],
      });
    }
  } catch (error) {
    console.error("[connect] Error handling interaction:", error);

    // Discord interaction tokens last 15 minutes, well beyond the 3-minute payload TTL,
    // so editReply should always be available here. We catch any edge-case token errors
    // to avoid an unhandled rejection crashing the process.
    try {
      await interaction.editReply({
        content:
          "❌ Something went wrong while processing your request. Please try again later.",
        embeds: [],
        components: [],
      });
    } catch {
      // Token already expired or reply already sent — nothing to do.
    }
  }
}
