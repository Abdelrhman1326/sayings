import Logo from './ui/Logo';
import { useReducer } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { signup } from '../apis/signupApi';
import { toast } from 'react-toastify';
import PasswordStrengthChecker from './ui/PasswordStrengthChecker';

function reducer(formData: any, action: any) {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...formData, email: action.payload };
    case 'SET_USERNAME':
      return { ...formData, username: action.payload };
    case 'SET_PASSWORD':
      return { ...formData, password: action.payload };
    case 'SET_CONFIRMPASSWORD':
      return { ...formData, confirmPassword: action.payload };
    default:
      return formData;
  }
}

const Signup = () => {
  const [formData, dispatch] = useReducer(reducer, {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      toast.success('Signup successful');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[#141414] mt-8 overflow-x-hidden">
      <div className="absolute left-32 top-8">
        <Logo size={44} />
      </div>

      <div className="absolute top-8 right-32">
        <div
          onClick={() => navigate(-1)}
          className="bg-black border border-white border-opacity-30 rounded-lg p-2 pt-2.5 pb-2.5 pr-4 flex items-center gap-2 cursor-pointer group"
        >
          <ArrowLeft className="text-white group-hover:stroke-uiPrimary transition duration-200" size={28} />
          <span className="text-white text-xl group-hover:text-uiPrimary transition duration-200">Back</span>
        </div>
      </div>

      <div className="bg-black border h-[780px] border-white border-opacity-20 rounded-2xl p-8 w-full max-w-2xl text-white">
        <h1 className="flex flex-col justify-center items-center font-jsMath mt-4 text-[40px]">
          <p>Sign up for your</p>
          <p>Sayings account</p>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center mt-8">
          {/* Username input */}
          <div className="flex justify-center h-12 w-full mb-6">
            <input
              className="bg-black text-[18px] border border-white border-opacity-30 text-white px-4 py-2 rounded-lg w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-uiPrimary"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => dispatch({ type: 'SET_USERNAME', payload: e.target.value })}
            />
          </div>

          {/* Email input */}
          <div className="flex justify-center h-12 w-full mb-6">
            <input
              type="email"
              className="bg-black text-[18px] border border-white border-opacity-30 text-white px-4 py-2 rounded-lg w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-uiPrimary"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: e.target.value })}
            />
          </div>

          {/* Password Strength Component */}
          <div className="w-full max-w-sm mb-6">
            <PasswordStrengthChecker
              value={formData.password}
              onChange={(val) => dispatch({ type: 'SET_PASSWORD', payload: val })}
            />
          </div>

          {/* Confirm Password */}
          <div className="flex justify-center h-12 w-full mb-6">
            <input
              type="password"
              className="bg-black text-[18px] border border-white border-opacity-30 text-white px-4 py-2 rounded-lg w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-uiPrimary"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => dispatch({ type: 'SET_CONFIRMPASSWORD', payload: e.target.value })}
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-center h-12 w-full">
            <Button
              type="submit"
              text="Sign Up"
              className="rounded-lg w-full max-w-sm h-full font-bebas text-[26px]"
            />
          </div>

          <p className="text-[18px] mt-4 cursor-default">
            <span className="opacity-70">Already have an account?</span>{' '}
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/login')}>
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;