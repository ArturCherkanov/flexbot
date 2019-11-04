const translate = require('yandex-translate')('trnsl.1.1.20191028T211302Z.cb09357ddb661c0b.c749257fcc90f0dc715ff27d55d1d3e034125197');


export const translateObj = async (translateObject) => {
    const keys = Object.keys(translateObject);
    const values = await Promise.all(keys.map(key => new Promise((resolve, reject) => {
        translate.translate(translateObject[key], { to: 'ru' }, function (err, res) {
            resolve(res.text[0])
        })
    })));

    return keys.reduce((acc, k, i) => ({ ...acc, [k]: values[i] }), {});
}