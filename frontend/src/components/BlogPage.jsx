import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import parse from "html-react-parser";
import { getCurrentUserSession } from "../cognitoAuth.js";
import { toast } from "react-toastify"; // Assuming you have ToastContainer set up

const BlogPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [isHindi, setIsHindi] = useState(false);
  const [loading, setLoading] = useState(false); // Used for translation loading
  const [podcastUrl, setPodcastUrl] = useState(null);
  const [podcastLoading, setPodcastLoading] = useState(false);
  const [userSub, setUserSub] = useState(''); // Tracks the logged-in user's ID
  const [initialLoading, setInitialLoading] = useState(true); // Added for initial page load
  const navigate = useNavigate();

  // Helper function to display login prompt
  const promptLogin = () => {
    toast.info("🔒 Please log in to use this feature.");
    console.log("Login to use this feature");
  };

  // fetch blog by id and user session
  useEffect(() => {
    if (!id) return;

    const fetchBlogAndUser = async () => {
      setInitialLoading(true); // Start initial loading
      try {
        // Fetch Blog
        const blogRes = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(blogRes.data);

        // Set existing podcast URL
        if (blogRes.data.podcastUrl) {
          setPodcastUrl(blogRes.data.podcastUrl);
        }

        // Try to get User Session ID (might fail if logged out)
        try {
          const session = await getCurrentUserSession();
          const payload = session.getIdToken().payload;
          setUserSub(payload.sub);
        } catch (sessionError) {
          console.log("No active user session found on page load.");
          setUserSub(''); // Ensure userSub is cleared if session fetch fails
        }

      } catch (error) {
        console.error("Error fetching blog data:", error.message);
        toast.error("Could not load blog post.");
        // Optionally navigate away if blog fetch fails completely
        // navigate('/');
      } finally {
        setInitialLoading(false); // End initial loading
      }
    };

    fetchBlogAndUser();
  }, [id]);


  // --- Translate to Hindi / English ---
  const handleTranslate = async () => {
    if (!userSub) return promptLogin();
    setLoading(true); // Start translation loading
    try {
      if (!isHindi) {
        if (!translatedContent) {
          const res = await axios.post('http://localhost:5000/api/translate', {
            text: blog.content,
            targetLanguage: 'hi',
          });
          toast.success("Translation successful!");
          setTranslatedContent(res.data.translatedText);
        }
        setIsHindi(true);
      } else {
        setIsHindi(false);
      }
    } catch (error) {
      console.error("Translation failed", error);
      toast.error("Translation failed! Check server logs.");
    } finally {
      setLoading(false); // End translation loading
    }
  };

  // --- Generate Podcast via Polly ---
  const handleGeneratePodcast = async () => {
    if (!userSub) return promptLogin();
    setPodcastLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/podcast/${blog._id}/podcast`);
      toast.success("Podcast generated successfully!");
      setPodcastUrl(res.data.podcastUrl);
    } catch (error) {
      console.error("Podcast generation failed:", error);
      toast.error("Failed to generate podcast! Check server logs.");
    } finally {
      setPodcastLoading(false);
    }
  };

  // Show loading state while fetching initial blog data
  if (initialLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <p className="text-xl font-semibold text-indigo-700">Loading blog post... ⏳</p>
        </div>
    );
  }

  // Handle case where blog data failed to load
  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">Could not load the blog post. It might have been removed or the link is incorrect.</p>
          <button
              onClick={() => navigate('/')} // Option to navigate away
              className="py-2 px-6 text-sm font-medium text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 mt-3 transition-colors"
          >
              Go to Homepage
          </button>
      </div>
    );
  }

  const cleanHtml = (html) => html?.replace(/ class="[^"]*"/g, "") || ""; // Add safety check for null html
  const parsedContent = parse(cleanHtml(isHindi && translatedContent ? translatedContent : blog.content));

  // Renders the Translate button, adapting for logged-in status with glass effect
  const renderTranslateButton = () => (
    <button
      onClick={userSub ? handleTranslate : promptLogin}
      disabled={loading || !blog.content}
      // ✨ Consistent Glass/Purple Button Styling ✨
      className={`px-4 py-2 w-44 rounded-lg text-sm font-medium transition-all shadow-md border ${
        userSub
          ? 'bg-purple-600/80 backdrop-blur-sm border-purple-400/50 text-white hover:bg-purple-700/90'
          : 'bg-gray-300/60 backdrop-blur-sm border-gray-400/50 text-gray-600 cursor-pointer'
      }`}
    >
      {userSub ? (
        loading
          ? "Translating..."
          : isHindi
          ? "Show English"
          : "Translate to Hindi"
      ) : (
        "🔒 Translate"
      )}
    </button>
  );

  // Renders the Podcast button, adapting for logged-in status with glass effect
  const renderPodcastButton = () => {
    if (podcastUrl) {
      return null;
    }

    return (
      <button
        onClick={userSub ? handleGeneratePodcast : promptLogin}
        disabled={podcastLoading}
        // ✨ Consistent Glass/Indigo Button Styling ✨
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all w-full shadow-md border ${
          userSub
            ? 'bg-indigo-600/80 backdrop-blur-sm border-indigo-400/50 text-white hover:bg-indigo-700/90'
            : 'bg-gray-300/60 backdrop-blur-sm border-gray-400/50 text-gray-600 cursor-pointer'
        }`}
      >
        {userSub ? (
          podcastLoading ? "Generating..." : "🎧 Generate Podcast"
        ) : (
          "🔒 Generate Podcast"
        )}
      </button>
    );
  };

  return (
    // ✨ Added gradient background and font ✨
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 font-sans">
      {/* Navbar would go here if needed, or is handled by App layout */}
      <div className="max-w-4xl mx-auto py-10 lg:px-0 px-4">
        {/* Header Section - Adjusted text colors */}
        <div className="text-center mb-10 mt-4">
          <p className="text-sm text-blue-600 font-medium mb-2">
            Published on {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            {blog.title}
          </h1>
          <p className="text-xl text-gray-700 mb-6 font-light">
            {blog.subtitle}
          </p>
          {/* ✨ Author Button with Glass Effect ✨ */}
          <button className="bg-purple-100/70 backdrop-blur-sm text-purple-800 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200/50 shadow-sm hover:bg-purple-200/80 transition-colors">
            {blog.author}
          </button>
        </div>

        {/* Cover Image */}
        <div className="w-full rounded-2xl overflow-hidden shadow-xl mb-12">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Action Buttons (Translate & Podcast) */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
            {renderTranslateButton()}
            {renderPodcastButton()}
        </div>

        {/* Podcast Audio Player - ✨ Added Glass Effect ✨ */}
        {podcastUrl && userSub && (
        <div className="mt-8 bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-md border border-purple-200/50">
            <h2 className="text-lg font-semibold mb-2 text-purple-900">🎙 Listen to this blog</h2>
            <audio
                controls
                controlsList="nodownload"
                src={podcastUrl}
                className="w-full rounded-lg"
            >
                Your browser does not support the audio element.
            </audio>
        </div>
      )}

      {/* Locked player - ✨ Added Purple Glass Overlay ✨ */}
      {podcastUrl && !userSub && (
        <div
            className="mt-8 bg-gray-100/50 backdrop-blur-sm rounded-xl p-4 shadow-sm relative overflow-hidden border border-gray-200/50"
            onClick={promptLogin} // Trigger login prompt on click
        >
            {/* Blur overlay with login prompt */}
            <div className="absolute inset-0 bg-purple-400/30 backdrop-blur-md flex items-center justify-center z-10 cursor-pointer">
                <span className="text-white bg-purple-900/60 py-2 px-4 rounded-lg font-semibold flex items-center gap-2 shadow-lg">
                    🔒 Log in to listen
                </span>
            </div>

            {/* Dummy blurred player underneath */}
            <h2 className="text-lg font-semibold mb-2 text-gray-500">🎙 Listen to this blog</h2>
            <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center px-4">
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                <div className="h-1 bg-gray-400 w-full ml-3 rounded-full"></div>
            </div>
        </div>
      )}

        {/* Tags - ✨ Updated Styling ✨ */}
{Array.isArray(blog.tags) && blog.tags.length > 0 ? (
    <div className="flex flex-wrap justify-center gap-2 mb-10 mt-10">
        {blog.tags.map((t, index) => ( // Still need index if tags aren't unique
            <span
                // ⭐ CORRECTED: Use the tag itself as the key ⭐
                key={t} 
                className="text-purple-800 text-xs bg-purple-100/80 backdrop-blur-sm px-3 py-1 rounded-full font-medium border border-purple-200/50 shadow-xs"
            >
                #{t}
            </span>
        ))}
    </div>
) : (
    <p className="text-gray-500 mb-8 mt-10 text-center">No tags attached</p>
)}


        {/* Blog Content - Added text color */}
        <div className="prose prose-lg mx-auto mt-6 text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900">
          {parsedContent}
        </div>
      </div>
      {/* Footer would go here if needed */}
    </div>
  );
};

export default BlogPage;