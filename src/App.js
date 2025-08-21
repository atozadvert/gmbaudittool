import React, { useState, useEffect } from 'react';

// Helper function to render stars based on rating
const StarRating = ({ rating }) => {
    const totalStars = 5;
    let stars = [];
    for (let i = 1; i <= totalStars; i++) {
        if (i <= rating) {
            stars.push(<svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
        } else {
            stars.push(<svg key={i} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
        }
    }
    return <div className="flex">{stars}</div>;
};

// Main App Component
export default function App() {
    const [gmbLink, setGmbLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');

    const handleAudit = async () => {
        if (!gmbLink || !gmbLink.includes('maps.app.goo.gl')) {
            setError('Please enter a valid Google Maps share link.');
            return;
        }
        setError('');
        setIsLoading(true);
        setReport(null);

        try {
            const response = await fetch(`http://localhost:3001/api/audit?url=${encodeURIComponent(gmbLink)}`);
            if (!response.ok) {
                throw new Error('Server responded with an error.');
            }
            const apiData = await response.json();

            // --- AUDIT LOGIC ---
            const auditResults = { score: 0, recommendations: [] };
            
            if(apiData.isVerified) auditResults.score += 10; else auditResults.recommendations.push({ title: "Profile Verification", text: "The profile is not verified. Verification is crucial for building trust and unlocking all GBP features." });
            if(apiData.rating >= 4.0) auditResults.score += 15; else auditResults.recommendations.push({ title: "Improve Star Rating", text: "The average rating is below 4.0. Focus on improving customer service and encouraging happy customers to leave reviews." });
            if(apiData.reviewCount > 50) auditResults.score += 15; else auditResults.recommendations.push({ title: "Increase Review Count", text: `With only ${apiData.reviewCount} reviews, the profile could benefit from a proactive strategy to acquire more.` });
            if(apiData.photoCount > 20) auditResults.score += 20; else auditResults.recommendations.push({ title: "Upload More Photos", text: `The profile has only ${apiData.photoCount} photos. Aim for at least 20 high-quality images.` });
            if(apiData.posts && apiData.posts.recentPost) auditResults.score += 15; else auditResults.recommendations.push({ title: "Utilize Google Posts", text: "No recent Google Posts found. Posting weekly updates keeps your profile active." });
            if(apiData.qAndA && apiData.qAndA.totalQuestions > 0 && (apiData.qAndA.answeredQuestions / apiData.qAndA.totalQuestions > 0.8)) auditResults.score += 10; else auditResults.recommendations.push({ title: "Engage with Q&A", text: "Not all questions in the Q&A section have been answered." });
            if(apiData.hasWebsite) auditResults.score += 15; else auditResults.recommendations.push({ title: "Add a Website", text: "The profile does not have a website listed." });

            setReport({ ...apiData, audit: auditResults });

        } catch (err) {
            console.error("Fetch error:", err);
            setError("Could not connect to the audit server. Is it running?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Automated GBP Audit Tool</h1>
                    <p className="text-lg text-gray-600 mt-2">Enter a GMB share link to analyze the profile.</p>
                </header>
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="url"
                            value={gmbLink}
                            onChange={(e) => setGmbLink(e.target.value)}
                            placeholder="https://maps.app.goo.gl/..."
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleAudit}
                            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-wait flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? ( <> <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Analyzing... </> ) : ( 'Generate Report' )}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                {report && (
                    <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Audit Report for {report.businessName}</h2>
                        <p className="text-center text-gray-600 mb-6">{report.address}</p>
                        <div className="text-center mb-8 p-6 bg-gray-100 rounded-lg">
                            <p className="text-lg text-gray-600">Overall Optimization Score:</p>
                            <p className={`text-6xl font-bold ${report.audit.score >= 80 ? 'text-green-600' : report.audit.score >= 50 ? 'text-yellow-500' : 'text-red-600'}`}>{report.audit.score}%</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700">Average Rating</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <StarRating rating={report.rating} />
                                    <span className="font-bold text-lg">{report.rating}</span>
                                </div>
                            </div>
                             <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700">Total Reviews</h4>
                                <p className="font-bold text-lg mt-1">{report.reviewCount}</p>
                            </div>
                             <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700">Uploaded Photos</h4>
                                <p className="font-bold text-lg mt-1">{report.photoCount}</p>
                            </div>
                             <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700">Recent Posts</h4>
                                <p className={`font-bold text-lg mt-1 ${report.posts && report.posts.recentPost ? 'text-green-600' : 'text-red-500'}`}>{report.posts && report.posts.recentPost ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Recommendations for Improvement:</h3>
                            {report.audit.recommendations.length > 0 ? (
                                <ul className="space-y-4">
                                    {report.audit.recommendations.map((rec, index) => (
                                        <li key={index} className="bg-yellow-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-yellow-800">{rec.title}</h4>
                                            <p className="text-yellow-700">{rec.text}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center p-6 bg-green-50 rounded-lg">
                                    <h3 className="text-xl font-semibold text-green-800">Excellent Work!</h3>
                                    <p className="text-green-700 mt-2">This profile is highly optimized.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
