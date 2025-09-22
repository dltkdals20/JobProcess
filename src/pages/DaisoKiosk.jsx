import React, { useState } from 'react';

const logoColor = {
  '카카오페이': 'bg-yellow-300',
  '네이버페이': 'bg-green-400',
  '하나원큐페이': 'bg-teal-400',
  '제로페이': 'bg-blue-300',
  'BC페이북': 'bg-red-400',
  'SOL페이': 'bg-blue-500',
  '유니온페이': 'bg-blue-600',
  '알리페이': 'bg-sky-400',
  '티머니': 'bg-purple-400',
  'PAYCO': 'bg-red-500',
};

const Tile = ({ selected, onClick, title, subtitle }) => (
  <button onClick={onClick} className={`rounded-[28px] bg-white border shadow-sm px-8 py-10 text-left hover:shadow md:min-h-[160px] ${selected?'ring-4 ring-red-400':''}`}>
    <div className="w-14 h-14 rounded-2xl border-2 border-red-400 text-red-500 flex items-center justify-center">
      <div className="w-8 h-6 bg-red-200 rounded" />
    </div>
    <div className="mt-4 text-2xl font-bold">{title}</div>
    {subtitle && <div className="text-neutral-500 mt-1">{subtitle}</div>}
  </button>
);

const PayLogo = ({ name, selected, onClick }) => (
  <button onClick={onClick} className={`text-center rounded-2xl p-3 ${selected?'ring-4 ring-red-400':''}`}>
    <div className="h-10 flex items-center justify-center">
      <div className={`w-10 h-10 ${logoColor[name]||'bg-neutral-200'} rounded`} />
    </div>
    <div className="mt-2 text-sm text-neutral-700">{name}</div>
  </button>
);

export default function DaisoKiosk() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const proceed = (name) => {
    setSelected(name);
    setShowModal(true);
  };

  if (step === 0) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="px-6 pt-10 pb-6 text-center">
            <div className="text-7xl font-black tracking-tight">셀프 계산</div>
            <div className="mt-6 flex items-center justify-center">
              <button onClick={()=>setStep(1)} className="rounded-[28px] bg-red-500 hover:bg-red-600 text-white font-extrabold text-5xl px-16 py-8 shadow-lg">시작하기</button>
            </div>
            <div className="mt-6 text-neutral-500">화면을 터치해주세요</div>
          </div>
        </div>
      </div>
    );
  }

  const payNames = ['카카오페이','네이버페이','하나원큐페이','제로페이','BC페이북','SOL페이','유니온페이','알리페이','티머니','PAYCO'];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="bg-white rounded-3xl border shadow-sm p-10 relative">
        <div className="rounded-2xl bg-neutral-100 text-center py-6 text-3xl md:text-4xl font-extrabold">결제 방법을 선택해 주세요</div>
        <div className="mt-10 grid md:grid-cols-2 gap-10">
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-6">
              <Tile title="카드" selected={selected==='카드'} onClick={()=>proceed('카드')} />
              <Tile title="Pay" subtitle="삼성/LG페이" selected={selected==='삼성/LG페이'} onClick={()=>proceed('삼성/LG페이')} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Tile title="포인트" selected={selected==='포인트'} onClick={()=>proceed('포인트')} />
              <Tile title="다이소 상품권" selected={selected==='다이소 상품권'} onClick={()=>proceed('다이소 상품권')} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-6 content-start items-start">
            {payNames.map(n => (
              <PayLogo key={n} name={n} selected={selected===n} onClick={()=>proceed(n)} />
            ))}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={()=>setShowModal(false)}>
            <div className="bg-white rounded-2xl p-6 w-[520px]" onClick={e=>e.stopPropagation()}>
              <div className="text-xl font-bold">{selected} 선택됨</div>
              <div className="mt-2 text-neutral-600">실제 장비에서는 여기서 결제 단말 연결/다음 안내로 진행됩니다.</div>
              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 rounded-md border" onClick={()=>setShowModal(false)}>닫기</button>
                <button className="px-4 py-2 rounded-md bg-red-500 text-white" onClick={()=>{ setShowModal(false); }}>다음</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 