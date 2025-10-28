import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    // --- Theme & Style Classes ---
    // Background is now pure white
    const primaryButtonClass = "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md";
    // Minimal border/shadow, no blur
    const glassFeatureBoxClass = "bg-white p-6 rounded-xl shadow-lg border border-gray-100/80";
    const highlightColor = "text-indigo-600";
    const darkTextColor = "text-gray-900";
    
    // Inline CSS for the headline gradient text clip
    const headlineStyle = {
        backgroundImage: 'linear-gradient(to right, #6366F1, #8B5CF6)', // Indigo-500 to Violet-500 gradient
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
    };

    return (
        // Main container uses a pure white background with standard text color
        <div className="min-h-screen bg-white text-gray-800 font-sans relative overflow-hidden">
            <img 
            className='absolute w-full h-auto -top-60 z-[10] opacity-40 pointer-events-none' 
            src="/gra-bg.png" 
            alt="Gradient Background" 
        />


            <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-16">
                
                {/* Hero Section */}
                <section className="text-center max-w-4xl mx-auto mb-20">
                    <p className={`text-sm tracking-widest uppercase mb-4 ${highlightColor}`}>
                        Simple. Fast. Focused.
                    </p>
                    <h1 
                        className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tighter mb-6 transition duration-1000"
                        style={headlineStyle}
                    >
                        Your Content, Perfectly Delivered.
                    </h1>
                    <p className={`text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed transition duration-1000`}>
                        A minimal reading environment powered by modern AI features like real-time podcast generation and translation.
                    </p>
                    
                    {/* Primary CTA Button */}
                    <Link
                        to="/home"
                        className={`inline-flex items-center justify-center px-10 py-4 text-base font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.03] ${primaryButtonClass}`}
                    >
                        Start Reading Now <span className="ml-2">→</span>
                    </Link>
                </section>

                {/* Features Section (Minimal White Cards) */}
                <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center mt-16 px-6">
                    
                    {/* Feature Card 1 */}
                    <div className={`p-6 rounded-xl shadow-md transition-transform duration-300 hover:shadow-lg hover:scale-[1.02] ${glassFeatureBoxClass}`}>
                        <div className="text-3xl mb-3 text-indigo-500">🎙️</div>
                        <h3 className="text-lg font-semibold mb-1 text-gray-800">Podcast Generation</h3>
                        <p className="text-gray-500 text-sm">Convert any blog post into listenable audio in real-time.</p>
                    </div>
                    
                    {/* Feature Card 2 */}
                    <div className={`p-6 rounded-xl shadow-md transition-transform duration-300 hover:shadow-lg hover:scale-[1.02] ${glassFeatureBoxClass}`}>
                        <div className="text-3xl mb-3 text-purple-500">🌐</div>
                        <h3 className="text-lg font-semibold mb-1 text-gray-800">Instant Translation</h3>
                        <p className="text-gray-500 text-sm">Bypass language barriers with one-click translation.</p>
                    </div>
                    
                    {/* Feature Card 3 */}
                    <div className={`p-6 rounded-xl shadow-md transition-transform duration-300 hover:shadow-lg hover:scale-[1.02] ${glassFeatureBoxClass}`}>
                        <div className="text-3xl mb-3 text-blue-500">👁️</div>
                        <h3 className="text-lg font-semibold mb-1 text-gray-800">Minimal Reading Mode</h3>
                        <p className="text-gray-500 text-sm">Focus entirely on the text without any distractions.</p>
                    </div>
                </section>
            </main>

            <footer className="relative z-10 p-6 text-center text-gray-500 text-sm border-t border-gray-100">
                &copy; {new Date().getFullYear()} Blog Platform. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;