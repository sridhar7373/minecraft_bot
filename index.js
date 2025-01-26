const express = require('express');
const mineflayer = require('mineflayer');
const fs = require('fs');

const app = express();
const config = JSON.parse(fs.readFileSync('settings.json', 'utf8'));


createBot();
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
});

function createBot() {
    const bot = mineflayer.createBot({
        host: config.server.ip, 
        port: config.server.port,
        username: config["bot-account"].username,
        password: config["bot-account"].password, 
        auth: config["bot-account"].type,
    });

    bot.on('login', () => {
        console.log(`Logged in as ${bot.username}`);

        if (config.utils["auto-auth"].enabled) {
            setTimeout(() => {
                bot.chat(`/login ${config.utils["auto-auth"].password}`);
                console.log("Auto-authentication executed.");
            }, 1000);
        }

        if (config.utils["anti-afk"].enabled) {
            if (config.utils["anti-afk"].sneak) {
                setInterval(() => {
                    bot.setControlState('sneak', true);
                    setTimeout(() => bot.setControlState('sneak', false), 1000);
                }, 5000);
                console.log("Anti-AFK enabled: Sneak mode.");
            }
        }
    });

    bot.on('end', () => {
        console.log('Bot disconnected. Attempting to reconnect...');
        setTimeout(createBot, config.utils["auto-recconect-delay"] || 5000);
    });

    bot.on('error', (err) => {
        console.error(`Error: ${err.message}`);
    });

    bot.on('kicked', (reason) => {
        console.warn(`Kicked: ${reason}`);
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
    });

    return bot;
}

