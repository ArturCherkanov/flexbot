const translate = require('yandex-translate')('trnsl.1.1.20191028T211302Z.cb09357ddb661c0b.c749257fcc90f0dc715ff27d55d1d3e034125197');
const moment = require('moment');

export const translateObj = async (translateObject) => {
    const keys = Object.keys(translateObject);
    const values = await Promise.all(keys.map(key => new Promise((resolve, reject) => {
        translate.translate(translateObject[key], { to: 'ru' }, function (err, res) {
            resolve(res.text[0])
        })
    })));

    return keys.reduce((acc, k, i) => ({ ...acc, [k]: values[i] }), {});
}

export const defineDate = (date: string) => {
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
}