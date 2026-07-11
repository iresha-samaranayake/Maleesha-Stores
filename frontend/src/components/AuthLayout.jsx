import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-slate-950 font-sans relative overflow-hidden flex flex-col justify-stretch">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-full bg-mesh-glow pointer-events-none z-0" />
      <div className="relative z-10 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
