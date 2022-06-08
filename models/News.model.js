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
        title: String,
        link: String,
        
        content: {
            type: String
        },
        pubDate: Date,
        comments: [{
            // _id: {
            //     type: Schema.Types.ObjectId,
            //     ref: "News"
            // },
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }],
        
    }
)
newsSchema.index({ feed: 1, guid: 1}, { unique: true });

const News = model("News", newsSchema)
module.exports = News