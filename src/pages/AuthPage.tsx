import React from 'react';

const AuthPage = () => {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-white mb-4">Join Crave</h1>
      <p className="text-gray-400 mb-8">Sign in or create an account to start sharing.</p>
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl">
         <p className="text-pink-500 text-center">Auth Form Placeholder</p>
      </div>
    </div>
  );
};

export default AuthPage;
