import { Client } from "discord.js";
import Discord from "discord.js";
import chalk from "chalk";
import * as dotenv from "dotenv";
import path from "path";
const client = new Client();

const prefix = "!";

client.on("ready", () => {
  console.log(
    `%s ${client.user?.username} is online!`,
    chalk.bgRgb(0, 150, 0).white.bold(" SUCCESS ")
  );
});

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift()?.toLowerCase();

  if (command === "ping") {
    msg.channel.send(`pong :ping_pong: ${client.ws.ping}ms`);
  }
});

dotenv.config({
  path: path.resolve(process.cwd(), "./.env"),
});

client.login(process.env.TOKEN).catch((e) => {
  console.error(
    "%s An invalid token was provided in .env",
    chalk.bgRed.white.bold(" ERR ")
  );
});
