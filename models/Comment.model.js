const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
    {
        comment: {
            type: String
        },
        news: {
            type: Schema.Types.ObjectId,
            ref: "News"
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
    }
)

const Comment = model("Comment", commentSchema)
module.exports = Comment