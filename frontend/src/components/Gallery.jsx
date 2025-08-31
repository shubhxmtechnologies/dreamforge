import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Download, Copy, Check, Loader2, ArrowLeft } from 'lucide-react';
import {
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';

// --- Setup TanStack Query ---
const queryClient = new QueryClient();

// This function simulates fetching paginated data from an API.
const fetchImages = async ({ pageParam = 0 }) => {
    const pageSize = 8;
    const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/generations?page=${pageParam}&limit=${pageSize}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("user")}` } }
    );
    return {
        data: res.data.data, // backend sends { success, data }
        nextCursor: res.data.nextCursor, // send from backend
    };
};


// --- Skeleton Loader Component ---
const GalleryItemSkeleton = () => {
    const randomHeight = Math.floor(Math.random() * (350 - 200 + 1)) + 200;
    return <div className="w-full bg-slate-200 rounded-lg animate-pulse" style={{ height: `${randomHeight}px` }}></div>
};


// --- Modal Component ---
export const ImageModal = ({ item, onClose }) => {
    const [copied, setCopied] = useState(false);

    if (!item) return null;

    const handleCopy = () => {
        const textarea = document.createElement('textarea');
        textarea.value = item.prompt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        fetch(item.image)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `dreamForge-${item.prompt.slice(0, 5)}.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(() => alert('Could not download image.'));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-md shadow-2xl w-full max-w-5xl h-full overflow-y-auto max-h-[90vh] flex flex-col lg:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="w-full lg:w-2/3 bg-slate-100 flex items-center justify-center p-4">
                    <img src={item.image} alt={item.prompt} className="max-w-full max-h-full object-contain rounded-lg" />
                </div>
                <div className="w-full lg:w-1/3 p-8 flex flex-col">
                    <div className="flex-grow">
                        <h3 className="text-sm font-semibold text-slate-500 mb-2">PROMPT</h3>
                        <p className="text-slate-700 leading-relaxed">{item.prompt}</p>
                    </div>
                    <div className="flex-shrink-0 mt-6 space-y-4">
                        {/* Download Button */}
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 py-3 px-5 
               bg-indigo-600 text-white font-medium rounded-xl shadow-md
               hover:bg-indigo-700 active:bg-indigo-800 
               transition duration-200 ease-in-out"
                        >
                            <Download size={18} />
                            <span>Download Image</span>
                        </button>

                        {/* Copy Buttons Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 py-3 px-4 
                 bg-gray-100 text-gray-700 font-medium rounded-xl shadow-sm
                 hover:bg-gray-200 active:bg-gray-300
                 transition duration-200 ease-in-out"
                            >
                                {copied ? (
                                    <Check size={18} className="text-green-500" />
                                ) : (
                                    <Copy size={18} />
                                )}
                                {copied ? "Copied!" : "Copy Prompt"}
                            </button>

                            <button
                                onClick={onClose}
                                className="flex items-center justify-center gap-2 py-3 px-4 
                 bg-gray-100 text-gray-700 font-medium rounded-xl shadow-sm
                 hover:bg-gray-200 active:bg-gray-300
                 transition duration-200 ease-in-out"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

// --- Gallery Component using TanStack Query ---
const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const lastElementRef = useRef(null);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['images'],
        queryFn: fetchImages,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        retry: false,   // 🔥 disable auto-retries
    });



    useEffect(() => {
        if (!lastElementRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.5 } // <-- only trigger when 50% of the element is visible
        );

        observer.observe(lastElementRef.current);

        return () => {
            if (lastElementRef.current) {
                observer.unobserve(lastElementRef.current);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, data]);

    return (
        <>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-6">
                {status === 'loading' ? (
                    Array.from({ length: 8 }).map((_, i) => <GalleryItemSkeleton key={i} />)
                ) : status === 'error' ? (
                    <p className="text-center text-red-500">{error.response?.data?.error || "Something went wrong"}</p>
                ) : (
                    <>
                        {data?.pages[0]?.data.length == 0 && <p className='text-center w-full'>
                            No Generations Found
                        </p>}
                        {data?.pages[0]?.data.length > 0 && data?.pages?.map((page, i) => (
                            <Fragment key={i}>
                                {page.data.map((item, idx) => (
                                    <div key={idx} className="mb-6 break-inside-avoid cursor-pointer group relative" onClick={() => setSelectedImage(item)}>
                                        <img src={item.image} alt={item.prompt} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x800/e2e8f0/475569?text=Error'; }} className="w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center p-4">
                                            <p className="text-white text-sm text-center line-clamp-3">{item.prompt}</p>
                                        </div>
                                    </div>
                                ))}
                            </Fragment>
                        ))}
                    </>
                )}
            </div>
            <div ref={lastElementRef} className="h-10 mt-5">
                {isFetchingNextPage && (
                    <div className="flex justify-center items-center gap-2 text-slate-500">
                        <Loader2 className="animate-spin" />
                        <span>Loading more...</span>
                    </div>
                )}
                {!hasNextPage && status !== 'loading' && <p className="text-center mt-5 text-slate-500">You've reached the end!</p>}
            </div>
            <ImageModal item={selectedImage} onClose={() => setSelectedImage(null)} />
        </>
    );
};


// --- Main App Component ---
export default function App() {
    const navigate = useNavigate()

    const { checkLocalStorage } = useAuth()
    useEffect(() => {
        if (!checkLocalStorage()) {
            navigate("/signup")
        }
    }, [])
    return (

        <>
            <title>
                Gallery - Dream Forge
            </title>
            <QueryClientProvider client={queryClient}>
                <div className="min-h-screen bg-slate-50 font-sans">
                    {/* Dot Grid Background */}
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(#dce3f3_1px,transparent_1px)] [background-size:24px_24px]"></div>

                    <div className="relative z-10 container mx-auto px-4 py-8">
                        <header className="flex items-center justify-between mb-12">
                            {/* Back Button */}
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                            >
                                <ArrowLeft size={18} />
                                <span className='sr-only'>
                                    Back
                                </span>
                            </button>

                            {/* Title & Subtitle */}
                            <div className="text-center flex-1">
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                    Image Gallery
                                </h1>
                                <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
                                    A collection of visuals generated by our AI. Click on any image to see details.
                                </p>
                            </div>
                        </header>
                        <Gallery />
                    </div>
                </div>
            </QueryClientProvider>
        </>
    );
}
