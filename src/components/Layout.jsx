import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-neutral-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:flex md:flex-col">
        <div className="h-16 flex items-center px-5 text-2xl font-black text-amber-500">kiosk</div>
        <nav className="px-3 py-2 space-y-1">
          <NavLink to="/" end className={({isActive})=>`block px-3 py-2 rounded-md ${isActive?'bg-amber-100 text-amber-700':'text-neutral-700 hover:bg-neutral-50'}`}>시니어 키오스크 완전 정복</NavLink>
          <NavLink to="/kiosk" className={({isActive})=>`block px-3 py-2 rounded-md ${isActive?'bg-amber-100 text-amber-700':'text-neutral-700 hover:bg-neutral-50'}`}>이마트 셀프계산 시뮬레이터</NavLink>
          <NavLink to="/daiso" className={({isActive})=>`block px-3 py-2 rounded-md ${isActive?'bg-amber-100 text-amber-700':'text-neutral-700 hover:bg-neutral-50'}`}>다이소 셀프 계산대 시뮬레이터</NavLink>
        </nav>
      </aside>
      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4">
          <Link to="/" className="text-2xl font-black text-amber-500">Senior Kiosk</Link>
          <div className="text-sm text-neutral-500">학습/시뮬레이션</div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
} 