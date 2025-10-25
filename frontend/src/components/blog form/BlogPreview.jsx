import React from 'react';

const BlogPreview = ({ postData }) => {
  if (!postData) return null;

  return (
    <article>
      
      {/* === HERO CONTAINER === */}
      <div className="relative w-full">
        
        {/* 1. Cover Image */}
        {postData.coverPhotoUrl ? (
          <img 
            src={postData.coverPhotoUrl} 
            alt="Cover preview" 
            className="w-full h-auto max-h-[450px] object-cover rounded-t-2xl" 
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-t-2xl"></div>
        )}

        {/* === UPDATED: The "Blurred" Gradient Overlay === */}
        {/*
          - Height changed from h-1/2 to h-[30%]
          - The CSS mask for the gradual fade is still applied.
        */}
        <div 
          className="
            absolute bottom-0 left-0 right-0 h-[60%] 
            bg-gradient-to-t from-black/70 to-transparent 
            backdrop-blur-md
          "
          style={{
            maskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
          }}
        ></div>
        
        {/* === UPDATED: Title & Subtitle Container === */}
        {/*
          - Padding reduced slightly (from p-8/p-12) to p-6/p-8 
            to fit better in the 30% height.
        */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
            {postData.title || 'Untitled Post'}
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-200">
            {postData.subtitle || ''}
          </h2>
        </div>
      </div>
      
      {/* === CONTENT CONTAINER === */}
      <div className="p-6 md:p-10 text-black">
        
        {/* Author and Date */}
        <div className="flex items-center space-x-4 mb-8 text-black">
          <div>
            <p className="font-semibold text-black">
              {postData.author || 'Anonymous Author'}
            </p>
            <p className="text-sm text-gray-700">
              {new Date().toLocaleDateString()} (Preview)
            </p>
          </div>
        </div>
        
        {/* Main Content (prose) */}
        <div 
          className="prose prose-lg max-w-none text-black"
          dangerouslySetInnerHTML={{ __html: postData.content }} 
        />
      </div>
    </article>
  );
};

export default BlogPreview;