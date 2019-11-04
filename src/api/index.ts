import TelegramBot from "node-telegram-bot-api";
const translate = require('yandex-translate')('trnsl.1.1.20191028T211302Z.cb09357ddb661c0b.c749257fcc90f0dc715ff27d55d1d3e034125197');
import express from 'express';
const app = express()
import axios from 'axios';
import { inflateSync } from "zlib";
import { translateObj } from '../utils/utils';
let moment =require('moment');

const axiosLusiInstance = axios.create({

    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": '0945e8cd992e4fb9a276279043715f74',
    }
});
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
        let translatedText: string = '';
        // flex.name = resp;

        translate.translate(resp, { to: 'en' }, function (err, res) {
            translatedText = res.text[0];
            axiosLusiInstance.get('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/3e9994e5-907a-42b6-8bf6-4600ded14589?staging=true&verbose=true&timezoneOffset=180&subscription-key=0945e8cd992e4fb9a276279043715f74', {
                params: {
                    q: translatedText
                }
            }).then(res => {
                interface flexParsedModel {
                    Name: string,
                    location: string,
                    time: string,
                };
                let flexParsedModel: any = new Object();

                res.data.entities.forEach(item => {

                    flexParsedModel[item.role] = item.entity;
                })



                translateObj(flexParsedModel).then((flexData: any) => {
                    
                    flex.name = flexData.Name;
                    flex.location = flexData.Location;
                    flex.data = moment(flexData.Data.replace(/\s/g,"")).format(moment.defaultFormatUtc);
                    flex.save()
                        .then(() => {
                            bot.sendMessage(chatId, 'Флекс ' + (flexData.Name || '"No Name"') +'на ' +flex.data + ' успешно создан!');
                        })
                        .catch(() => {
                            console.log('error')
                        })
                })
            })
                .catch((err => {
                    console.log(err)
                }))
        });

    },

    update: () => {
        console.log('hui')
    },

    find: (msg, match) => {

        const chatId: string = msg.chat.id;
        const resp: string = match[1];


        Flex.findOne({ name: resp })
            .then(res => {
                bot.sendMessage(chatId, 'Флекс:' + res.name + "\n" + "Местоположение:" + res.location + "\n" + "Дата:" + res.data);
            })
            .catch(err => {
                bot.sendMessage(chatId, 'Флекс ' + resp + ' не найден!');
            })
    },
    delete: (msg, match) => {
        
        const chatId: string = msg.chat.id;
        const resp: string = match[1];

        Flex.findOneAndRemove({ name: resp })
        .then(res=>{
            bot.sendMessage(chatId, 'Флекс ' +  resp + (res===null && ' не найден!'|| ' удален!'));
            
        })
       .catch(err=>{
        console.log(err)

       })
    }
} as ICommands);