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
            // make sure there is no leftover usernames in the local storage:
            const cashedUsername = localStorage.getItem("sayings_username");
            if (cashedUsername) {
                localStorage.removeItem("sayings_username");
            }

            await login(formState);
            toast.success('Login successful');
            navigate('/home');
        } catch (err: any) {
            toast.error(err.message || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center w-screen h-screen bg-[#141414]">
            {/* Logo in the top-left corner */}
            <div className="absolute left-4 sm:left-12 lg:left-32 top-8">
                <Logo size={44} />
            </div>

            <div className="absolute top-8 right-4 sm:right-12 lg:right-32">
                <div
                    className="bg-black border-solid border-[1px] border-white border-opacity-30 rounded-lg p-2 pt-2.5 pb-2.5 pr-3 sm:pr-4 mt-2 flex items-center gap-2 cursor-pointer group"
                    onClick={() => navigate('/home')}
                >
                    <ArrowLeft className="text-white group-hover:stroke-uiPrimary transition duration-200" size={28} />
                    <span className="text-white text-xl group-hover:text-uiPrimary transition duration-200 hidden sm:inline">
            Back
          </span>
                </div>
            </div>

            {/* Login box */}
            <div className="bg-black border h-[500px] border-white border-opacity-20 rounded-2xl p-8 w-full max-w-2xl text-white">
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
                    <div className="flex justify-center h-12 w-full mb-6 relative">
                        <input
                            type={hidePassword ? 'password' : 'text'}
                            className="bg-black text-[18px] border border-white border-opacity-30 text-white px-4 py-2 pr-10 rounded-lg w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-uiPrimary"
                            placeholder="Password"
                            value={formState.password}
                            onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={handleHidePassword}
                            className="absolute right-[calc(50%-170px)] top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100"
                            aria-label={hidePassword ? "Show password" : "Hide password"}
                        >
                            {hidePassword ? <EyeClosed size={24} /> : <Eye size={24} />}
                        </button>
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
    );
};

export default Login;