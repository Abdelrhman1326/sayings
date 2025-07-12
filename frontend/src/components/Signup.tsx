import SideImage from '../assets/login-signup-pages-image.jpg';
import Logo from './ui/Logo';
import { useState, useReducer } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { signup } from '../apis/signupApi';

import { toast } from 'react-toastify';

const Signup = () => {
  const [hidePassword, setHidePassword] = useState(true);
  const navigate = useNavigate();

  const handleHidePassword = () => {
    setHidePassword(!hidePassword);
  };

  function reducer(formData: any, action: any) {
    switch (action.type) {
      case 'modify_email':
        return { ...formData, email: action.payload };
      case 'modify_username':
        return { ...formData, userName: action.payload };
      case 'modify_password':
        return { ...formData, password: action.payload };
      case 'modify_confirmpassword':
        return { ...formData, confirmPassword: action.payload };
      default:
        return formData;
    }
  }

  const [formData, dispatch] = useReducer(reducer, {
    email: '',
    userName: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await signup({
        email: formData.email,
        username: formData.userName,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      console.log("Signup success:", response);
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err: any) {
      if (err.message) {
        toast.error(err.message);
      } else {
        toast.error("Signup failed");
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#141414] pl-20 pr-20">
      {/* Left image side */}
      <div className="w-1/2 flex items-center relative">
        <img
          src={SideImage}
          alt=""
          className="max-h-[92%] min-w-[92%] rounded-[40px] object-cover"
        />
        <div className="absolute top-24 left-16 z-10">
          <Logo color="white" size={54} />
          <p className="text-white text-[24px] opacity-70 font-ibm font-bold">It’s never too late</p>
        </div>
      </div>

      {/* Right form side */}
      <div className="flex flex-col w-1/2 pt-36 pb-20 text-white">
        <div className="text-center">
          <h1 className="font-jsMath text-[60px] font-bold cursor-default">Get Started</h1>
          <h2 className="text-[20px] opacity-70 font-ibm font-bold cursor-default">
            Welcome to sayings - Let’s get started
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full h-full items-center font-ibm font-bold"
        >
          {/* Email */}
          <div className="flex flex-col mt-10">
            <label className="text-[16px] opacity-70">Your email</label>
            <input
              className="h-[54px] w-[420px] rounded-xl bg-transparent border-solid border-2 pl-4 text-[18px] focus:border-uiPrimary focus:outline-none focus:border-4"
              placeholder="email"
              value={formData.email}
              onChange={(e) =>
                dispatch({ type: 'modify_email', payload: e.target.value })
              }
            />
          </div>

          {/* Username */}
          <div className="flex flex-col mt-5">
            <label className="text-[16px] opacity-70">Create new username</label>
            <input
              className="h-[54px] w-[420px] rounded-xl bg-transparent border-solid border-2 pl-4 text-[18px] focus:border-uiPrimary focus:outline-none focus:border-4"
              placeholder="username"
              value={formData.userName}
              onChange={(e) =>
                dispatch({ type: 'modify_username', payload: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div className="flex flex-col mt-5">
            <label className="text-[16px] opacity-70">Create new password</label>
            <div className="relative">
              <input
                className="h-[54px] w-[420px] rounded-xl bg-transparent border-solid border-2 pl-4 text-[18px] pr-11 focus:border-uiPrimary focus:outline-none focus:border-4"
                placeholder="password"
                type={hidePassword ? 'password' : 'text'}
                value={formData.password}
                onChange={(e) =>
                  dispatch({ type: 'modify_password', payload: e.target.value })
                }
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

          {/* Confirm Password */}
          <div className="flex flex-col mt-5">
            <label className="text-[16px] opacity-70">Confirm your password</label>
            <div className="relative">
              <input
                className="h-[54px] w-[420px] rounded-xl bg-transparent border-solid border-2 pl-4 text-[18px] pr-4 focus:border-uiPrimary focus:outline-none focus:border-4"
                placeholder="Confirm password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  dispatch({
                    type: 'modify_confirmpassword',
                    payload: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <Button
            className="mt-8 pt-3 w-[420px] h-[60px] font-bebas font-medium text-[24px] rounded-xl"
            text="Create new account"
            type="submit"
          />

          <p className="text-[16px] mt-2 cursor-default">
            <span className="opacity-70">Already have account?</span>{' '}
            <span
              className="hover:underline cursor-pointer"
              onClick={() => navigate('/login')}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;