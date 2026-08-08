'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [pin, setPin] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [agreeEula, setAgreeEula] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits!");
      return;
    }
    if (!agreeEula || !agreePrivacy) {
      setError("You must agree to the EULA and Privacy Policy!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, pin }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (role.toLowerCase() === 'admin') {
        setSuccess('Account created successfully! Redirecting to login...');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPin('');
        setAgreeEula(false);
        setAgreePrivacy(false);

        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setSuccess('Registration request sent to admin! Please wait for approval before logging in.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPin('');
        setAgreeEula(false);
        setAgreePrivacy(false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#1b1b1b] font-poppins text-white select-none">

      {}
      <div className="relative hidden md:flex md:w-[42%] lg:w-[45%] flex-col justify-between p-12 lg:p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/portal/signup-login/main-img.webp"
            alt="Employee Portal Background"
            fill
            priority
            className="object-cover object-center grayscale opacity-80"
          />

          <div
            className="absolute inset-0 z-10"
            style={{
              background: `
                linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.5) 35%, transparent 75%),
                linear-gradient(to bottom, rgba(28, 43, 65, 0.95) 0%, rgba(15, 25, 40, 0.5) 40%, transparent 100%),
                radial-gradient(circle at 120% 50%, rgba(190, 9, 25, 0.7) 0%, rgba(190, 9, 25, 0.15) 50%, transparent 75%),
                linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))
              `
            }}
          />
        </div>

        <div className="relative z-20 flex flex-col items-center mt-6">
          <Image
            src="/assets/home/logo.png"
            alt="DigiAmplify Logo"
            width={240}
            height={54}
            priority
            className="mb-3 object-contain"
          />
          <span className="text-[#be0919] uppercase tracking-[0.25em] text-[16px] font-bold">
            Employee Portal
          </span>
        </div>

        <div className="relative z-20 flex flex-col gap-6 max-w-[420px] mb-14">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-[35px] font-bold leading-tight font-['Poppins']">
              One Platform.
            </h1>
            <h2 className="text-3xl lg:text-[35px] font-bold leading-tight text-[#be0919] font-['Poppins']">
              Everything You Need.
            </h2>
          </div>

          <p className="text-[#cccccc] text-[14px] lg:text-[15px] leading-relaxed font-light">
            Access your dashboard, manage your tasks, track performance and stay connected.
          </p>

          <div className="flex items-center gap-2.5 mt-2 w-fit">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span className="text-[13px] font-medium tracking-wide text-white">
              Secure. Reliable. Always.
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:p-8 lg:p-12 bg-[#353434] relative">
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_bottom_right,rgba(190,9,25,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-[580px] bg-[#0c0c0c] border border-neutral-900 rounded-[24px] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative z-10 transition-all duration-300 hover:border-neutral-800 my-4">

          <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col">
            <div className="w-14 h-14 rounded-2xl border-[1px] border-[#be0919] bg-[#be0919]/5 flex items-center justify-center mb-6 mx-auto shadow-[0_0_15px_rgba(190,9,25,0.08)]">
              <User className="w-6 h-6 text-[#be0919]" />
            </div>

            <h2 className="text-2xl sm:text-[28px] font-bold text-center text-white mb-2 tracking-wide font-['Poppins']">
              Create Account
            </h2>
            <p className="text-white/50 text-[13px] text-center mb-10 font-light">
              Sign in to manage the operation
            </p>

            {error && (
              <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-[13px] py-3.5 px-4 rounded-[14px] mb-6 text-center font-light">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[13px] py-3.5 px-4 rounded-[14px] mb-6 text-center font-light">
                {success}
              </div>
            )}

            <div className="flex flex-col mb-6">
              <label className="text-neutral-400 text-[14px] font-medium text-white mb-2.5 tracking-wide">
                Email Address
              </label>
              <div className="flex items-center w-full bg-[#050505] border border-neutral-900 rounded-[14px] px-4 py-3.5 focus-within:border-[#be0919] focus-within:shadow-[0_0_12px_rgba(190,9,25,0.06)] transition-all duration-200 group">
                <Mail className="w-[18px] h-[18px] text-white/80 group-focus-within:text-[#be0919] transition-colors mr-3" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="username"
                  required
                  placeholder="Enter email here"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-white border-none outline-none w-full placeholder-white/50 text-sm font-light [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#050505_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
              </div>
            </div>

            <div className="flex flex-col mb-6">
              <label className="text-neutral-400 text-[14px] font-medium text-white mb-2.5 tracking-wide">
                Create Password
              </label>
              <div className="flex items-center w-full bg-[#050505] border border-neutral-900 rounded-[14px] px-4 py-3.5 focus-within:border-[#be0919] focus-within:shadow-[0_0_12px_rgba(190,9,25,0.06)] transition-all duration-200 group">
                <Lock className="w-[18px] h-[18px] text-white/80 group-focus-within:text-[#be0919] transition-colors mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  required
                  placeholder="Enter password here"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-white border-none outline-none w-full placeholder-white/50 text-sm font-light [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#050505_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-600 hover:text-neutral-400 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-[18px] h-[18px]" />
                  ) : (
                    <EyeOff className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col mb-6">
              <label className="text-neutral-400 text-[14px] font-medium text-white mb-2.5 tracking-wide">
                Confirm Password
              </label>
              <div className="flex items-center w-full bg-[#050505] border border-neutral-900 rounded-[14px] px-4 py-3.5 focus-within:border-[#be0919] focus-within:shadow-[0_0_12px_rgba(190,9,25,0.06)] transition-all duration-200 group">
                <Lock className="w-[18px] h-[18px] text-white/80 group-focus-within:text-[#be0919] transition-colors mr-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="new-password"
                  required
                  placeholder="Enter password here"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent text-white border-none outline-none w-full placeholder-white/50 text-sm font-light [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#050505_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-neutral-600 hover:text-neutral-400 focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? (
                    <Eye className="w-[18px] h-[18px]" />
                  ) : (
                    <EyeOff className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col mb-6">
              <label className="text-neutral-400 text-[14px] font-medium text-white mb-2.5 tracking-wide">
                Role
              </label>
              <div className="flex items-center w-full bg-[#050505] border border-neutral-900 rounded-[14px] px-4 py-3.5 focus-within:border-[#be0919] focus-within:shadow-[0_0_12px_rgba(190,9,25,0.06)] transition-all duration-200 group">
                <User className="w-[18px] h-[18px] text-white/80 group-focus-within:text-[#be0919] transition-colors mr-3" />
                <select
                  name="role"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-transparent text-white border-none outline-none w-full text-sm font-light cursor-pointer focus:outline-none"
                >
                  <option value="Employee" className="bg-[#0c0c0c] text-white">Employee</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col mb-8">
              <label className="text-neutral-400 text-[14px] font-medium text-white mb-2.5 tracking-wide">
                Create Pin (4 digits)
              </label>
              <div className="flex items-center w-full bg-[#050505] border border-neutral-900 rounded-[14px] px-4 py-3.5 focus-within:border-[#be0919] focus-within:shadow-[0_0_12px_rgba(190,9,25,0.06)] transition-all duration-200 group">
                <Lock className="w-[18px] h-[18px] text-white/80 group-focus-within:text-[#be0919] transition-colors mr-3" />
                <input
                  type={showPin ? 'text' : 'password'}
                  name="pin"
                  id="pin"
                  required
                  pattern="[0-9]{4}"
                  maxLength={4}
                  placeholder="...."
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setPin(val);
                    }
                  }}
                  className="bg-transparent text-white border-none outline-none w-full placeholder-white/50 text-sm font-light tracking-[0.4em] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#050505_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-neutral-600 hover:text-neutral-400 focus:outline-none transition-colors"
                >
                  {showPin ? (
                    <Eye className="w-[18px] h-[18px]" />
                  ) : (
                    <EyeOff className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              <p className="text-[12px] text-white/60 mt-2 font-light text-left w-full">
                Used to clock in/out on the time clock terminal.
              </p>
            </div>

            <div className="flex items-start mb-4 select-none">
              <label className="flex items-center cursor-pointer group mt-0.5">
                <input
                  type="checkbox"
                  checked={agreeEula}
                  onChange={(e) => setAgreeEula(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${agreeEula
                  ? 'border-[#be0919] bg-[#be0919]'
                  : 'border-neutral-800 bg-[#050505] group-hover:border-neutral-700'
                  }`}>
                  {agreeEula && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </label>
              <span className="text-neutral-400 text-[13px] ml-2.5 font-light leading-snug">
                <span className="text-white hover:underline cursor-pointer">I agree to the End User License Agreement</span> <span className="text-[#be0919]">*</span>
              </span>
            </div>

            <div className="flex items-start mb-8 select-none">
              <label className="flex items-center cursor-pointer group mt-0.5">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${agreePrivacy
                  ? 'border-[#be0919] bg-[#be0919]'
                  : 'border-neutral-800 bg-[#050505] group-hover:border-neutral-700'
                  }`}>
                  {agreePrivacy && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </label>
              <span className="text-neutral-400 text-[13px] ml-2.5 font-light leading-snug">
                <span className="text-white hover:underline cursor-pointer">I agree to the Privacy Policy</span> <span className="text-[#be0919]">*</span>
              </span>
            </div>

            {}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-[14px] bg-[#be0919] hover:bg-[#990714] text-white text-[15px] font-bold tracking-wide transition-all duration-300 shadow-[0_4px_25px_rgba(190,9,25,0.15)] hover:shadow-[0_4px_30px_rgba(190,9,25,0.3)] transform active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>

            {}
            <div className="text-center mt-8">
              <span className="text-neutral-500 text-white text-[13px] font-light">
                Already have account?{' '}
              </span>
              <Link href="/login" className="text-[#be0919] text-[13px] font-bold hover:underline">
                Login
              </Link>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}
