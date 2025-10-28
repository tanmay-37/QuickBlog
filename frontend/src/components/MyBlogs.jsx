import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BlogCard from './Home/BlogCard'; 
import { getCurrentUserSession } from '../cognitoAuth';
// ✨ 1. Import your new modal
import ConfirmationModal from './ConfirmationModal'; // Adjust path if needed

const MyBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // ✨ 2. Add state for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null); // Store the ID of the blog

    useEffect(() => {
        const fetchUserBlogs = async () => {
            setLoading(true);
            setError(false);
            try {
                const session = await getCurrentUserSession();
                const idToken = session.getIdToken().getJwtToken();
                const response = await axios.get('http://localhost:5000/api/blogs/myblogs', {
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                setBlogs(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Error fetching user blogs:', err);
                setError(true);
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUserBlogs();
    }, []);

    // ✨ 3. This function just OPENS the modal
    // We pass this function to the BlogCard
    const handleDeleteClick = (blogId) => {
        setBlogToDelete(blogId); // Set which blog we're about to delete
        setIsModalOpen(true);    // Open the modal
    };

    // ✨ 4. This function CLOSES the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setBlogToDelete(null); // Clear the ID
    };

    // ✨ 5. This function runs when you click "Delete" IN THE MODAL
    const confirmDeleteBlog = async () => {
        if (!blogToDelete) return; // Safety check

        try {
            const session = await getCurrentUserSession();
            const idToken = session.getIdToken().getJwtToken();

            await axios.delete(`http://localhost:5000/api/blogs/${blogToDelete}`, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            // If successful, remove the blog from the state
            setBlogs(currentBlogs =>
                currentBlogs.filter(blog => blog._id !== blogToDelete)
            );

        } catch (err) {
            console.error('Error deleting blog:', err);
            setError("Failed to delete blog. Please try again.");
        } finally {
            closeModal(); // Close the modal
        }
    };

    // ... (rest of your component)
    return (
        <div className="min-h-screen bg-white text-gray-800">
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                <h1 className="text-4xl font-bold mb-10 border-b pb-4">
                    My Blogs ({blogs.length})
                </h1>

                {/* ... (Your loading, error, and empty state JSX) ... */}
                {loading && (
                    <p className="text-center text-xl text-indigo-600">Loading your blogs... ⏳</p>
                )}
                {!loading && error && (
                     <p className="text-center text-xl text-red-600">
                         {typeof error === 'string' ? error : "Error fetching blogs. Are you logged in? 🔴"}
                     </p>
                )}
                {!loading && !error && blogs.length === 0 ? (
                    <div className="text-center py-20">
                         {/* ... empty state button ... */}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {blogs.map(post => (
                            <BlogCard
                                key={post._id}
                                id={post._id}
                                title={post.title}
                                subtitle={post.subtitle}
                                coverImage={post.coverImage}
                                tags={post.tags}
                                showEditButton={true}
                                // ✨ 6. Pass the OPEN modal function
                                onDeleteClick={handleDeleteClick}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* ✨ 7. Render the modal at the end */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={confirmDeleteBlog}
                title="Confirm Deletion"
            >
                Are you sure you want to delete this blog? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default MyBlogs;