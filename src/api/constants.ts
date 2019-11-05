export const options: object = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{
                text: 'Стопарь', callback_data: '1'
            }],
        ]
    })
}; 

export const translate = require('yandex-translate')('trnsl.1.1.20191028T211302Z.cb09357ddb661c0b.c749257fcc90f0dc715ff27d55d1d3e034125197');

export const LUIS_PATH = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/3e9994e5-907a-42b6-8bf6-4600ded14589?staging=true&verbose=true&timezoneOffset=180&subscription-key=0945e8cd992e4fb9a276279043715f74';

export const dataBaseRoute = "mongodb+srv://arturcherkanov:Fhneh111!@cluster0-owmev.mongodb.net/test?retryWrites=true&w=majority";

export const telegaToken = "986452153:AAF8Nx2K7JvPPQe6G4j0rV-EFXwQvOlSiGU"