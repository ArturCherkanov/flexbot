import mongoose, { Schema, Document } from "mongoose";

interface IFlex extends Document{
    name: string,
    location: string,
    data:string,
    flex_game: object,
    chatId: string,
    creator: string,
}


const FlexSchema = new Schema({
    name: { 
        type: String, default: 'No name'
     },
     location: { 
        type: String, default: 'no location'
     },
     data: {
        type: Date
     },
     flex_game: {
        type: Object,
     },
     chatId: {
         type: String,
     },
     creator: {
         type: String,
     }
});

export default mongoose.model<IFlex>("Flex", FlexSchema);