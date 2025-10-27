import React, { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';
import BlogCard from './BlogCard';
import axios from 'axios';

// --- SVG Icon ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-700/80"> {/* Adjusted color */}
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

// --- Main HomePage Component ---
const HomePage = () => {

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // Used in useEffect and display logic

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState(''); // Live text in the input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const categories = ['All', 'Technology', 'Startup', 'Lifestyle', 'Finance'];

useEffect(() => {
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(false); // Reset error on new fetch attempt
      const response = await axios.get('http://localhost:5000/api/blogs');
      setBlogs(Array.isArray(response.data) ? response.data : []); // Ensure it's an array
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setBlogs([]);
      setError(true); // Set error state on failure
    } finally {
      setLoading(false);
    }
  };

  fetchBlogs();
}, []);

  // Debounce hook
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

// Filtering logic (unchanged)
const filteredPosts = blogs
  .filter(post => {
    if (selectedCategory === 'All') return true;
    const categoryString = post.tag || post.category;
    const tagsArray = Array.isArray(post.tags) ? post.tags : [];
    return categoryString === selectedCategory || tagsArray.includes(selectedCategory);
  })
  .filter(post => {
    const lowerCaseQuery = debouncedSearchTerm.toLowerCase().trim();
    if (lowerCaseQuery === '') return true;
    const titleMatch = post.title && post.title.toLowerCase().includes(lowerCaseQuery);
    const descriptionMatch = post.description && post.description.toLowerCase().includes(lowerCaseQuery);
    const tagMatch =
      (post.tag && post.tag.toLowerCase().includes(lowerCaseQuery)) ||
      (post.category && post.category.toLowerCase().includes(lowerCaseQuery)) ||
      (Array.isArray(post.tags) && post.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)));
    return titleMatch || descriptionMatch || tagMatch;
  });

  return (
    // ✨ Added gradient background and default text color ✨
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 text-gray-800 font-sans">

      <main>
        {/* 1. Hero Section */}
        <section className="py-20 md:py-32 text-center flex flex-col items-center px-4">
          {/* ✨ AI Banner with Glass Effect ✨ */}
          <span className="inline-flex items-center bg-purple-100/60 backdrop-blur-sm text-purple-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-purple-200/50 shadow-sm">
              New: AI feature integrated
              <img
                src="/star.svg"
                alt="star icon"
                className="w-3.5 h-3.5 ml-1.5"
              />
            </span>

          {/* Title - Adjusted text color */}
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight text-gray-900">
            Your own <span className="text-indigo-600">blogging platform.</span>
          </h1>

          {/* Description - Adjusted text color */}
          <p className="text-gray-700 max-w-lg mx-auto mb-10 text-lg">
            This is your space to share what matters, and to write without filters.
          </p>

          {/* ✨ Search Bar with Glass Effect ✨ */}
          <div className="relative w-full max-w-xl mx-auto">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
              <SearchIcon />
            </div>

            <input
              type="text"
              placeholder="Search for blogs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // Glass effect for input
              className="w-full py-4 pl-14 pr-36 rounded-full bg-white/70 backdrop-blur-md border border-purple-200/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-purple-700/60 text-gray-900"
            />

            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white font-medium py-3 px-8 rounded-full text-sm hover:bg-indigo-700 transition-colors duration-300 shadow-md"
            >
              Search
            </button>
          </div>
        </section>

        {/* 3. Category Filters (Slightly adjusted style) */}
        <section className="pb-16 flex justify-center items-center gap-6 md:gap-8 flex-wrap px-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              // Adjusted colors for consistency
              className={`
                text-base font-medium transition-colors duration-300 pb-1 border-b-2
                ${selectedCategory === category
                  ? 'text-indigo-600 border-indigo-600' // Active state
                  : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'}
              `}
            >
              {category}
            </button>
          ))}
        </section>

        {/* 5. Blog Card Grid */}
        <section className="px-6 md:px-12 pb-24">
            {/* Conditional Rendering (Unchanged logic, adjusted text styles) */}
            {loading && (
              <p className="text-center text-xl text-indigo-700 font-semibold">Loading blogs... ⏳</p>
            )}

            {!loading && error && (
              <p className="text-center text-xl text-red-600 font-semibold">
                Error fetching data. Please ensure your backend is running. 🔴
              </p>
            )}

            {!loading && !error && filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                  No Blogs Found
                </h2>
                <p className="text-gray-600">
                  We couldn't find any posts matching your current filter and search terms.
                </p>
                <p className="text-gray-600">
                  Try clearing your search or selecting 'All' categories.
                </p>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredPosts.map(post => (
                  <BlogCard
                    key={post._id} // Corrected key prop
                    id={post._id}
                    title={post.title}
                    subtitle={post.subtitle}
                    coverImage={post.coverImage}
                    tags={post.tags}
                  />
                ))}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default HomePage;