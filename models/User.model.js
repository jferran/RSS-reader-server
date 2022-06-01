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
    newsList: [
      {
        entry: {
        type: Schema.Types.ObjectId,
        ref: "News"
        }
      },
      {
        seen: {
          type: Boolean
        },
        favorite: {
          type: Boolean
        }
      },
    ],
    newsToBeRead: [{
      type: Schema.Types.ObjectId,
      ref: "News"
    }],
    readNews: [{
      type: Schema.Types.ObjectId,
      ref: "News"
    }]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
