import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_SERVER_URL;


// --- Avatar Selection ---
const avatarOptions = [
    { seed: 'Easton', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Easton' },
    { seed: 'Emery', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Emery' },
    { seed: 'Avery', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Avery' },
    { seed: 'Vivian', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Vivian' },
];

const AvatarPicker = ({ selected, onSelect }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Choose Your Avatar</label>
        <div className="flex justify-around items-center">
            {avatarOptions.map(avatar => (
                <button
                    type="button"
                    key={avatar.seed}
                    onClick={() => onSelect(avatar.seed)}
                    className={`rounded-full p-1 transition-all duration-200 focus:outline-none ${selected === avatar.seed ? 'ring-2 ring-offset-2 ring-indigo-500' : 'hover:ring-2 hover:ring-indigo-300'}`}
                >
                    <img
                        src={avatar.url}
                        alt={`Avatar for ${avatar.seed}`}
                        className="w-16 h-16 rounded-full bg-slate-200"
                    />
                </button>
            ))}
        </div>
    </div>
);


// --- Custom Input Field Component ---
const InputField = ({ id, type, placeholder, value, onChange, icon }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = type === 'password';

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };


    return (
        <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                {icon}
            </div>
            <input
                id={id}
                name={id}
                type={isPassword ? (isPasswordVisible ? 'text' : 'password') : type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full py-3 pl-12 pr-4 text-slate-800 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 placeholder:text-slate-400 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/50
                    }`}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                >
                    {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            )}

        </div>
    );
};

// --- Main Signup Component ---
export default function App() {
    const navigate = useNavigate()

    const { setUser, checkLocalStorage } = useAuth()
    useEffect(() => {
        if (checkLocalStorage()) {
            navigate("/")
        }
    }, [])
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        avatarSeed: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const validate = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Name cannot be empty.';
                break;
            case 'email':
                if (!value.trim()) {
                    error = 'Email cannot be empty.';
                }
                else if (/\s/.test(value)) {
                    error = 'Email cannot contain spaces at the start, end, or inside.';
                }
                else if (!/^[a-zA-Z0-9]+@(gmail\.com|yahoo\.com)$/.test(value)) {
                    error = 'Email must be a valid and contain only letters and numbers (no special characters).';
                } else if (value.includes('@gmail.com') && value.split('@')[0].includes('.')) {
                    error = "Gmail username cannot contain a period ('.').";
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Password cannot be empty.';
                } else if (/\s/.test(value)) {
                    error = 'Password cannot contain spaces.';
                } else if (value.length < 8) {
                    error = 'Password must be at least 8 characters long.';
                }
                break;
            case 'avatarSeed':
                if (!value) error = 'Please select an avatar.';
                break;
            default:
                break;
        }
        return error;
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

    };

    const handleAvatarSelect = (seed) => {
        setFormData({ ...formData, avatarSeed: seed });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let validationErrors = []
        const fieldsArr = Object.keys(formData)

        for (let i = 0; i < fieldsArr.length; i++) {
            const error = validate(fieldsArr[i], formData[fieldsArr[i]])
            if (error) {
                validationErrors.push(error)
            }
        }

        if (validationErrors.length != 0) {
            toast.error(validationErrors[0])
            return
        }



        setIsLoading(true);
        try {
            const { data } = await axios.post(apiUrl + "/api/v1/signup", {
                name: formData.name, email: formData.email, password: formData.password, avatar: formData.avatarSeed
            },

                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )

            localStorage.setItem("user", data.token)
            toast.success(data.message)
            setUser(data.user)
            navigate("/")
        } catch (error) {

            const message = error.response?.data?.error || error.message
            toast.error(message)

        }
        finally {
            setIsLoading(false)
        }



    };

    return (
        <>
            <title>
                Sign Up - Dream Forge
            </title>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
                <div className="relative w-full max-w-md mx-auto">
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl animate-aurora -z-10"></div>
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl animate-aurora animation-delay-4000 -z-10"></div>

                    <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
                            <p className="text-slate-500 mt-2">Join us and start your creative journey.</p>
                        </div>


                        <form onSubmit={handleSubmit} noValidate>
                            <div className="space-y-6">
                                <InputField id="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} icon={<User size={20} />} />
                                <InputField id="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} icon={<Mail size={20} />} />
                                <InputField id="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} icon={<Lock size={20} />} />
                                <AvatarPicker selected={formData.avatarSeed} onSelect={handleAvatarSelect} />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full mt-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30">
                                {isLoading ? (<><Loader2 className="animate-spin mr-2" size={20} />Processing...</>) : ('Sign Up')}
                            </button>
                        </form>
                        <p className="text-center text-sm text-slate-500 mt-8">
                            Already have an account? <a href="/login" className="font-semibold text-indigo-600 hover:underline">Log In</a>
                        </p>
                    </div>
                </div>

            </div>
        </>
    );
}
