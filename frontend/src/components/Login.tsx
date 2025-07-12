import SideImage from '../assets/login-signup-pages-image.jpg';
import Logo from './ui/Logo';
import { useState, useReducer } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { login } from '../apis/loginApi'
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

  const handleHidePassword = () => {
    setHidePassword(!hidePassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formState);
      toast.success('Login successful');
      navigate('/home');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex h-screen bg-[#141414] pl-20 pr-20">
      {/* Left side with image and overlaid logo - Made wider */}
      <div className="w-1/2 flex items-center relative">
        <img
          src={SideImage}
          alt=""
          className="max-h-[92%] min-w-[92%] rounded-[40px] object-cover"
        />
        <div className="absolute top-24 left-16 z-10">
          <Logo color="white" size={54} />
          <p className="text-white text-[24px] opacity-70 font-ibm font-bold">Happy to see you again</p>
        </div>
      </div>

      <div className="flex flex-col w-1/2 pt-48 pb-20 text-white">
        <div className="text-center">
          <h1 className="font-jsMath text-[60px] font-bold cursor-default mt-8">Welcome Back</h1>
          <h2 className="text-[20px] opacity-70 font-ibm font-bold cursor-default">Welcome back to sayings - Let's continue</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col w-full h-full items-center font-ibm font-bold">
          <div className="flex flex-col mt-10">
            <label className="text-[16px] opacity-70">Your username</label>
            <input
              className="h-[54px] w-[420px] rounded-xl bg-transparent border-solid border-2 pl-4 text-[18px] focus:border-uiPrimary focus:outline-none focus:border-4"
              placeholder="username"
              value={formState.username}
              onChange={e => dispatch({ type: 'SET_USERNAME', payload: e.target.value })}
            />
          </div>

          <div className="flex flex-col mt-5">
            <label className="text-[16px] opacity-70">Your password</label>
            <div className="relative">
              <input
                className="h-[54px] w-[420px] rounded-xl bg-transparent border-solid border-2 pl-4 text-[18px] pr-11 focus:border-uiPrimary focus:outline-none focus:border-4"
                placeholder="password"
                type={hidePassword ? 'password' : 'text'}
                value={formState.password}
                onChange={e => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
              />
              <button
                type="button"
                onClick={handleHidePassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100"
              >
                {hidePassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-8 pt-3 w-[420px] h-[60px] font-bebas font-medium text-[24px] rounded-xl"
            text="Log in to your account"
          />

          <p className="text-[16px] mt-2 cursor-default">
            <span className="opacity-70">New Here?</span>{' '}
            <span className="hover:underline cursor-pointer" onClick={() => navigate("/signup")}>
              Create an account
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;