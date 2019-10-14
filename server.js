require('dotenv').config();

const express = require('express')
const app = express()
const TelegramBot = require('node-telegram-bot-api');

const token = '986452153:AAF8Nx2K7JvPPQe6G4j0rV-EFXwQvOlSiGU';
const bot = new TelegramBot(token, { polling: true });
const commands = {

  create_flex: (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, 'Флекс ' + resp + ' успешно создан!');
  },
  update_flex: (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, 'Флекс ' + resp + ' успешно обновлен!');
  },
  delete_flex: (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, 'Флекс ' + resp + ' успешно удален!');
  },
  view_flexes: (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, 'Флекс:' + resp);
  },
  echo: (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
  }

}

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
  isError = handleError(msg.text)
  if (isError) {
    const chatId = msg.chat.id;
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








































































































































































































































































































































































































































































