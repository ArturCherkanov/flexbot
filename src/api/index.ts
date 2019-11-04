import TelegramBot from "node-telegram-bot-api";
const translate = require('yandex-translate')('trnsl.1.1.20191028T211302Z.cb09357ddb661c0b.c749257fcc90f0dc715ff27d55d1d3e034125197');
import express from 'express';
const app = express()
import axios from 'axios';
import { inflateSync } from "zlib";
import { defineDate, translateObj } from '../utils/utils';
import moment from 'moment';

const axiosLusiInstance = axios.create({

    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": '0945e8cd992e4fb9a276279043715f74',
    }
});
import Flex from '../models/Flex';

type CommandHandler = (msg: any, match: Array<string>) => void;

interface ICommands {
    [key: string]: CommandHandler;
}

export const createCommands = (bot: TelegramBot) => ({
    end: (msg, match) => {
        const chatId: string = msg.chat.id;
        const resp: string = match[2];
        bot.sendMessage(chatId, 'Паша апни зп, прилага за пару дней писана');
    },
    start: (msg, match) => {
        const chatId: string = msg.chat.id;
        let currentDate = moment().format();
        let endOfDay = moment().add(1,'days').format();
        let flexId: string;
        Flex.findOne({
            data: {
                "$gte": currentDate,
                "$lte": endOfDay
            }
        }).then((res) => {
            flexId = res._id
        }).catch((err) => {
            console.log(err)
        })

        const options: any = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{
                        text: 'Стопарь', callback_data: '1', function(res) {
                        }
                    }],
                ]
            })
        };

        bot.sendMessage(chatId, "да начнется флекс!", options)
            .then((res) => {
                bot.on("callback_query",  async (data) => {
                    const currentUserName = data.from.username
                    const flex = await Flex.findOne({_id:flexId})
                    
                    flex.flex_game = {
                        ...flex.flex_game,
                        [currentUserName]: (flex.flex_game && flex.flex_game[currentUserName]) ? flex.flex_game[currentUserName] + 1 : 1 
                    }

                    await flex.save();
                })
            });
    },
    create: (msg, match) => {
        const chatId: string = msg.chat.id;
        const resp: string = match[2];
        const flex = new Flex();

        translate.translate(resp, { to: 'en' }, function (err, res) {
            const translatedText = res.text[0];
            console.log(res.text[0])
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
                    console.log('flexData', flexData)

                    flex.name = flexData.Name;
                    flex.location = flexData.Location;
                    flex.data = defineDate(flexData.Data);

                    flex.save()
                        .then(() => {
                            bot.sendMessage(chatId, 'Флекс ' + (flexData.Name || '"No Name"') + 'на ' + flex.data + ' успешно создан!');
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
        const resp: string = match[2];

        Flex.findOne({ name: resp })
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
} as ICommands);