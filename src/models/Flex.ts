import mongoose, { Schema } from "mongoose";

const FlexSchema = new Schema({
    name: { 
        type: String, default: 'No name'
     },
     location: { 
        type: String, default: 'no location'
     },
     data: {
        type: Date
     }
});

module.exports = mongoose.model("Flex", FlexSchema);