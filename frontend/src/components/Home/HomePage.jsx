import React, { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';
import BlogCard from './BlogCard'; 
import axios from 'axios';

// --- SVG Icon ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

// --- Main HomePage Component ---
const HomePage = () => {

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE ---
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState(''); // Live text in the input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // --- DATA ---
  const categories = ['All', 'Technology', 'Startup', 'Lifestyle', 'Finance'];
  


useEffect(() => {
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/blogs');
      setBlogs(response.data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  fetchBlogs();
}, []);


  // 3. Add the useDebounce hook
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500, // 500ms delay
    [searchTerm] // Dependency array: runs when 'searchTerm' changes
  );

  // --- FILTERING LOGIC ---
  const filteredPosts = loading ? [] : blogs
  .filter(post => selectedCategory === 'All' || post.tag === selectedCategory)
  .filter(post => {
    if (!debouncedSearchTerm) return true;
    const query = debouncedSearchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.subtitle.toLowerCase().includes(query) ||
      post.tags.toLowerCase().includes(query)
    );
  });
    
  return (
    <div className="min-h-screen bg-white text-gray-800">
      
      <main>
        {/* 1. Hero Section (Unchanged) */}
        <section className="py-20 md:py-32 text-center flex flex-col items-center px-4">
          <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              New: AI feature integrated
              <img 
                src="/star.svg" 
                alt="star icon" 
                className="w-3.5 h-3.5 ml-1.5"
              />
            </span>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Your own <span className="text-indigo-600">blogging platform.</span>
          </h1>
          
          <p className="text-gray-600 max-w-lg mx-auto mb-10 text-lg">
            This is your space to share what matters, and to write without filters. Whether it's one word or a thousand, your story starts right here. Use AI enabled features to convert your thoughts to amazing blogs
          </p>
          
          {/* Corrected Search Bar */}
          <div className="relative w-full max-w-xl mx-auto">
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>
            
            <input 
              type="text" 
              placeholder="Search for blogs" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 px-14 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 pr-36"
            />
            
            <button 
              type="button" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white font-medium py-3 px-8 rounded-full text-sm hover:bg-indigo-700 transition-colors duration-300"
            >
              Search
            </button>
          </div>
        </section>
        
        {/* 3. Category Filters (Now functional) */}
        <section className="pb-24 flex justify-center items-center gap-6 md:gap-8 flex-wrap px-4">
          {categories.map((category) => (
            <button 
              key={category}
              onClick={() => setSelectedCategory(category)} // Set state on click
              className={`
                text-base font-medium transition-colors duration-300
                ${selectedCategory === category // Use state for active class
                  ? 'text-indigo-600' // Active state
                  : 'text-gray-500 hover:text-gray-900'}
              `}
            >
              {category}
            </button>
          ))}
        </section>
        {/* 5. Blog Card Grid (Maps over filteredPosts) */}
        <section className="px-6 md:px-12 pb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredPosts.map(post => (
              <BlogCard 
                key={post.id}
                id={post._id}
                title={post.title}
                subtitle={post.subtitle}
                coverImage={post.coverImage}
                tags={post.tags}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
