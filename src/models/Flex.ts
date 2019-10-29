import mongoose, {Schema} from "mongoose";

const FlexSchema = new Schema({
    name: { type: String, default: 'No name' },
});

module.exports = mongoose.model("Flex", FlexSchema);