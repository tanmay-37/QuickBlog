import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    subtitle: {
        type: String,
        required: true,
        trim: true,
    },

    content: {
        type: String, // HTML content from rich text editor
        required: true,
    },

    author: {
        type: String, // stores author name
        required: true,
    },

    date: {
        type: Date,
        default: Date.now,
    },

    coverImage: {
        type: String,
    },

    tags: [String],

    translated: {
        type: Map,
        of: String,
    },

    audio: {
        type: Map,
        of: String,
    },

    authorId: { 
        type: String, 
        required: true 
    }, // Cognito user sub (UUID)

}, { timestamps: true });

export default mongoose.model("Blog", BlogSchema);