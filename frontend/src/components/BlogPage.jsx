import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import parse from "html-react-parser";
// ✨ FIX 1: Corrected the import path.
import { getCurrentUserSession } from "../cognitoAuth.js"; 
import { toast } from "react-toastify"; 
import typography from '@tailwindcss/typography'; plugins: [typography]

// ✨ FIX 2: Removed 'react-icons' import as it's not installed.
// We will use text for the buttons instead.


// --- ZEN MODE CONTROLS COMPONENT ---
// ✨ Replaced icons with text
const ZenControls = ({ onExit, onToggleTheme, onToggleFontSize, theme }) => {
    return (
        <div className="fixed top-4 right-4 z-50 flex gap-2 p-2 bg-white/70 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50">
            {/* Toggle Theme */}
            <button
                onClick={onToggleTheme}
                className="px-3 py-1 rounded-md text-gray-700 hover:bg-gray-200 text-sm"
                title="Toggle Theme"
            >
                {theme === 'light' && "Dark"}
                {theme === 'dark' && "Sepia"}
                {theme === 'sepia' && "Light"}
            </button>
            {/* Toggle Font Size */}
            <button
                onClick={onToggleFontSize}
                className="px-3 py-1 rounded-md text-gray-700 hover:bg-gray-200 text-sm"
                title="Change Font Size"
            >
                Size
            </button>
            {/* Exit Zen Mode */}
            <button
                onClick={onExit}
                className="px-3 py-1 rounded-md text-red-500 hover:bg-red-100 text-sm font-bold"
                title="Exit Zen Mode"
            >
                Exit
            </button>
        </div>
    );
};


// --- BLOG PAGE COMPONENT ---
const BlogPage = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null); // Starts as null
    const [translatedContent, setTranslatedContent] = useState(null);
    const [isHindi, setIsHindi] = useState(false);
    const [loading, setLoading] = useState(false); // Used for translation loading
    const [podcastUrl, setPodcastUrl] = useState(null);
    const [podcastLoading, setPodcastLoading] = useState(false);
    const [userSub, setUserSub] = useState(''); // Tracks the logged-in user's ID
    const [initialLoading, setInitialLoading] = useState(true); // Added for initial page load
    const navigate = useNavigate();

    // --- ZEN MODE STATE ---
    const [isZenMode, setIsZenMode] = useState(false);
    const [zenTheme, setZenTheme] = useState('light'); // 'light', 'dark', 'sepia'
    const [zenFontSize, setZenFontSize] = useState('prose-lg'); // 'prose-lg', 'prose-xl', 'prose-2xl'


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
                setBlog(blogRes.data); // <-- Blog is set here

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
            } finally {
                setInitialLoading(false); // End initial loading
            }
        };

        fetchBlogAndUser();
    }, [id]);

    
    // --- FULLSCREEN API HANDLERS ---
    const enterZenMode = () => {
        // ✨ Hide the navbar
        const navbar = document.querySelector('nav'); // Assuming the navbar is a <nav> tag
        if (navbar) {
            navbar.style.display = 'none';
        }

        try {
            document.documentElement.requestFullscreen();
            setIsZenMode(true);
        } catch (e) {
            console.error("Fullscreen API failed:", e);
            setIsZenMode(true); // Fallback for browsers without fullscreen
        }
    };

    const exitZenMode = useCallback(() => {
        // ✨ Show the navbar again
        const navbar = document.querySelector('nav');
        if (navbar) {
            navbar.style.display = ''; // Resets to default (block, flex, etc.)
        }

        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setIsZenMode(false);
    }, []);

    // Listen for 'Esc' key to exit fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                // User pressed 'Esc'
                exitZenMode(); // Use our function which also handles navbar
            }
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [exitZenMode]); // Add exitZenMode as dependency

    // ✨ Cleanup effect to show navbar if component unmounts while in Zen Mode
    useEffect(() => {
        // This function will run when the component unmounts
        return () => {
            const navbar = document.querySelector('nav');
            if (navbar && navbar.style.display === 'none') {
                 navbar.style.display = ''; // Ensure navbar is visible on unmount
            }
        };
    }, []); // Empty dependency array means this runs only on mount and unmount
    
    // --- ZEN CONTROL HANDLERS ---
    const handleToggleTheme = () => {
        setZenTheme(current => {
            if (current === 'light') return 'dark';
            if (current === 'dark') return 'sepia';
            return 'light';
        });
    };

    const handleToggleFontSize = () => {
        setZenFontSize(current => {
            if (current === 'prose-lg') return 'prose-xl';
            if (current === 'prose-xl') return 'prose-2xl';
            return 'prose-lg';
        });
    };


    // --- Translate to Hindi / English ---
   const handleTranslate = async () => {
    const user = await getCurrentUserSession();
    if (!user) {
        toast.info("Login to use this feature");
        console.log("Login to use this feature");
        return;
    }

    try {
      setLoading(true);
      if (!isHindi) {
        // If Hindi version not loaded yet, translate and cache it
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
        // Show original English
        setIsHindi(false);
      }
    } catch (error) {
      console.error("Translation failed", error);
      alert("Translation failed! Check server logs.");
    } finally {
      setLoading(false);
    }
  };

    // --- Generate Podcast via Polly ---
  const handleGeneratePodcast = async () => {
    const user = await getCurrentUserSession();
    if (!user) {
        toast.info("Login to use this feature");
        console.log("Login to use this feature");
        
        return;
    }

    try {
      setPodcastLoading(true);
      const res = await axios.post(`http://localhost:5000/api/podcast/${blog._id}/podcast`);
      toast.success("Podcast generated successfully!");
      setPodcastUrl(res.data.podcastUrl);
    } catch (error) {
      console.error("Podcast generation failed:", error);
      alert("Failed to generate podcast! Check server logs.");
    } finally {
      setPodcastLoading(false);
    }
  };

    // --- CORRECT GUARD CLAUSES ---
    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
                <p className="text-xl font-semibold text-indigo-700">Loading blog post... ⏳</p>
            </div>
        );
    }

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
    
    const cleanHtml = (html) => html?.replace(/ class="[^"]*"/g, "") || "";
    const parsedContent = parse(cleanHtml(isHindi && translatedContent ? translatedContent : blog.content));

    // Renders the Translate button
    const renderTranslateButton = () => (
        <button
            onClick={userSub ? handleTranslate : promptLogin}
            disabled={loading || !blog.content}
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

    // Renders the Podcast button
    const renderPodcastButton = () => {
        if (podcastUrl) {
            return null;
        }

        return (
            <button
                onClick={userSub ? handleGeneratePodcast : promptLogin}
                disabled={podcastLoading}
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

    
    // --- DYNAMIC CLASSES FOR ZEN MODE ---
    const zenModeContainerClasses = {
        'light': 'bg-white',
        'dark': 'bg-gray-900',
        'sepia': 'bg-[#fbf0d9]', // A nice sepia tone
    };
    
    // ✨ FIX: This was 'text-white', changed to 'prose-invert' for full dark mode support
    const zenModeProseClasses = {
        'light': 'prose-headings:text-gray-900 prose-strong:text-gray-900 text-gray-800',
        'dark': 'text-white', // This is the correct Tailwind class
        'sepia': 'prose-headings:text-[#5b4636] prose-strong:text-[#5b4636] text-[#705e50]',
    };


    return (
        // ✨ Main container: applies Zen Mode theme
        <div
        className={`min-h-screen font-sans bg-cover bg-center bg-fixed ${
            isZenMode
                ? zenModeContainerClasses[zenTheme] // Apply Zen theme background if active
                : '' // No background image needed if Zen theme has solid color
        }`}
        // Apply background image style only when NOT in Zen mode
        >
            {!isZenMode && (
            <img 
            className='absolute w-full h-auto -top-60 z-[10] opacity-40 pointer-events-none' 
            src="/gra-bg.png" 
            alt="Gradient Background" 
        />
        )}
            
            {/* ✨ Zen Mode Controls: Only show when in Zen Mode */}
            {isZenMode && (
                <ZenControls 
                    onExit={exitZenMode}
                    onToggleTheme={handleToggleTheme}
                    onToggleFontSize={handleToggleFontSize}
                    theme={zenTheme}
                />
            )}

            {/* ✨ Zen Mode Toggle Button: Only show when NOT in Zen Mode */}
            {!isZenMode && (
                <button
                    onClick={enterZenMode}
                    title="Enter Zen Mode"
                    // ✨ Replaced icon with text
                    className="fixed bottom-6 right-6 z-40 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 text-purple-700 hover:bg-purple-100 hover:scale-105 transition-all text-sm font-medium"
                >
                    Zen Mode
                </button>
            )}

            {/* ✨ Main Content Area: Width changes in Zen Mode */}
            <div className={`mx-auto py-10 lg:px-0 px-4 ${
                isZenMode ? 'max-w-full' : 'max-w-4xl'
            }`}>
                
                {/* --- HEADER (Hidden in Zen Mode) --- */}
                {!isZenMode && (
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
                        <button className="bg-purple-100/70 backdrop-blur-sm text-purple-800 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200/50 shadow-sm hover:bg-purple-200/80 transition-colors">
                            {blog.author}
                        </button>
                    </div>
                )}

                {/* --- COVER IMAGE (Hidden in Zen Mode) --- */}
                {!isZenMode && (
                    <div className="w-full rounded-2xl overflow-hidden shadow-xl mb-12">
                        <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                {/* --- ACTION BUTTONS (Hidden in Zen Mode) --- */}
                {!isZenMode && (
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {renderTranslateButton()}
                        {/* Only render podcast button if URL doesn't exist */}
                        {!podcastUrl && renderPodcastButton()}
                    </div>
                )}

                {/* --- PODCAST PLAYER (Hidden in Zen Mode) --- */}
                {!isZenMode && podcastUrl && userSub && (
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
                {!isZenMode && podcastUrl && !userSub && (
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

                {/* --- TAGS (Hidden in Zen Mode) --- */}
                {!isZenMode && Array.isArray(blog.tags) && blog.tags.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2 mb-10 mt-10">
                        {blog.tags.map((t) => (
                            <span
                                key={t} 
                                className="text-purple-800 text-xs bg-purple-100/80 backdrop-blur-sm px-3 py-1 rounded-full font-medium border border-purple-200/50 shadow-xs"
                            >
                                #{t}
                            </span>
                        ))}
                    </div>
                ) : (
                    !isZenMode && <p className="text-gray-500 mb-8 mt-10 text-center">No tags attached</p>
                )}


                {/* --- ✨ BLOG CONTENT (Always visible, styles change) --- */}
                <div 
                    className={`prose mx-auto mt-6 
                        {/* ✨ FIX: Apply font size based on mode */}
                        ${isZenMode ? zenFontSize : 'prose-lg'} 
                        
                        {/* ✨ FIX: Apply theme class based on mode */}
                        ${isZenMode ? zenModeProseClasses[zenTheme] : zenModeProseClasses['light']} 
                        
                        {/* ✨ FIX: Apply width constraints based on mode */}
                        ${isZenMode ? 'max-w-3xl' : ''}`
                    }
                >
                    {/* ✨ In Zen Mode, show title/subtitle before content for context */}
                    {isZenMode && (
                        <div className="border-b pb-6 mb-8">
                            {/* ✨ FIX: Removed hardcoded font sizes to allow 'prose-xl' etc. to work */}
                            <h1 className={`font-extrabold leading-tight mb-4 ${zenModeProseClasses[zenTheme]}`}>
                                {blog.title}
                            </h1>
                            <p className={`font-light ${zenModeProseClasses[zenTheme]}`}>
                                {blog.subtitle}
                            </p>
                        </div>
                    )}
                    {parsedContent}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;