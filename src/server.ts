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

  let commandName = new RegExp('\/' + command + ' (.+)')
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
  const chatId = msg.chat.id;

  if (isError) {
    bot.sendMessage(chatId, `
        Бля. Ну ты еблан, юзай комманды
        create_flex
        update_flex
        delete_flex
        view_flexes
        `);
    bot.sendMessage(chatId, 'Received your message');
  } else {
    bot.sendMessage(chatId, 'Паша лох');
  }
});

// Require the module and instantiate instance
var TJO = require('translate-json-object')();
 
// Choose the service to use google/yandex,
// if you provide both yandex will be used as the default
TJO.init({
  yandexApiKey: 'trnsl.1.1.20191028T211302Z.cb09357ddb661c0b.c749257fcc90f0dc715ff27d55d1d3e034125197'
});
 
// An example scenario (json) object
var example = {
  "name": "Please enter your name",
  "list": ["translate", "object", "made", "easy"],
  "nested": {
    "hello": "hello",
    "world": "world"
    }
};
 
// Translate method takes (source object, and language code)
TJO.translate(example, 'es')
    .then(function(data) {
      console.log(data);
    }).catch(function(err) {
      console.log('error ', err)
    });
app.listen(3000, () => {
  console.log(`listening on 3000 PORT`)
})








































































































































































































































































































































































































































































