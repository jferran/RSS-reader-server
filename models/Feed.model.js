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
        numberOfEntriesInXml: {type: Number},
        news: [{
            // _id: {
            //     type: Schema.Types.ObjectId,
            //     ref: "News"
            // },
            type: Schema.Types.ObjectId,
            ref: "News"
        }],
    }
)
//feedSchema.index({ guid: 1}, { unique: true });


const Feed = model("Feed", feedSchema)
module.exports = Feed