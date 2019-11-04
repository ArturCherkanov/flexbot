require('dotenv').config();

import express from 'express';
const app = express()
import TelegramBot from 'node-telegram-bot-api';
const dbRoute = "mongodb+srv://arturcherkanov:Fhneh111!@cluster0-owmev.mongodb.net/test?retryWrites=true&w=majority";
import { createCommands} from './api/index';
import mongoose from "mongoose";

const token = '986452153:AAF8Nx2K7JvPPQe6G4j0rV-EFXwQvOlSiGU';
const bot = new TelegramBot(token, { polling: true });
 
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
)
  .then(() => console.log("MongoDB has started"))
  .catch(e => console.log('hui', e));

mongoose.set('useCreateIndex', true);

const commands = createCommands(bot);

const parseCommand = (commandString) => {

  const lastIndex = commandString.indexOf(' ');
  const isCommand = commandString.indexOf('/') !== -1;

  return isCommand ? (lastIndex && commandString.substring(0, lastIndex) || commandString.substring(0, commandString.length)) : (null)
}

const handleError = (commandString) => {

  const command = parseCommand(commandString)

  return !!commands[command] || null

}

// bot.onText(new RegExp(hui), commands.echo);
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
        Бля. Ну ты еблан, юзай комманды
        create_flex
        update_flex
        delete_flex
        view_flexes
        `);
    bot.sendMessage(chatId, 'Received your message');
  } 
});


app.listen(3000, () => {
  console.log(`listening on 3000 PORT`)
})








































































































































































































































































































































































































































































