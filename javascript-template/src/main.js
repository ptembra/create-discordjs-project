const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk')
const { config } = require('dotenv')
const path = require('path');

const prefix = '!'

client.on('ready', () => {
    console.log(`%s ${client.user.username} is online!`, chalk.bgRgb(0, 150, 0).white.bold(" SUCCESS ")
    )
})

client.on('message', async (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return

    const args = msg.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        msg.channel.send(`pong :ping_pong: ${client.ws.ping}ms`);
    }
})

config({
    path: path.resolve(process.cwd(), '../.env')
});

client.login(process.env.TOKEN).catch(e => {
    console.log('%s Invalid Token Provided!', chalk.bgRed.white.bold(' ERROR '))
    console.log(e)
})