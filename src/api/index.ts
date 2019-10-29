import TelegramBot from "node-telegram-bot-api";
const translate = require('yandex-translate')('trnsl.1.1.20191028T211302Z.cb09357ddb661c0b.c749257fcc90f0dc715ff27d55d1d3e034125197');
import express from 'express';
const app = express()

const Flex = require('../models/Flex');

type CommandHandler = (msg: any, match: Array<string>) => void;

interface ICommands {
    [key: string]: CommandHandler;
}

export const createCommands = (bot: TelegramBot) => ({
    create: (msg, match) => {
        const chatId: string = msg.chat.id;
        const resp: string = match[1];
        const flex = new Flex();
        let translatedText: string  = '';
        // flex.name = resp;

        translate.translate(resp, { to: 'en' }, function(err, res) {
            console.log(typeof res.text[0]);
            translatedText = res.text[0]
          });

          //don't input 
        // flex.save()
        //     .then(() => {
        //         console.log('success')
        //     })
        //     .catch(() => {
        //         console.log('error')
        //     })

        bot.sendMessage(chatId, 'Флекс ' + resp + ' успешно создан!');
    },
    update: () => {
        console.log('hui')
    },
    find: (msg, match) => {
        const chatId: string = msg.chat.id;
        const resp: string = match[1];
        console.log('хуй')

        const flex = new Flex();

        console.log('хуй')
        flex.findOne({ name: resp })
            .then(res => {
                bot.sendMessage(chatId, 'Флекс:' + res);
            })
            .catch(err => {
                bot.sendMessage(chatId, 'Флекс ' + resp + ' не найден!');
            })


    },
    delete: () => {
        console.log('hui')
    }
    //     update_flex(msg, match): void {
    //       const chatId: string = msg.chat.id;
    //       const resp: string = match[1];

    //       bot.sendMessage(chatId, 'Флекс ' + resp + ' успешно обновлен!');
    //     }
    //     delete_flex(msg, match): void {
    //       const chatId = msg.chat.id;
    //       const resp = match[1];
    //       bot.sendMessage(chatId, 'Флекс ' + resp + ' успешно удален!');
    //     }
    //     view_flex(msg, match): void {
    //       const chatId = msg.chat.id;
    //       const resp = match[1];
    //       const flex = new Flex();

    //       console.log('хуй')
    //       flex.find({ name: resp })
    //         .then(res => {
    //           bot.sendMessage(chatId, 'Флекс:' + res);
    //         })
    //         .catch(err => {
    //           bot.sendMessage(chatId, 'Флекс ' + resp + ' не найден!');
    //         })

    //     }
    //     echo  (msg, match) : void {
    //         const chatId = msg.chat.id;
    //     const resp = match[1];

    //     // send back the matched "whatever" to the chat
    //     bot.sendMessage(chatId, resp);
    //   }
} as ICommands);