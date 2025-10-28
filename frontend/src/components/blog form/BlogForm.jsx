import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'; // Ensure axios is imported

// Corrected import paths (adjust if needed)
import RTE from './RTE';
import GlassButton from '../GlassButton.jsx'; // Assuming GlassButton is in the components folder, one level up
import BlogPreview from './BlogPreview';
import blogService from '../../services/blogService.js';
import { getCurrentUserSession } from '../../cognitoAuth.js'; // Assuming cognitoAuth is two levels up

// Import your AlertModal if you have one
// import AlertModal from './AlertModal';

const BlogForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [mode, setMode] = useState('create');
    const [existingBlog, setExistingBlog] = useState(null);
    const [loadingBlogData, setLoadingBlogData] = useState(false);
    const [blogError, setBlogError] = useState(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    // Placeholder for alert modal state - replace if using a modal component
    const [alertInfo, setAlertInfo] = useState({ isOpen: false, title: '', message: '', onClose: () => {} });

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
            author: '', // Author is now editable
            // authorId removed from defaults
            coverPhoto: null,
            tags: '',
        },
    });

    // Helper function for alerts (placeholder - replace with your modal logic)
    const showAlert = (title, message, onCloseCallback = () => {}) => {
        alert(`${title}: ${message}`); // Basic browser alert
        onCloseCallback();
        // --- Replace above alert with your modal logic ---
    };

    // --- Data Fetching Logic (Edit Mode) ---
    const fetchBlogData = useCallback(async () => {
        setLoadingBlogData(true);
        setBlogError(null);
        try {
            // Fetch blog data first
            const res = await blogService.getBlogById(id);
            const blog = res.data;
            setExistingBlog(blog);

            // Then, check user session for authorization
            const session = await getCurrentUserSession();
            const loggedInUserId = session.getIdToken().payload.sub;
            if (blog.authorId !== loggedInUserId) {
                showAlert('Authorization Error', 'You are not authorized to edit this post.', () => navigate('/'));
                return; // Stop if not authorized
            }

            // Populate form if authorized
            reset({
                title: blog.title,
                subtitle: blog.subtitle,
                content: blog.content || '',
                author: blog.author, // Use stored author name
                tags: blog.tags?.join(', ') || '',
            });
            setValue('content', blog.content || '');

        } catch (err) {
            console.error('Failed to load blog or session:', err.message);
            if (err.message && err.message.includes("No current user")) {
                setBlogError('You must be logged in to edit posts. Please log in.');
            } else {
                setBlogError('Could not load blog data. Please check your network or try again.');
            }
        } finally {
            setLoadingBlogData(false);
        }
    }, [id, reset, navigate, setValue]);

    // Effect for Edit Mode
    useEffect(() => {
        if (id) {
            setMode('edit');
            fetchBlogData();
        }
    }, [id, fetchBlogData]);
    // --- End Data Fetching ---

    // --- Form Submission Logic ---
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        let authorIdToSubmit = null;

        try {
            // Verify user session and get ID at submission time
            const session = await getCurrentUserSession();
            const payload = session.getIdToken().payload;
            authorIdToSubmit = payload.sub;
            const authToken = session.getIdToken().getJwtToken();

            if (!authorIdToSubmit) {
                 throw new Error("Could not verify user identity. Please log in again.");
            }

            // Prepare FormData
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('subtitle', data.subtitle);
            formData.append('content', data.content);
            formData.append('author', data.author); // Use the editable author name from form
            formData.append('authorId', authorIdToSubmit); // Use the logged-in user's ID
            const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            tagsArray.forEach(tag => formData.append('tags[]', tag));
            if (data.coverPhoto && data.coverPhoto[0]) {
                formData.append('coverPhoto', data.coverPhoto[0]);
            }

            // Submit based on mode
            if (mode === 'edit' && existingBlog) {
                if (existingBlog.authorId !== authorIdToSubmit) { // Re-verify ownership
                     throw new Error("Authorization mismatch. Cannot update post.");
                }
                await blogService.updateBlog(existingBlog._id, formData, authToken);
                showAlert('Success!', 'Blog updated successfully!', () => navigate(`/blogs/${existingBlog._id}`));
            } else {
                const res = await blogService.createBlog(formData, authToken);
                showAlert('Success!', 'Blog post created!', () => {
                    reset(); // Clear form
                    navigate(`/blogs/${res.data._id}`);
                });
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            if (error.message && error.message.includes("No current user")) {
                 showAlert('Session Error', 'Your session expired. Please log in again to submit.', () => navigate('/login'));
            } else {
                 showAlert('Submission Error', `Error: ${msg}`);
            }
            console.error('Blog submission error:', msg, error);
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- End Form Submission ---

    // --- Preview Logic ---
    const handlePreview = () => {
        const currentData = getValues();
        let coverPhotoUrl = previewData?.coverPhotoUrl || null;
        const coverFile = currentData.coverPhoto && currentData.coverPhoto[0];

        if (coverFile && previewData?.coverPhotoUrl && previewData.coverPhotoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewData.coverPhotoUrl);
            coverPhotoUrl = null;
        }
        if (coverFile) {
            coverPhotoUrl = URL.createObjectURL(coverFile);
        } else if (mode === 'edit' && existingBlog?.coverImage && !coverPhotoUrl) {
            coverPhotoUrl = existingBlog.coverImage;
        }
        setPreviewData({ ...currentData, coverPhotoUrl });
        setIsPreviewOpen(true);
    };
     useEffect(() => { // Cleanup Object URL
        return () => {
            if (previewData?.coverPhotoUrl && previewData.coverPhotoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewData.coverPhotoUrl);
            }
        };
    }, [previewData]);
    // --- End Preview Logic ---

    // --- Text Enhancement Logic ---
    const handleEnhanceText = async (enhanceType) => {
        const currentContent = getValues('content');
        if (!currentContent || currentContent.trim().length < 50) {
            showAlert("Content Too Short", "Please write at least 50 characters before enhancing.");
            return;
        }
        setIsEnhancing(enhanceType);
        try {
            const requestData = { textToEnhance: currentContent, enhanceType: enhanceType };
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/enhance-text`, requestData); // Use correct backend URL
            if (res.data && res.data.enhancedText) {
                setValue('content', res.data.enhancedText, { shouldValidate: true, shouldDirty: true });
                showAlert("Success", "Text enhancement applied!");
            } else {
                showAlert("Enhancement Failed", "Received an unexpected response from the server.");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "An error occurred during enhancement.";
            showAlert("Enhancement Error", errorMsg);
            console.error("Error enhancing text:", error);
        } finally {
            setIsEnhancing(false);
        }
    };
    // --- End Text Enhancement ---

    // ✨ Previous Input Styling ✨
    const inputBaseClass = `
      block w-full bg-transparent px-1 py-2
      text-gray-900
      border-0 border-b-2 border-gray-400/50
      placeholder-gray-500/70
      focus:outline-none focus:ring-0
      focus:border-black
      transition-colors duration-300 ease-in-out
    `;
    // ✨ Previous Label Styling ✨
    const labelBaseClass = "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2";

    // --- Loading/Error States ---
    if (loadingBlogData) {
        return (
             // ✨ Reverted Background ✨
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <p className="text-xl font-semibold text-indigo-600">Loading blog data... ⏳</p>
            </div>
        );
    }
    if (blogError) {
        return (
             // ✨ Reverted Background ✨
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blog</h2>
                <p className="text-gray-700 mb-6">{blogError}</p>
                 {/* ✨ Reverted Button Style ✨ */}
                <button
                    onClick={fetchBlogData}
                    className="py-2 px-6 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                >
                    Retry Loading
                </button>
                 {/* ✨ Reverted Button Style ✨ */}
                <button
                    onClick={() => navigate('/my-blogs')}
                    className="py-2 px-6 text-sm font-medium text-gray-700 rounded-lg bg-gray-300 hover:bg-gray-400 mt-3 transition-colors"
                >
                    Go to My Blogs
                </button>
            </div>
        );
    }
    // --- End Loading/Error States ---

    // --- Main Form Render ---
    return (
        <>
            {/* ✨ Reverted Background ✨ */}
            <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-12 font-sans">
                 {/* ✨ Reverted Form Container Style ✨ */}
                <div className="max-w-4xl mx-auto p-6 sm:p-10 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
                     {/* ✨ Reverted Titles/Text ✨ */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        {mode === 'edit' ? 'Edit Blog Post' : 'Create New Post'}
                    </h2>
                    <p className="text-gray-600 mb-8 sm:mb-12">
                        {mode === 'edit'
                            ? 'Update the details below to modify your blog.'
                            : 'Fill out the details below to publish your article.'}
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-10"> {/* Adjusted spacing */}
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className={labelBaseClass}>Title *</label>
                            <input id="title" type="text" placeholder="Your Blog Title" {...register('title', { required: 'Title is required' })} className={inputBaseClass}/>
                            {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
                        </div>

                        {/* Subtitle */}
                        <div>
                            <label htmlFor="subtitle" className={labelBaseClass}>Subtitle *</label>
                            <input id="subtitle" type="text" placeholder="Subtitle" {...register('subtitle', { required: 'Subtitle is required' })} className={inputBaseClass}/>
                            {errors.subtitle && <p className="mt-2 text-sm text-red-600">{errors.subtitle.message}</p>}
                        </div>

                        {/* Author (EDITABLE) */}
                        <div>
                            <label htmlFor="author" className={labelBaseClass}>Author Name *</label>
                            <input id="author" type="text" placeholder="Enter the author's display name" {...register('author', { required: "Author name is required" })} className={inputBaseClass}/>
                            {errors.author && <p className="mt-2 text-sm text-red-600">{errors.author.message}</p>}
                        </div>

                        {/* Cover Photo */}
                        <div>
                            <label htmlFor="coverPhoto" className={labelBaseClass + " mb-3"}> {/* Added mb-3 */}
                                Cover Photo {mode === 'edit' && existingBlog?.coverImage && '(Current image loaded)'}
                            </label>
                             {/* ✨ Reverted File Input Style ✨ */}
                            <input id="coverPhoto" type="file" accept="image/*" {...register('coverPhoto')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/50 file:text-gray-800 hover:file:bg-white/80 cursor-pointer transition-colors duration-300"/>
                            {errors.coverPhoto && <p className="mt-2 text-sm text-red-600">{errors.coverPhoto.message}</p>}
                        </div>
                        {/* Display current image in edit mode */}
                        {mode === 'edit' && existingBlog?.coverImage && (
                             // ✨ Reverted Image Preview Style ✨
                            <div className="relative w-full h-32 overflow-hidden rounded-lg border border-gray-300">
                                <img src={existingBlog.coverImage} alt="Current Cover" className="w-full h-full object-cover"/>
                                <p className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">Current Image</p>
                            </div>
                        )}

                        {/* Tags */}
                        <div>
                            <label htmlFor="tags" className={labelBaseClass}>Tags (comma-separated)</label>
                            <input id="tags" type="text" placeholder="e.g. Technology, Startup, Finance" {...register('tags')} className={inputBaseClass}/>
                            {errors.tags && <p className="mt-2 text-sm text-red-600">{errors.tags.message}</p>}
                        </div>

                        {/* Content Section with Enhance Buttons */}
                        <div>
                            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                                <label className={labelBaseClass}>Content *</label>
                                <div className="flex gap-2">
                                     {/* ✨ Reverted Enhance Button Styles ✨ */}
                                    <button type="button" onClick={() => handleEnhanceText('grammar')} disabled={!!isEnhancing} className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isEnhancing === 'grammar' ? 'bg-blue-200 text-blue-800 animate-pulse' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                                        {isEnhancing === 'grammar' ? "Fixing..." : "Fix Grammar/Spelling"}
                                    </button>
                                    <button type="button" onClick={() => handleEnhanceText('full_enhance')} disabled={!!isEnhancing} className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isEnhancing === 'full_enhance' ? 'bg-purple-200 text-purple-800 animate-pulse' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                                        {isEnhancing === 'full_enhance' ? "Enhancing..." : "✨ Enhance Full Text"}
                                    </button>
                                </div>
                            </div>
                            {/* ✨ Reverted RTE Container Style ✨ */}
                            <div className="rounded-xl overflow-hidden border border-gray-400/30 bg-white/30 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all duration-300">
                                <RTE name="content" control={control} rules={{ required: 'Content is required' }} />
                            </div>
                            {errors.content && <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>}
                        </div>

                        {/* Submit/Preview Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            {/* ✨ Using GlassButton Component ✨ */}
                            <GlassButton type="submit" disabled={isSubmitting || !!isEnhancing}>
                                {isSubmitting ? 'Submitting...' : mode === 'edit' ? 'Save Changes' : 'Create Blog Post'}
                            </GlassButton>
                            {/* ✨ Reverted Preview Button Style ✨ */}
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

            {/* Preview Modal (Style unchanged from previous) */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setIsPreviewOpen(false)}>
                    <button className="absolute top-4 right-4 text-white/80 text-4xl font-bold hover:text-white z-[110]" onClick={() => setIsPreviewOpen(false)}>&times;</button>
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <BlogPreview postData={previewData} />
                    </div>
                </div>
            )}

            {/* Render Alert Modal */}
            {/* <AlertModal isOpen={alertInfo.isOpen} onClose={alertInfo.onClose} title={alertInfo.title}>{alertInfo.message}</AlertModal> */}
        </>
    );
};

export default BlogForm;