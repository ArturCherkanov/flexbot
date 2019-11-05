import TelegramBot from "node-telegram-bot-api";
import axios from 'axios';
import { utils } from '../utils/utils';
import moment from 'moment';
import Flex from '../models/Flex';
import {
    options,
    translate,
    LUIS_PATH
} from '../api/constants'

const axiosLusiInstance = axios.create({
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": '0945e8cd992e4fb9a276279043715f74',
    }
});

type CommandHandler = (msg: any, match: Array<string>) => void;

interface ICommands {
    [key: string]: CommandHandler;
}

export const createCommands = (bot: TelegramBot) => ({

    end: async (msg, match) => {

        const chatId: string = msg.chat.id;
        const flexModel = await utils.getFlexModel(chatId, Flex)

        flexModel.active = false;
        flexModel.save();

        utils.getWinner(bot, chatId, flexModel);

    },

    start: async (msg, match) => {
        const chatId: string = msg.chat.id;
        let flexId: string;
        const flexModel = await utils.getFlexModel(chatId, Flex)

        flexId = flexModel._id
        flexModel.active = true;
        await flexModel.save();

        bot.sendMessage(chatId, "да начнется флекс!", options)
            .then((res) => {
                bot.on("callback_query", async (data) => {
                    const currentUserName = data.from.username
                    const flex = await Flex.findOne({ _id: flexId })

                    flexModel.active = true;

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
        const sender = msg.from.username;
        const resp: string = match[2];
        const flex = new Flex();

        translate.translate(resp, { to: 'en' }, function (err, res) {
            const translatedText: string = res.text[0];
            axiosLusiInstance.get(LUIS_PATH, {
                params: {
                    q: translatedText
                }
            }).then(res => {
                interface flexParsedModel {
                    Name: string,
                    location: string,
                    time: string,
                };

                let flexParsedModel: object = new Object();

                res.data.entities.forEach(item => {

                    flexParsedModel[item.role] = item.entity;
                })



                utils.translateObj(flexParsedModel).then((flexData: any) => {

                    flex.name = flexData.Name;
                    flex.location = flexData.Location;
                    flex.data = utils.defineDate(flexData.Data);
                    flex.chatId = chatId;
                    flex.creator = sender;

                    let currentDate = flex.data;
                    let endOfDay = moment(currentDate).add(1, 'days').format();
                    Flex.findOne({
                        data: {
                            "$gte": currentDate,
                            "$lte": endOfDay
                        }
                    }).then(res => {
                        if (res === null) {
                            flex.save()
                                .then(() => {
                                    bot.sendMessage(chatId, 'Флекс ' + (flexData.Name || '"No Name"') + 'на ' + flex.data + ' успешно создан!');
                                })
                            return
                        }
                        bot.sendMessage(chatId, 'Флекс уже есть!')

                    })

                    // console.log(isFlexExist)

                })
            })
                .catch((err => {
                    console.log(err)
                }))
        });

    },

    update: (msg, match) => {
        const chatId: string = msg.chat.id;
        const resp: string = match[2];


    },

    find: (msg, match) => {

        const chatId: string = msg.chat.id;
        const resp: string = match[2];

        if (resp === undefined) {

            let currentDate = moment().format();

            Flex.findOne({
                data: {
                    "$gte": currentDate
                }
            }).then((res) => {
                let message = "Ближайший флекс состоится: " + res.data + "Место положение:" + res.location + "\n" + "Создатель флекса: " + res.creator
                bot.sendMessage(chatId, message);
            })
        } else {
            Flex.findOne({ name: resp })
                .then(res => {
                    bot.sendMessage(chatId, 'Флекс:' + res.name + "\n" + "Местоположение:" + res.location + "\n" + "Дата:" + res.data);
                })
                .catch(err => {
                    bot.sendMessage(chatId, 'Флекс ' + resp + ' не найден!');
                })
        }

    },

    delete: (msg, match) => {

        const chatId: string = msg.chat.id;
        const resp: string = match[2];

        Flex.findOneAndRemove({ name: resp })
            .then(res => {
                bot.sendMessage(chatId, 'Флекс ' + resp + (res === null && ' не найден!' || ' удален!'));

            })
            .catch(err => {
                console.log(err)

            })
    },

    addmylocation: () => {
    }
} as ICommands);