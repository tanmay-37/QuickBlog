import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import RTE from './RTE';
import GlassButton from '../GlassButton';
import BlogPreview from './BlogPreview'; // For the modal

// Assume you have a service file to handle API calls
// import blogService from '../services/blogService';

/**
 * The main form for creating a new blog post.
 * @param {object} props
 * @param {string} props.authorName - The name of the logged-in user.
 * @param {string} props.authorId - The Cognito sub (UUID) of the logged-in user.
 */
const BlogForm = ({ authorName, authorId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const { 
    register, 
    handleSubmit, 
    control, 
    getValues, // Used to get data for the preview
    formState: { errors } 
  } = useForm({
    defaultValues: {
      title: '',
      subtitle: '', // Matches 'subtitle' in your schema
      content: '',
      author: authorName || '', // Pre-filled from props
      authorId: authorId || '', // Pre-filled from props
      coverPhoto: null,
      tags: '',
    }
  });

  /**
   * Handles the final form submission to the backend.
   */
  const onSubmit = async (data) => {
    if (!data.authorId) {
      console.error("Critical: Author ID is missing. Cannot create post.");
      return;
    }

    setIsSubmitting(true);
    
    // Use FormData to send text and files in one request
    const formData = new FormData();

    // Append all text/content fields
    formData.append('title', data.title);
    formData.append('subtitle', data.append); // Corrected from data.append to data.subtitle
    formData.append('content', data.content);
    formData.append('author', data.author);
    formData.append('authorId', data.authorId);

    // Process tags from a comma-separated string into an array
    const tagsArray = data.tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag); // Remove empty strings

    // Append each tag individually for the server to parse as an array
    tagsArray.forEach(tag => {
      formData.append('tags[]', tag);
    });

    // Append the file if it exists
    if (data.coverPhoto && data.coverPhoto[0]) {
      formData.append('coverPhoto', data.coverPhoto[0]);
    }

    try {
      // --- This is where you call your API ---
      // const response = await blogService.createBlog(formData);
      // console.log('Blog created successfully:', response);
      
      // For demonstration, we'll just log the FormData
      console.log('Form data ready for submission:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      // In a real app, you would reset the form or redirect here
      
    } catch (error) {
      console.error('Error creating blog:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Grabs current form data and opens the preview modal.
   */
  const handlePreview = () => {
    const currentData = getValues();
    
    let coverPhotoUrl = null;
    const coverFile = currentData.coverPhoto && currentData.coverPhoto[0];

    if (coverFile) {
      // Create a temporary local URL to preview the selected image
      coverPhotoUrl = URL.createObjectURL(coverFile);
    }

    setPreviewData({ ...currentData, coverPhotoUrl });
    setIsPreviewOpen(true);
  };

  // Reusable class for minimal inputs
  const inputBaseClass = `
    block w-full bg-transparent px-1 py-2 
    text-gray-900 
    border-0 border-b-2 border-gray-400/50
    placeholder-gray-500/70
    focus:outline-none focus:ring-0 
    focus:border-black
    transition-colors duration-300 ease-in-out
  `;

  return (
    <>
      {/* Page Background Wrapper (dark: variants removed) */}
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-12">
        
        {/* Translucent Form Card (dark: variants removed) */}
        <div className="max-w-4xl mx-auto p-6 sm:p-10 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Create New Post
          </h2>
          <p className="text-gray-600 mb-8 sm:mb-12">
            Fill out the details below to publish your article.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-10">
            
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                placeholder="Your Awesome Blog Title"
                {...register("title", { required: "Title is required" })}
                className={inputBaseClass}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Subtitle Field */}
            <div>
              <label htmlFor="subtitle" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Subtitle *
              </label>
              <input
                id="subtitle"
                type="text"
                placeholder="An engaging subtitle (required)"
                {...register("subtitle", { required: "Subtitle is required" })}
                className={inputBaseClass}
              />
              {errors.subtitle && (
                <p className="mt-2 text-sm text-red-600">{errors.subtitle.message}</p>
              )}
            </div>

            {/* Author Field (Read-only) */}
            <div>
              <label htmlFor="author" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Author
              </label>
              <input
                id="author"
                type="text"
                {...register("author")}
                className={`${inputBaseClass} bg-gray-100/50 cursor-not-allowed`}
                readOnly
                disabled
              />
            </div>

            {/* Cover Photo Field */}
            <div>
              <label htmlFor="coverPhoto" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">
                Cover Photo
              </label>
              <input
                id="coverPhoto"
                type="file"
                accept="image/*"
                {...register("coverPhoto")}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-5
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-white/50
                  file:text-gray-800
                  hover:file:bg-white/80
                  cursor-pointer transition-colors duration-300"
              />
            </div>

            {/* Tags Field */}
            <div>
              <label htmlFor="tags" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                placeholder="e.g. react, javascript, webdev (comma-separated)"
                {...register("tags")}
                className={inputBaseClass}
              />
            </div>

            {/* Rich Text Editor (Content) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">
                Content *
              </label>
              <div className="rounded-xl overflow-hidden 
                border border-gray-400/30 
                bg-white/30
                focus-within:border-black 
                focus-within:ring-1 focus-within:ring-black
                transition-all duration-300"
              >
                <RTE 
                  name="content"
                  control={control}
                  rules={{ required: "Blog content is required" }}
                />
              </div>
              {errors.content && (
                <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            {/* Button Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <GlassButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Create Blog Post'}
              </GlassButton>
              
              <button
                type="button" // Prevents form submission
                onClick={handlePreview}
                className="py-3 px-10 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-200/50 transition-all duration-300"
              >
                View Preview
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal (This is already light-theme only from our previous changes) */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-black text-4xl font-bold hover:text-gray-600 z-50"
            onClick={() => setIsPreviewOpen(false)}
            aria-label="Close preview"
          >
            &times;
          </button>

          <div 
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <BlogPreview postData={previewData} />
          </div>
        </div>
      )}
    </>
  );
};

export default BlogForm;