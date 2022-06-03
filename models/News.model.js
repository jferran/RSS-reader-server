const { Schema, model } = require("mongoose");

const newsSchema = new Schema(
    {
        
        feed: {
            type: Schema.Types.ObjectId,
            ref: "Feed"
        },
        guid: {
            type: String,
            //unique: true
        },
            //unique: true
        
        content: {
            type: String
        }
        
    }
)
newsSchema.index({ feed: 1, guid: 1}, { unique: true });

const News = model("News", newsSchema)
module.exports = News