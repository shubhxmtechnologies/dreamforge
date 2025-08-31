import { ShieldCheck, Zap, Star, ArrowRight, Github } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
// Helper component for individual feature cards
const FeatureCard = ({ icon, title, children }) => (
    <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 border border-slate-200/80">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{children}</p>
    </div>
);

// Helper component for the image gallery items
const ShowcaseImage = ({ src, alt }) => (
    <div className="relative overflow-hidden rounded-2xl group">
        <img
            src={src}
            alt={alt}
            className="w-full h-auto object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x800/e2e8f0/475569?text=Error'; }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
);

// Main App Component
export default function LandingPage() {

    const [githubStars, setGithubStars] = useState(null)
    useEffect(() => {
        const fetchStars = async () => {
            const { data } = await axios.get("https://api.github.com/repos/shubhxmtechnologies/dreamforge")
            setGithubStars(data.stargazers_count)
        }
        fetchStars()
    }, [])
    const navigate = useNavigate()
    return (
        <>
            <title>

                Home - Dream Forge
            </title>
            <div className="bg-slate-50 font-sans text-slate-700 antialiased">
                {/* --- Header --- */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/80">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="text-2xl font-bold text-slate-900 tracking-tight">
                            Dream Forge
                        </div>

                        <div className="flex items-center space-x-4">
                            <a href="https://github.com/shubhxmtechnologies/dreamforge" target='_blank' className="relative group flex items-center justify-center">

                                <div className="relative flex items-center justify-center h-10 w-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 text-sm font-semibold text-slate-800 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full sm:rounded-lg">
                                    <Github size={16} className="sm:mr-2" />
                                    <span className="hidden sm:inline">Star on GitHub</span>
                                    <span className="hidden sm:flex items-center gap-1 ml-4 text-slate-600">
                                        <Star size={14} className="text-yellow-500 fill-current" />
                                        {githubStars}
                                    </span>
                                </div>
                            </a>
                            <button onClick={() => navigate("/login")} className="hidden cursor-pointer sm:block text-slate-600 hover:text-indigo-600 transition-colors">Login</button>
                            <button onClick={() => navigate("/signup")} className="cursor-pointer bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                                Sign Up
                            </button>
                        </div>
                    </div>
                </header>

                <main className="pt-24">
                    {/* --- Hero Section --- */}
                    <section className="relative py-20 md:py-32 overflow-hidden">
                        <div className="absolute inset-0 light-grid-background [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
                        <div className="container mx-auto px-6 text-center relative">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tighter mb-6 leading-tight animate-fade-in-up">
                                Create Stunning Visuals with the Power of AI
                            </h1>
                            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                Turn your text prompts into breathtaking, photorealistic images in seconds. Unleash your creativity like never before.
                            </p>
                            <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <button onClick={() => navigate("/signup")} className="cursor-pointer bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2">
                                    <span  >Start Generating for Free</span>
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* --- Features Section --- */}
                    <section className="py-20 bg-white">
                        <div className="container mx-auto px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Why Choose Dream Forge?</h2>
                                <p className="text-lg text-slate-600 mt-4 max-w-xl mx-auto">Discover the features that make our AI image generator stand out.</p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                <FeatureCard icon={<ShieldCheck size={24} />} title="Private Gallery">
                                    Your creations are your own. We provide a secure, private gallery for you to manage and store all your generated images safely.
                                </FeatureCard>
                                <FeatureCard icon={<Star size={24} />} title="Hyper-Realistic Results">
                                    Our advanced AI model is trained to produce incredibly detailed and lifelike images, perfect for professional or personal use.
                                </FeatureCard>
                                <FeatureCard icon={<Zap size={24} />} title="Lightning Fast Generation">
                                    Don't wait around. Our optimized infrastructure delivers high-quality images in just a few seconds, keeping your creative flow uninterrupted.
                                </FeatureCard>
                            </div>
                        </div>
                    </section>

                    {/* --- Showcase Section --- */}
                    <section className="py-20 bg-slate-50">
                        <div className="container mx-auto px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">From Dream Forge to Reality</h2>
                                <p className="text-lg text-slate-600 mt-4 max-w-xl mx-auto">See what our community has created with Dream Forge.</p>
                            </div>
                            <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                                <ShowcaseImage src="https://images.unsplash.com/photo-1682687220247-9f786e34d472?q=80&w=1974&auto=format&fit=crop" alt="AI generated desert landscape" />
                                <ShowcaseImage src="https://images.pexels.com/photos/33600936/pexels-photo-33600936.jpeg" alt="AI generated underwater scene" />
                                <ShowcaseImage src="https://images.unsplash.com/photo-1682687220363-35e4621ed990?q=80&w=1974&auto=format&fit=crop" alt="AI generated person in a cave" />
                                <ShowcaseImage src="https://images.unsplash.com/photo-1683009427513-28e163402d16?q=80&w=2070&auto=format&fit=crop" alt="AI generated aerial beach view" />
                                <ShowcaseImage src="https://images.pexels.com/photos/3411134/pexels-photo-3411134.jpeg" alt="AI generated futuristic city" />
                                <ShowcaseImage src="https://images.pexels.com/photos/2443072/pexels-photo-2443072.jpeg" alt="AI generated abstract art" />
                                <ShowcaseImage src="https://images.unsplash.com/photo-1682687220795-796d3f6f7000?q=80&w=2070&auto=format&fit=crop" alt="AI generated mountain climber" />
                                <ShowcaseImage src="https://images.pexels.com/photos/33566944/pexels-photo-33566944.jpeg" alt="AI generated sea turtle" />
                            </div>
                        </div>
                    </section>
                </main>

                {/* --- Footer --- */}
                <footer className="bg-white border-t border-slate-200">
                    <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-slate-600">&copy; {new Date().getFullYear()} Dream Forge. All rights reserved.</p>
                    </div>
                </footer>



            </div>
        </>
    );
}
