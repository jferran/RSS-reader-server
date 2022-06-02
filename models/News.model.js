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
        guid: {
            type: String,
            unique: true
        }
    }
)


const News = model("News", newsSchema)
module.exports = News