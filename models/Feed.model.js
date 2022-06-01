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
        },
        news: [{
            content: String,
            guid: String,
            date: Date
        }]
    }
)


const Feed = model("Feed", feedSchema)
module.exports = Feed