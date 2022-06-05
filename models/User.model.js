const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      // unique: true -> Ideally, should be unique, but its up to you
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    subscribedFeeds: [{
      //_id: false,
      _id: {
        type: Schema.Types.ObjectId,
        ref: "Feed"
      },
      feed: {
        type: Schema.Types.ObjectId,
        ref: "Feed"
      },
      shared: {
        type: Boolean,
        default: false
      },
    }],
    newsList: [
      {
        //_id: false,
        _id: {
          type: Schema.Types.ObjectId,
          ref: "Feed.news"
          },
          feed: {
            type: Schema.Types.ObjectId,
            ref: "Feed"
            },
        entry: {
        type: Schema.Types.ObjectId,
        ref: "Feed.news"
        },
        seen: {
          type: Boolean,
          default: false
        },
        favorite: {
          type: Boolean,
          default: false
        }
      },
    ],
    comments: [{
      // _id: {
      //     type: Schema.Types.ObjectId,
      //     ref: "News"
      // },
      type: Schema.Types.ObjectId,
      ref: "Comment"
  }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
