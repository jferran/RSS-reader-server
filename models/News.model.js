const { Schema, model } = require("mongoose");

const newsSchema = new Schema(
    {
        content: {
            type: String
        },
        feed: {
            type: Schema.Types.ObjectId,
            ref: "Feed"
        },
        news: [{
            content: String,
            guid: String,
            pubDate: Date
        }]
    }
)


const News = model("News", feedSchema)
module.exports = News