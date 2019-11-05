import TelegramBot from "node-telegram-bot-api";
import axios from 'axios';
import { utils } from '../utils/utils';
import moment from 'moment';
import Flex from '../models/Flex';
// import Translate from 'yandex-translate';
const translate = require('yandex-translate')('trnsl.1.1.20191028T211302Z.cb09357ddb661c0b.c749257fcc90f0dc715ff27d55d1d3e034125197');

import {
    options,
    LUIS_PATH,
    YANDEX_MAPS_API_PATH,
    YANDEX_MAPS_PATH,
} from '../api/constants'
import { encode } from "punycode";

// const translate = Translate('trnsl.1.1.20191028T211302Z.cb09357ddb661c0b.c749257fcc90f0dc715ff27d55d1d3e034125197') 

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

        if (!resp) {

            const currentDate = moment().subtract(1, 'days');

            utils.getFlexModel(chatId, Flex).then((res) => {
                const locationLink = "Ccылка на геолокацию: " + res.yandexMapLink && res.yandexMapLink || "Пока не добавлена!";
                const message = "Ближайший флекс состоится: " + res.data + "Место положение:" + res.location + "\n" + "Создатель флекса: " + res.creator + "\n" + locationLink;
                bot.sendMessage(chatId, message);
            })
            
            return;
        }

        Flex.findOne({ name: resp })
            .then(res => {
                const message = 'Флекс:' + res.name + "\n" + "Местоположение:" + res.location + "\n" + "Дата:" + res.data
                bot.sendMessage(chatId, message);
            })
            .catch(err => {
                bot.sendMessage(chatId, 'Флекс ' + resp + ' не найден!');
            })

    },

    delete: (msg, match) => {

        const chatId: string = msg.chat.id;
        const resp: string = match[2];

        Flex.findOneAndRemove({ name: resp })
            .then(res => {
                bot.sendMessage(chatId, 'Флекс ' + resp + (!res && ' не найден!' || ' удален!'));

            })
            .catch(err => {
                console.log(err)

            })
    },

    location: (msg, match) => {
        const chatId: string = msg.chat.id;
        const username = msg.from.username
        const resp: string = match[2].replace(/\s/g, "+");

        axios.get(YANDEX_MAPS_PATH, {
            params: {
                apikey: YANDEX_MAPS_API_PATH,
                geocode: resp,
                format: "json",
            },
            headers: {
                "Content-Type": "application/json",
            }
        }).then(async res => {

            const response = res.data.response.GeoObjectCollection;
            const encodeLocation = encodeURI(response.featureMember[0].GeoObject.Point.pos);
            const encodeSearch = encodeURI(response.metaDataProperty.GeocoderResponseMetaData.request);
            const yandexMapLink = 'https://yandex.by/maps?ll=' + encodeLocation + '&mode=search&ol=biz&sll=' + encodeLocation + '&sspn=0.006438%2C0.002291&text=' + encodeSearch + '&z=17.81';

            const flexModel = await utils.getFlexModel(chatId, Flex)
            flexModel.yandexMapLink = yandexMapLink;

            flexModel.save().then(() => {
                bot.sendMessage(chatId, yandexMapLink)
            })

        })
            .catch(err => {
                console.log(err)
            })
    }
} as ICommands);