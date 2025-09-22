import React from 'react';

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-2xl bg-white p-8 shadow-sm border">
        <div className="text-4xl font-extrabold leading-tight">시니어 키오스크 완전 정복</div>
        <div className="mt-2 text-neutral-600">연습을 통해 다양한 생활 키오스크를 쉽게 사용할 수 있도록 단계별로 학습합니다.</div>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border p-4 bg-neutral-50">
            <div className="text-lg font-semibold">이마트 셀프계산</div>
            <div className="text-sm text-neutral-600 mt-1">상품 스캔부터 결제까지 전 과정을 연습합니다.</div>
            <a href="/kiosk" className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-md bg-amber-400 hover:bg-amber-500 text-black font-semibold border border-amber-300">시작하기</a>
          </div>
          <div className="rounded-xl border p-4 bg-neutral-50 opacity-60">
            <div className="text-lg font-semibold">무인주문(예정)</div>
            <div className="text-sm text-neutral-600 mt-1">패스트푸드/카페 등</div>
          </div>
          <div className="rounded-xl border p-4 bg-neutral-50 opacity-60">
            <div className="text-lg font-semibold">무인발권(예정)</div>
            <div className="text-sm text-neutral-600 mt-1">영화/교통 등</div>
          </div>
        </div>
      </div>
    </div>
  );
} 