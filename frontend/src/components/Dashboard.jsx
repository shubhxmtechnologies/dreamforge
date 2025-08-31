import React, { useState, useRef, useEffect, Fragment } from 'react';
import { Sparkles, Image as ImageIcon, AlertTriangle, Send, User, LayoutGrid, X, Download, Copy, Check, LogOut, } from 'lucide-react';
import Avatar from './ui/Avatar';
import { toast } from "react-toastify"
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_SERVER_URL;

const ImageModal = ({ item, onClose }) => {
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
    fetch(item.src)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `dreamforge-download.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => alert('Could not download image.'));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col lg:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="w-full lg:w-2/3 bg-slate-100 flex items-center justify-center p-4">
          <img src={item.src} alt={item.prompt} className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
        <div className="w-full lg:w-1/3 p-8 flex flex-col">
          <div className="flex-grow">
            <h3 className="text-sm font-semibold text-slate-500 mb-2">PROMPT</h3>
            <p className="text-slate-700 leading-relaxed">{item.prompt}</p>
          </div>
          <div className="flex-shrink-0 space-y-3 mt-4">
            <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition">
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
            <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
              <Download size={18} />
              Download Image
            </button>
          </div>
        </div>
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
        <X size={32} />
      </button>
    </div>
  );
};


// --- Message Components ---
const UserMessage = ({ text }) => (
  <div className="flex justify-end mb-4">
    <div className="flex items-start gap-3 justify-end">
      <div className="bg-indigo-600 text-white p-3 rounded-xl max-w-lg">
        <p>{text}</p>
      </div>
      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
        <User size={18} />
      </div>
    </div>
  </div>
);

const AiMessage = ({ children }) => (
  <div className="flex justify-start mb-4">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
        <Sparkles size={18} />
      </div>
      <div className="bg-white border border-slate-200 p-3 rounded-xl max-w-lg">
        {children}
      </div>
    </div>
  </div>
);

// --- AI Response Content Components ---
const SkeletonLoader = () => <div className="w-64 h-64 bg-slate-200 rounded-lg animate-pulse"></div>;

const ErrorMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center text-red-700 p-4">
    <AlertTriangle size={32} className="mb-2 text-red-500" />
    <h3 className="font-semibold mb-1 text-red-800">Generation Failed</h3>
    <p className="text-center text-sm text-red-600">{message}</p>
  </div>
);

const GeneratedImage = ({ src, alt, onClick }) => (
  <button onClick={onClick} className="w-64 h-64 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/256/e2e8f0/475569?text=Error'; }}
    />
  </button>
);

// --- Main Dashboard Component ---
export default function App() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const chatEndRef = useRef(null);
  const { setUser, checkLocalStorage, user } = useAuth()
  useEffect(() => {

    if (!checkLocalStorage()) {

      window.location.reload()
    }
  }, [])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!checkLocalStorage()) {
      window.location.reload()
    }
    if (!prompt.trim()) {
      toast.warn("Please Enter Prompt")

      return
    }

    const currentPrompt = prompt.trim();
    if (!currentPrompt) {
      toast.warn("Please Enter Prompt")
      return;
    }

    const userMessageId = Date.now();
    const aiMessageId = userMessageId + 1;

    const newUserMessage = { id: userMessageId, type: 'user', content: { type: 'text', text: currentPrompt } };

    const loadingMessage = { id: aiMessageId, type: 'ai', content: { type: 'loading' } };

    if (user.credits <= 0) {
      return toast.error("Not enough credits. Please Try After 12 A.M.")
    }
    setMessages(prev => [...prev, newUserMessage, loadingMessage]);
    setPrompt('');

    setLoading(true)
    const token = localStorage.getItem("user")
    try {
      const { data } = await axios.post(apiUrl + "/api/v1/generate-image", {
        prompt: prompt
      },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          }
        })

      toast.success(data.message)
      const successMessage = { type: 'ai', content: { type: 'image', src: data.imageUrl, prompt: currentPrompt } };
      setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, ...successMessage } : msg));
      setUser(data.user)
    } catch (error) {
      toast.error(error.response.data?.error)
      const errorMessageText = 'The AI model failed to generate the image. Please try a different prompt.';
      const errorMessage = { type: 'ai', content: { type: 'error', message: errorMessageText } };
      setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, ...errorMessage } : msg));
      toast.error(error.response?.errror)
    }
    finally {
      setLoading(false)
    }

  };

  const renderAiContent = (content) => {
    switch (content.type) {
      case 'text':
        return <p>{content.text}</p>;
      case 'loading':
        return <SkeletonLoader />;
      case 'image':
        return <GeneratedImage src={content.src} alt={content.prompt} onClick={() => setSelectedImage(content)} />;
      case 'error':
        return <ErrorMessage message={content.message} />;
      default:
        return null;
    }
  }

  return (
    <>
      <title>

        Dashboard - Dream Forge
      </title>
      <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-800 flex flex-col">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#dce3f3_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative z-10 flex-grow flex flex-col items-center w-full">
          <header className="w-full max-w-4xl mx-auto py-4 px-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Image Generation Chat</h1>
            <Avatar />
          </header>

          <main className="flex-grow w-full max-w-4xl p-4 overflow-y-auto">
            {messages.map((msg) =>
              msg.type === 'user'
                ? <UserMessage key={msg.id} text={msg.content.text} />
                : <AiMessage key={msg.id}>{renderAiContent(msg.content)}</AiMessage>
            )}
            <div ref={chatEndRef} />
          </main>

          <footer className="w-full max-w-4xl p-4 sticky bottom-0 bg-slate-50/80 backdrop-blur-lg">
            <form onSubmit={handleGenerate} className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe an image..."
                className="w-full p-4 pr-16 text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300"
                aria-label="Send Prompt"
              >
                <Send size={20} />
              </button>
            </form>
          </footer>
        </div>

        <ImageModal item={selectedImage} onClose={() => setSelectedImage(null)} />


      </div>
    </>

  );
}
