import Logo from './ui/Logo';
import { useState, useReducer } from 'react';
import { Eye, EyeClosed } from 'lucide-react';
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

const Login_ver2 = () => {
  const [hidePassword, setHidePassword] = useState(true);
  const [formState, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const handleHidePassword = () => setHidePassword(prev => !prev);

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
    <div className="flex items-center justify-center w-screen h-screen bg-[#141414]">
      <div className="bg-black border h-[500px] border-white border-opacity-20 rounded-2xl p-8 w-full max-w-2xl text-white">
        <h1 className="flex flex-col justify-center items-center font-jsMath mt-4 text-[38px]">
          <p>Log in to your</p>
          <p>Sayings account</p>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center mt-8">
          {/* Username */}
          <div className="flex justify-center h-12 w-full mb-6">
            <input
              className="bg-black text-[18px] border border-white border-opacity-30 text-white px-4 py-2 rounded-lg w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-uiPrimary"
              placeholder="Username"
              value={formState.username}
              onChange={(e) => dispatch({ type: 'SET_USERNAME', payload: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="flex justify-center h-12 w-full mb-6 relative">
            <input
              type={hidePassword ? 'password' : 'text'}
              className="bg-black text-[18px] border border-white border-opacity-30 text-white px-4 py-2 pr-[calc(12%-20px)] rounded-lg w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-uiPrimary"
              placeholder="Password"
              value={formState.password}
              onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
            />
            <button
              type="button"
              onClick={handleHidePassword}
              className="absolute right-[calc(50%-170px)] top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100"
            >
              {hidePassword ? <EyeClosed size={24} /> : <Eye size={24} />}
            </button>
          </div>

          {/* Button */}
          <div className="flex justify-center h-12 w-full">
            <Button
              type="submit"
              text="Log in"
              className="rounded-lg w-full max-w-sm h-full font-bebas text-[26px]"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login_ver2;
