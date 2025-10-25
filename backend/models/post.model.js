// src/models/post.model.js
import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // This is where the sanitized HTML from TinyMCE will be stored
    content: {
      type: String,
      required: true,
    },
    // You can add more fields here later
    // coverImage: {
    //   type: String, // URL to the image
    // },
    // author: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User"
    // }
  },
  {
    timestamps: true, // This adds createdAt and updatedAt fields
  }
);

export const Post = mongoose.model('Post', postSchema);