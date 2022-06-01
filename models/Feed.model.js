const { Schema, model } = require("mongoose");

const feedSchema = new Schema(
    {
        name: {
            type: String
        },
        sourceUrl: {
            type: String,
            required: true,
            unique: true
        }
    }
)


const Feed = model("Feed", feedSchema)
module.exports = Feed