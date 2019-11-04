import mongoose, { Schema, Document } from "mongoose";

interface IFlex extends Document{
    name: string,
    location: string,
    data:string,
    flex_game: object,
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
     }
});

export default mongoose.model<IFlex>("Flex", FlexSchema);