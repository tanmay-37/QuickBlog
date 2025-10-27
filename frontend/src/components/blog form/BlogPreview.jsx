import React from 'react';
import parse from "html-react-parser"; // Make sure html-react-parser is installed

// Helper function to safely clean HTML (if needed, same as BlogPage)
const cleanHtml = (html) => html?.replace(/ class="[^"]*"/g, "") || "";

const BlogPreview = ({ postData }) => {
  // Show a placeholder if no data is available yet
  if (!postData) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-10 bg-gray-100 rounded-2xl">
        <p className="text-gray-500">Blog preview will appear here...</p>
      </div>
    );
  }

  // Use html-react-parser for the content
  const parsedContent = parse(cleanHtml(postData.content));

  // Handle tags from comma-separated string in postData
  const tagsArray = postData.tags
    ? postData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    : [];

  return (
    // ✨ Mimic BlogPage structure and styling ✨
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 font-sans">
      <div className="max-w-4xl mx-auto py-10 lg:px-0 px-4">

        {/* Header Section */}
        <div className="text-center mb-10 mt-4">
          <p className="text-sm text-blue-600 font-medium mb-2">
            {/* Display current date for preview */}
            Published on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (Preview)
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            {/* Use title from postData */}
            {postData.title || 'Untitled Blog Post'}
          </h1>
          <p className="text-xl text-gray-700 mb-6 font-light">
            {/* Use subtitle from postData */}
            {postData.subtitle || 'No subtitle provided.'}
          </p>
          {/* Use author from postData */}
          <button className="bg-purple-100/70 backdrop-blur-sm text-purple-800 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200/50 shadow-sm">
            {postData.author || 'Author Name'}
          </button>
        </div>

        {/* Cover Image */}
        <div className="w-full rounded-2xl overflow-hidden shadow-xl mb-12">
          {/* Use coverPhotoUrl (blob URL or existing URL) from postData */}
          {postData.coverPhotoUrl ? (
            <img
              src={postData.coverPhotoUrl}
              alt={postData.title || 'Cover Image Preview'}
              className="w-full h-auto max-h-[500px] object-cover" // Added max-height constraint
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-2xl">
              No Cover Image Preview
            </div>
          )}
        </div>

        {/* Action Buttons are not needed in preview */}

        {/* Podcast Player is not needed in preview */}

        {/* Tags */}
        {tagsArray.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 mb-10 mt-10">
            {tagsArray.map((t) => (
              <span
                key={t} // Use tag itself as key
                className="text-purple-800 text-xs bg-purple-100/80 backdrop-blur-sm px-3 py-1 rounded-full font-medium border border-purple-200/50 shadow-xs"
              >
                #{t}
              </span>
            ))}
          </div>
        ) : (
           <p className="text-gray-500 mb-8 mt-10 text-center">No tags entered</p>
        )}

        {/* Blog Content */}
        <div className="prose prose-lg mx-auto mt-6 text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900">
          {/* Render the parsed content */}
          {parsedContent}
        </div>
      </div>
    </div>
  );
};

export default BlogPreview;