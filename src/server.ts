require('dotenv').config();

import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { createCommands } from './api/index';
import mongoose from "mongoose";
import { dataBaseRoute, telegaToken } from "./api/constants";
import { utils } from "./utils/utils"

const app = express()
const dbRoute = dataBaseRoute;
const token = telegaToken;
const bot = new TelegramBot(token, { polling: true });

mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
)
  .then(() => console.log("MongoDB has started"))
  .catch(e => console.log('hui', e));

mongoose.set('useCreateIndex', true);

const commands = createCommands(bot);

const handleError = (commandString) => {
  const command = utils.parseCommand(commandString)

  return !!commands[command] || null

}

for (const [command, func] of Object.entries(commands)) {

  let commandName = new RegExp('\/' + command + '( (.+))?')
  console.log(commandName, func);
  bot.onText(commandName, func);
}

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('channel_chat_created', (msg) => {
  console.log(msg)
})

bot.on('message', (msg) => {
  const isError: boolean = handleError(msg.text)
  const chatId: number = msg.chat.id;

  if (isError) {
    bot.sendMessage(chatId, `
        Бля. Ну ты еблан, юзай
        create
        `);
    bot.sendMessage(chatId, 'Received your message');
  }
});


app.listen(3000, () => {
  console.log(`listening on 3000 PORT`)
})