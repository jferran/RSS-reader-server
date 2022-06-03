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
            //_id: false,
            //content: String,
            guid: {
                type: String,
                required: true,
                //unique: true,
            },
            pubDate: Date
        }],
        newsFromOtherModel: [{
            type: Schema.Types.ObjectId,
            ref: "News"
        }],
    }
)
feedSchema.index({ guid: 1}, { unique: true });


const Feed = model("Feed", feedSchema)
module.exports = Feed