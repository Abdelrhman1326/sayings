import Logo from './ui/Logo';
import { useState, useReducer } from 'react';
import { Eye, EyeClosed, ArrowLeft } from 'lucide-react';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { login } from '../apis/loginApi';
import { toast } from 'react-toastify';

const initialState = {
    username: '',
    password: '',
};

function reducer(state: typeof initialState, action: { type: string; payload: string }) {
    switch (action.type) {
        case 'SET_USERNAME':
            return { ...state, username: action.payload };
        case 'SET_PASSWORD':
            return { ...state, password: action.payload };
        default:
            return state;
    }
}

const Login = () => {
    const [hidePassword, setHidePassword] = useState(true);
    const [formState, dispatch] = useReducer(reducer, initialState);
    const navigate = useNavigate();

    const handleHidePassword = () => setHidePassword(prev => !prev);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const cashedUsername = localStorage.getItem("sayings_username");
            if (cashedUsername) {
                localStorage.removeItem("sayings_username");
            }

            const response = await login(formState);
            
            // Store tokens in localStorage for persistence
            if (response.access) {
                localStorage.setItem('access_token', response.access);
            }
            if (response.refresh) {
                localStorage.setItem('refresh_token', response.refresh);
            }
            if (response.user?.username) {
                localStorage.setItem('sayings_username', response.user.username);
            }
            
            toast.success('Login successful');
            navigate('/home');
        } catch (err: any) {
            toast.error(err.message || 'Login failed');
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-screen bg-[#141414] overflow-x-hidden">

            {/* Header — in normal flow */}
            <div className="flex items-center justify-between px-4 sm:px-12 lg:px-32 py-4 shrink-0">
                <Logo size={44} />
                <div
                    className="bg-black border-solid border-[1px] border-white border-opacity-30 rounded-lg p-2 pt-2.5 pb-2.5 pr-3 sm:pr-4 flex items-center gap-2 cursor-pointer group"
                    onClick={() => navigate('/home')}
                >
                    <ArrowLeft className="text-white group-hover:stroke-uiPrimary transition duration-200" size={28} />
                    <span className="text-white text-xl group-hover:text-uiPrimary transition duration-200 hidden sm:inline">
            Back
          </span>
                </div>
            </div>

            {/* Page body */}
            <div className="flex flex-1 items-center justify-center px-4 py-8">
                <div className="bg-black border border-white border-opacity-20 rounded-2xl p-8 w-full max-w-2xl text-white">
                    <h1 className="flex flex-col justify-center items-center font-jsMath mt-4 text-[40px]">
                        <p>Log in to your</p>
                        <p>Sayings account</p>
                    </h1>

                    <form onSubmit={handleSubmit} className="flex flex-col items-center mt-8">
                        {/* Username input */}
                        <div className="flex justify-center h-12 w-full mb-6">
                            <input
                                className="bg-black text-[18px] border border-white border-opacity-30 text-white px-4 py-2 rounded-lg w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-uiPrimary"
                                placeholder="Username"
                                value={formState.username}
                                onChange={(e) => dispatch({ type: 'SET_USERNAME', payload: e.target.value })}
                            />
                        </div>

                        {/* Password input with toggle */}
                        <div className="flex justify-center h-12 w-full mb-6">
                            <div className="relative w-full max-w-sm">
                                <input
                                    type={hidePassword ? 'password' : 'text'}
                                    className="bg-black text-[18px] border border-white border-opacity-30 text-white px-4 py-2 pr-10 rounded-lg w-full h-full focus:outline-none focus:ring-2 focus:ring-uiPrimary"
                                    placeholder="Password"
                                    value={formState.password}
                                    onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={handleHidePassword}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100"
                                    aria-label={hidePassword ? "Show password" : "Hide password"}
                                >
                                    {hidePassword ? <EyeClosed size={24} /> : <Eye size={24} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <div className="flex justify-center h-12 w-full">
                            <Button
                                type="submit"
                                text="Log in"
                                className="rounded-lg w-full max-w-sm h-full font-bebas text-[26px]"
                            />
                        </div>

                        <p className="text-[18px] mt-4 cursor-default">
                            <span className="opacity-70">New Here?</span>{' '}
                            <span
                                className="hover:underline cursor-pointer"
                                onClick={() => navigate('/signup')}
                            >
                Create an account
              </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;