import Translate from 'yandex-translate';
import moment from 'moment';

const translate = Translate('trnsl.1.1.20191028T211302Z.cb09357ddb661c0b.c749257fcc90f0dc715ff27d55d1d3e034125197') 

export const utils = {
    parseCommand: (commandString) => {

        const lastIndex = commandString.indexOf(' ');
        const isCommand = commandString.indexOf('/') !== -1;

        return isCommand ? (lastIndex && commandString.substring(0, lastIndex) || commandString.substring(0, commandString.length)) : (null)
    },


    translateObj: async (translateObject) => {
        const keys = Object.keys(translateObject);
        const values = await Promise.all(keys.map(key => new Promise((resolve, reject) => {
            translate.translate(translateObject[key], { to: 'ru' }, function (err, res) {
                resolve(res.text[0])
            })
        })));

        return keys.reduce((acc, k, i) => ({ ...acc, [k]: values[i] }), {});
    },

    defineDate: (date: string) => {
        const undefinedDates: any = {
            'сегодня': moment().format(),
            'завтра': moment().add(1, 'days').format(),
            'вчера': moment().subtract(1, 'days')
        };
        let currentDate = moment(date.replace(/\s/g, "")).format(moment.defaultFormatUtc);

        if (!moment(date).isValid()) {
            for (let key in undefinedDates) {
                if (date.indexOf(key) !== -1) currentDate = undefinedDates[key]
            }
        }
        return currentDate;
    },

    getFlexModel: (chatId, FlexModel) => {

        let currentDate = moment().format();
        let endOfDay = moment().add(1, 'days').format();

        return FlexModel.findOne({
            $and: [{
                chatId: chatId
            },
            {
                data: {
                    "$gte": currentDate,
                    "$lte": endOfDay
                }
            }]
        });

    },

    getWinner: (bot, chatId, flexModel) =>{
        const players = flexModel.flex_game;
        const scores: any = Object.values(flexModel.flex_game)
        const maxScore = Math.max(scores)
        const bestScore = Object.keys(players).find(key => players[key] === maxScore);

        bot.sendMessage(chatId, "Самый трезвый: " + bestScore + ": " + maxScore * 50 + " грамм")
    } 
} 