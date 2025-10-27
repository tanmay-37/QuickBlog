import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import RTE from './RTE';
import GlassButton from '../GlassButton';
import BlogPreview from './BlogPreview';
import blogService from '../../services/blogService';
import { getCurrentUserSession } from '../../cognitoAuth';

const BlogForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [mode, setMode] = useState('create'); // 'create' or 'edit'
  const [existingBlog, setExistingBlog] = useState(null);
    
  // ⭐ NEW STATES FOR DATA FETCHING STATUS ⭐
  const [loadingBlogData, setLoadingBlogData] = useState(false);
  const [blogError, setBlogError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      subtitle: '',
      content: '',
      author: '',
      authorId: '',
      coverPhoto: null,
      tags: '',
    },
  });
    
  // Memoized function for fetching data
  // Added setValue to dependencies
  const fetchBlogData = useCallback(async () => { 
    setLoadingBlogData(true);
    setBlogError(null);
    try {
      const res = await blogService.getBlogById(id);
      const blog = res.data;
      setExistingBlog(blog);

      // Prefill the form fields
      reset({
        title: blog.title,
        subtitle: blog.subtitle,
        content: blog.content || '', // Ensure content is explicitly set
        author: blog.author,
        authorId: blog.authorId,
        tags: blog.tags?.join(', ') || '',
      });
        
      // ⭐ SAFETY: Explicitly set the value for the controlled RTE ⭐
      setValue('content', blog.content || '');


      // Check if logged-in user is the author
      const session = await getCurrentUserSession();
      const loggedInUserId = session.getIdToken().payload.sub;
      if (blog.authorId !== loggedInUserId) {
        alert('You are not authorized to edit this post.');
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to load blog:', err.message);
      setBlogError('Could not load blog data. Please check your network or try again.');
    } finally {
      setLoadingBlogData(false);
    }
  }, [id, reset, navigate, setValue]); // Added setValue to dependencies


  // Fetch user session (author info)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await getCurrentUserSession();
        const payload = session.getIdToken().payload;
        const usersFullName = payload.name || payload.email || 'Blog Author';
        const userId = payload.sub;
        setValue('author', usersFullName);
        setValue('authorId', userId);
      } catch (error) {
        console.error('Could not fetch user session:', error.message);
        alert('Could not verify user. Please log in again.');
        navigate('/login');
      }
    };
    fetchUser();
  }, [setValue, navigate]);

  // If id is present => Edit mode (uses the memoized function)
  useEffect(() => {
    if (id) {
      setMode('edit');
      fetchBlogData(); // Call the fetch function
    }
  }, [id, fetchBlogData]);

  const onSubmit = async (data) => {
    if (!data.authorId || !data.author) {
      alert('Author details missing. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await getCurrentUserSession();
      const authToken = session.getIdToken().getJwtToken();

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subtitle', data.subtitle);
      formData.append('content', data.content);
      formData.append('author', data.author);
      formData.append('authorId', data.authorId);

      const tagsArray = data.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      tagsArray.forEach((tag) => formData.append('tags[]', tag));

      if (data.coverPhoto && data.coverPhoto[0]) {
        formData.append('coverPhoto', data.coverPhoto[0]);
      }

      if (mode === 'edit' && existingBlog) {
        // 🔹 UPDATE existing blog
        const res = await blogService.updateBlog(existingBlog._id, formData, authToken);
        alert('Blog updated successfully!');
        navigate(`/blogs/${existingBlog._id}`);
      } else {
        // 🔹 CREATE new blog
        const res = await blogService.createBlog(formData, authToken);
        alert('Blog post created!');
        reset();
        navigate(`/blogs/${res.data._id}`);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert(`Error: ${msg}`);
      console.error('Blog submission error:', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    const currentData = getValues();
    let coverPhotoUrl = null;
    const coverFile = currentData.coverPhoto && currentData.coverPhoto[0];
    
    // Handle image preview URL cleanup
    if (previewData?.coverPhotoUrl) {
      URL.revokeObjectURL(previewData.coverPhotoUrl);
    }
    
    if (coverFile) {
        coverPhotoUrl = URL.createObjectURL(coverFile);
    } else if (mode === 'edit' && existingBlog?.coverImage) {
        // Use existing image if no new file is uploaded
        coverPhotoUrl = existingBlog.coverImage;
    }
    
    setPreviewData({ ...currentData, coverPhotoUrl });
    setIsPreviewOpen(true);
  };

  const inputBaseClass = `
    block w-full bg-transparent px-1 py-2 
    text-gray-900 
    border-0 border-b-2 border-gray-400/50
    placeholder-gray-500/70
    focus:outline-none focus:ring-0 
    focus:border-black
    transition-colors duration-300 ease-in-out
  `;

  // ⭐ DISPLAY LOADING OR ERROR MESSAGES ⭐
  if (loadingBlogData) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <p className="text-xl font-semibold text-indigo-600">Loading blog data for editing... ⏳</p>
        </div>
    );
  }

  if (blogError) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blog</h2>
            <p className="text-gray-700 mb-6">{blogError}</p>
            <button
                onClick={fetchBlogData} // Allow user to retry fetching data
                className="py-2 px-6 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
            >
                Retry Loading
            </button>
            <button
                onClick={() => navigate('/my-blogs')} // Option to navigate away
                className="py-2 px-6 text-sm font-medium text-gray-700 rounded-lg bg-gray-300 hover:bg-gray-400 mt-3 transition-colors"
            >
                Go to My Blogs
            </button>
        </div>
    );
  }

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-12">
        <div className="max-w-4xl mx-auto p-6 sm:p-10 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {mode === 'edit' ? 'Edit Blog Post' : 'Create New Post'}
          </h2>
          <p className="text-gray-600 mb-8 sm:mb-12">
            {mode === 'edit'
              ? 'Update the details below to modify your blog.'
              : 'Fill out the details below to publish your article.'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-10">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                placeholder="Your Blog Title"
                {...register('title', { required: 'Title is required' })}
                className={inputBaseClass}
              />
              {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* Subtitle */}
            <div>
              <label htmlFor="subtitle" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Subtitle *
              </label>
              <input
                id="subtitle"
                type="text"
                placeholder="Subtitle"
                {...register('subtitle', { required: 'Subtitle is required' })}
                className={inputBaseClass}
              />
              {errors.subtitle && <p className="mt-2 text-sm text-red-600">{errors.subtitle.message}</p>}
            </div>

            {/* Author (readonly) */}
            <div>
              <label htmlFor="author" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Author
              </label>
              <input
                id="author"
                type="text"
                {...register('author')}
                className={`${inputBaseClass} bg-gray-100/50 cursor-not-allowed`}
                readOnly
                disabled
              />
            </div>

            {/* Cover Photo */}
            <div>
              <label htmlFor="coverPhoto" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">
                Cover Photo {mode === 'edit' && existingBlog?.coverImage && '(Current image loaded)'}
              </label>
              <input
                id="coverPhoto"
                type="file"
                accept="image/*"
                {...register('coverPhoto')}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/50 file:text-gray-800 hover:file:bg-white/80 cursor-pointer transition-colors duration-300"
              />
            </div>
            
            {/* Display current image in edit mode */}
            {mode === 'edit' && existingBlog?.coverImage && (
                <div className="relative w-full h-32 overflow-hidden rounded-lg border border-gray-300">
                    <img
                        src={existingBlog.coverImage}
                        alt="Current Cover"
                        className="w-full h-full object-cover"
                    />
                    <p className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">Current Image</p>
                </div>
            )}


            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                placeholder="e.g. Technology, Startup, Finance"
                {...register('tags')}
                className={inputBaseClass}
              />
              {errors.tags && <p className="mt-2 text-sm text-red-600">{errors.tags.message}</p>}
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Content *</label>
              <div className="rounded-xl overflow-hidden border border-gray-400/30 bg-white/30 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all duration-300">
                <RTE name="content" control={control} rules={{ required: 'Content is required' }} />
              </div>
              {errors.content && <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <GlassButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : mode === 'edit' ? 'Save Changes' : 'Create Blog Post'}
              </GlassButton>

              <button
                type="button"
                onClick={handlePreview}
                className="py-3 px-10 text-sm font-medium rounded-xl bg-gray-200/50 text-gray-700 hover:bg-gray-300 transition-all duration-300"
              >
                View Preview
              </button>
            </div>
          </form>
        </div>
      </div>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-4xl font-bold hover:text-gray-400 z-50"
            onClick={() => setIsPreviewOpen(false)}
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