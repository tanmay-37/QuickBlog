import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BlogCard from './Home/BlogCard'; // Assuming BlogCard is in the same directory or accessible
import Navbar from './Navbar'; // Or ensure Navbar is placed appropriately in your layout
import { getCurrentUserSession } from '../cognitoAuth'; // Needed to get the token

const MyBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchUserBlogs = async () => {
            setLoading(true);
            setError(false);
            try {
                // 1. Get the current user session and ID token for authorization
                const session = await getCurrentUserSession();
                const idToken = session.getIdToken().getJwtToken();

                // 2. Fetch data, passing the ID token in the Authorization header
                const response = await axios.get('http://localhost:5000/api/blogs/myblogs', {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
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

    // NOTE: The edit logic will be handled within the BlogCard component
    // by checking if the current route is '/my-blogs'.

    return (
        <div className="min-h-screen bg-white text-gray-800">
            {/* You should ideally wrap this with your main layout or use a separate layout component */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                <h1 className="text-4xl font-bold mb-10 border-b pb-4">
                    My Blogs ({blogs.length})
                </h1>

                {loading && (
                    <p className="text-center text-xl text-indigo-600">Loading your blogs... ⏳</p>
                )}

                {!loading && error && (
                    <p className="text-center text-xl text-red-600">
                        Error fetching blogs. Are you logged in? 🔴
                    </p>
                )}

                {!loading && !error && blogs.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                            You haven't created any blogs yet.
                        </h2>
                        <button
                            onClick={() => window.location.href = '/blogs/create'}
                            className="inline-flex items-center justify-center px-4 py-2 mt-4 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Create Your First Blog
                        </button>
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
                                // Pass a flag to enable the edit button
                                showEditButton={true}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBlogs;