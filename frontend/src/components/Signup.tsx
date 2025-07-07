import SideImage from '../assets/login-signup-pages-image.jpg';
import Logo from './ui/Logo';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Button from './ui/Button';

const Signup = () => {
  const [hidePassword, setHidePassword] = useState(true);
  
  const handleHidePassword = () => {
    setHidePassword(!hidePassword);
  }

  return (
    <div className="flex h-screen bg-[#141414] pl-20 pr-20">
      {/* Left side with image and overlaid logo - Made wider */}
      <div className="w-1/2 flex items-center relative">
        {/* Image */}
        <img
          src={SideImage}
          alt="Signup background"
          className="max-h-[92%] min-w-[90%] rounded-[40px] object-cover"
        />
        {/* Logo over the image */}
        <div className="absolute top-24 left-16 z-10">
          <Logo color="white" size={54} />
          <p className='text-white text-[24px] opacity-70 font-ibm font-bold'>It’s never too late</p>
        </div>
      </div>

      <div className="flex flex-col w-1/2 pt-36 pb-20 text-white">
        <div className='text-center'>
          <h1 className='font-jsMath text-[60px] font-bold cursor-default'>Get Started</h1>
          <h2 className='text-[20px] opacity-70 font-ibm font-bold cursor-default'>Welcome to sayings - Let’s get started</h2>
        </div>
        
        <form className='flex flex-col w-full h-full items-center font-ibm font-bold'>
          <div className='flex flex-col mt-10'>
            <label className='text-[16px] opacity-70'>Your email</label>
            <input className='h-[54px] w-[420px] rounded-xl bg-transparent border-solid border-2 pl-4 text-[18px]' placeholder='email' />
          </div>

          <div className='flex flex-col mt-5'>
            <label className='text-[16px] opacity-70'>Create new username</label>
            <input className='h-[54px] w-[420px] rounded-xl bg-transparent border-solid border-2 pl-4 text-[18px]' placeholder='username' />
          </div>
          
          <div className='flex flex-col mt-5'>
            <label className='text-[16px] opacity-70'>Create new password</label>
            <div className='relative'>
              <input className='h-[54px] w-[420px] rounded-xl bg-transparent border-solid border-2 pl-4 text-[18px] pr-11' placeholder='password'
                type={hidePassword ? "password" : "text"}
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

          <div className='flex flex-col mt-5'>
            <label className='text-[16px] opacity-70'>Confirm your password</label>
            <div className='relative'>
              <input className='h-[54px] w-[420px] rounded-xl bg-transparent border-solid border-2 pl-4 text-[18px] pr-11' placeholder='password'
                type={hidePassword ? "password" : "text"}
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
          
          <Button className='mt-8 w-[420px] h-[60px] text-[24px] rounded-xl' text='Create new account' />
          <p className="font-ibm font-bold text-[16px] mt-2 cursor-default"><span className="opacity-70">Already have account?</span> <span className="hover:underline">Login</span></p>
        </form>
      </div>
    </div>
  );
};

export default Signup;