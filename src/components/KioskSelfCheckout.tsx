import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Trash2, CreditCard, Smartphone, Wallet, ScanLine, Percent, Phone, Search, ShoppingBasket, ShoppingBag, TicketPercent, Camera, ChevronRight, HelpCircle, ShieldAlert, Plus, Minus, Barcode, Contact2, Gift, IdCard } from "lucide-react";

// 간단 대체 컴포넌트 (shadcn-ui 자리)
const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "secondary" }) => (
  <button {...props} className={(props.className ?? "") + " inline-flex items-center justify-center rounded-md px-3 py-2 border border-transparent bg-neutral-900 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed " + (props.variant === "secondary" ? "bg-white text-neutral-900 border-neutral-300" : "bg-neutral-900 text-white")} />
);
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} {...props} className={(props.className ?? "") + " rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"} />
));
Input.displayName = "Input";
const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }) => (
  open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => onOpenChange(false)}><div className="bg-white text-neutral-900 rounded-lg p-4 max-h-[80vh] overflow-auto" onClick={e=>e.stopPropagation()}>{children}</div></div> : null
);
const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);
const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="mb-2">{children}</div>;
const DialogTitle = ({ children }: { children: React.ReactNode }) => <div className="text-lg font-bold">{children}</div>;
const DialogFooter = ({ children, className }: { children?: React.ReactNode; className?: string }) => <div className={"mt-4 flex justify-end gap-2 " + (className ?? "")}>{children}</div>;
const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...props} className={(props.className ?? "") + " text-sm font-medium"} />
const ScrollArea = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className + " overflow-auto"}>{children}</div>;

// KRW 포맷터
const krw = (n: number) => new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(Math.round(n));
const digitsOnly = (s: string) => s.replace(/\D+/g, "");
const validPhone = (s: string) => /^(010|011|016|017|018|019)\d{7,8}$/.test(digitsOnly(s));

const PRODUCT_DB = [
  { barcode: "8801000000012", name: "서울우유 1L", price: 2500, category: "유제품" },
  { barcode: "8801000000036", name: "즉석밥 3개입", price: 4380, category: "식품" },
  { barcode: "8801000000029", name: "신라면 (5개입)", price: 4780, category: "식품" },
  { barcode: "8801000000104", name: "사과 4입", price: 5980, category: "신선" },
  { barcode: "8801000000081", name: "바나나 (1송이)", price: 3980, category: "신선" },
  { barcode: "8801000000043", name: "닭가슴살 1kg", price: 10900, category: "축산" },
  { barcode: "NB001", name: "바코드없는 과일(소)", price: 2000, category: "신선" },
  { barcode: "NB002", name: "바코드없는 채소(소)", price: 1500, category: "신선" },
  { barcode: "NB003", name: "즉석조리 튀김(소)", price: 2500, category: "즉석" },
  { barcode: "BAGL", name: "종량제봉투(대)", price: 500, category: "부자재" },
  { barcode: "BAGM", name: "종량제봉투(중)", price: 300, category: "부자재" },
  { barcode: "SBAG", name: "장바구니(대)", price: 1500, category: "부자재" },
] as const;

type Product = typeof PRODUCT_DB[number];
 type CartItem = { product: Product; qty: number };

function applyCoupon(subtotal: number, items: CartItem[], code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return 0;
  if (normalized === "EM10") return Math.floor(subtotal * 0.1);
  if (normalized === "EM2000") return Math.min(2000, subtotal);
  if (normalized === "FRESH5") {
    const fresh = items.filter(it => it.product.category === "신선").reduce((s, it) => s + it.product.price * it.qty, 0);
    return Math.floor(fresh * 0.05);
  }
  return 0;
}

export default function KioskSelfCheckout() {
  const [landing, setLanding] = useState(true);
  const [step, setStep] = useState(1);
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [membership, setMembership] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ method: string; last4?: string } | null>(null);
  const [payPanelOpen, setPayPanelOpen] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'card' | 'mobile'>("card");
  const [cardInsertOpen, setCardInsertOpen] = useState(false);
  const [cardInsertProgress, setCardInsertProgress] = useState(0);
  const [produceOpen, setProduceOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [couponScanOpen, setCouponScanOpen] = useState(false);
  const couponInputRef = useRef<HTMLInputElement>(null);
  const [couponScanValue, setCouponScanValue] = useState("");
  const [couponScanError, setCouponScanError] = useState("");
  const [afterCouponGoPay, setAfterCouponGoPay] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [pointsMethod, setPointsMethod] = useState<"phone" | "barcode" | "sensing" | "credit" | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const phoneRef = useRef<HTMLInputElement>(null);
  const pointBarcodeRef = useRef<HTMLInputElement>(null);
  const [pointBarcodeVal, setPointBarcodeVal] = useState("");
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (landing) return;
    const t = setInterval(() => { if (scanRef.current && document.activeElement !== scanRef.current) scanRef.current.focus(); }, 1000);
    return () => clearInterval(t);
  }, [landing]);
  useEffect(() => { if (!couponScanOpen) return; const t = setInterval(() => couponInputRef.current?.focus(), 800); return () => clearInterval(t); }, [couponScanOpen]);
  useEffect(() => { if (!pointsOpen) return; const t = setInterval(() => { if (pointsMethod === "phone") phoneRef.current?.focus(); if (pointsMethod === "barcode") pointBarcodeRef.current?.focus(); }, 800); return () => clearInterval(t); }, [pointsOpen, pointsMethod]);
  useEffect(() => {
    if (!cardInsertOpen) return; setCardInsertProgress(0);
    const id = window.setInterval(() => {
      setCardInsertProgress(p => {
        const next = Math.min(p + 5, 100);
        if (next === 100) { window.clearInterval(id); setCardInsertOpen(false); setTimeout(() => simulatePay("신용/체크카드"), 600); }
        return next;
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [cardInsertOpen]);

  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.product.price * it.qty, 0), [cart]);
  const discount = useMemo(() => applyCoupon(subtotal, cart, couponApplied ?? ""), [subtotal, cart, couponApplied]);
  const total = Math.max(0, subtotal - discount);
  const itemCount = useMemo(() => cart.reduce((s, it) => s + it.qty, 0), [cart]);
  const bagCount = useMemo(() => cart.filter(it => it.product.barcode.startsWith("BAG")).reduce((s, it) => s + it.qty, 0), [cart]);
  const sBagCount = useMemo(() => cart.filter(it => it.product.barcode === "SBAG").reduce((s, it) => s + it.qty, 0), [cart]);

  function addByBarcode(code: string) {
    const product = PRODUCT_DB.find(p => p.barcode === code);
    if (!product) return;
    setCart(prev => {
      const idx = prev.findIndex(it => it.product.barcode === code);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 }; return copy; }
      return [...prev, { product, qty: 1 }];
    });
  }
  function addProduct(p: Product) { addByBarcode(p.barcode); }
  function changeQty(code: string, delta: number) {
    setCart(prev => {
      const idx = prev.findIndex(it => it.product.barcode === code);
      if (idx < 0) return prev; const next = prev[idx].qty + delta; if (next <= 0) return prev.filter((_, i) => i !== idx);
      const copy = [...prev]; copy[idx] = { ...copy[idx], qty: next }; return copy;
    });
  }
  function removeItem(code: string) { setCart(prev => prev.filter(it => it.product.barcode !== code)); }
  function handleScanSubmit(e: React.FormEvent) { e.preventDefault(); const code = barcode.trim(); if (code) addByBarcode(code); setBarcode(""); }
  function handleCouponScanSubmit(e: React.FormEvent) {
    e.preventDefault(); const code = couponScanValue.trim(); if (!code) return; const amt = applyCoupon(subtotal, cart, code);
    if (amt > 0) { setCouponApplied(code.toUpperCase()); setCouponScanOpen(false); setCouponScanValue(""); setCouponScanError(""); setStep(2); setPointsOpen(true); setAfterCouponGoPay(false); }
    else { setCouponScanError("유효하지 않거나 적용 대상이 아닙니다"); setCouponScanValue(""); }
  }
  function proceedToPayment() { setPointsOpen(false); setStep(3); setPayPanelOpen(true); }
  function simulatePay(method: string) { setStep(3); const last4 = String(Math.floor(1000 + Math.random() * 9000)); setPaymentInfo({ method, last4 }); setPaid(true); setPayPanelOpen(false); setStep(4); }
  function resetAll() { setCart([]); setCoupon(""); setCouponApplied(null); setMembership(""); setPaid(false); setPaymentInfo(null); setBarcode(""); setStep(1); setLanding(true); }
  function openProduce() { setProduceOpen(true); }
  function openBag() { setBagOpen(true); }

  if (landing) {
    return (
      <div className="min-h-screen w-full bg-neutral-50 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl rounded-2xl bg-white shadow-sm border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-neutral-50">
            <div className="text-2xl font-black text-amber-500">emart</div>
            <div className="text-xs font-semibold text-red-600">CCTV 촬영중</div>
            <div className="flex items-center gap-5 text-xs text-neutral-500">
              <button className="inline-flex items-center gap-1"><HelpCircle className="h-4 w-4"/>도움 요청</button>
              <span>English</span>
            </div>
          </div>
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-3 p-8 md:p-12">
              <div className="text-2xl md:text-3xl font-extrabold leading-snug">
                바코드를 스캔하시거나<br/>
                <span className="text-amber-500">스캔 시작하기</span> 버튼을 눌러 주세요
              </div>
              <button onClick={() => { setLanding(false); setStep(1); setTimeout(() => scanRef.current?.focus(), 0); }} className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold px-6 py-4 text-lg shadow">
                스캔 시작하기
              </button>
              <div className="mt-6">
                <button className="rounded-lg border px-4 py-2 text-sm bg-neutral-50 hover:bg-neutral-100">종량제 · 장바구니 구매하기</button>
              </div>
              <div className="mt-3 text-sm text-neutral-500">장바구니가 필요하시면 버튼을 눌러 주세요</div>
            </div>
            <div className="hidden md:block md:col-span-2 bg-amber-50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-900/90 p-3">
      <div className="mx-auto max-w-6xl rounded-[22px] bg-neutral-900 text-white shadow-xl ring-1 ring-black/40">
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
          <div className="text-2xl font-black text-amber-400">emart</div>
          <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
            <ShieldAlert className="h-4 w-4" /> CCTV 촬영 중
          </div>
          <div className="flex items-center gap-5 text-sm text-neutral-300">
            <button onClick={() => setHelpOpen(true)} className="inline-flex items-center gap-1 hover:text-white"><HelpCircle className="h-4 w-4"/>도움 요청</button>
            <span>English</span>
          </div>
        </div>

        <div className="flex items-center gap-6 px-6 py-3 bg-neutral-800/60 border-b border-white/10 text-sm">
          {[
            { n: 1, label: "상품 스캔" },
            { n: 2, label: "포인트" },
            { n: 3, label: "결제" },
            { n: 4, label: "완료" },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === s.n ? "bg-amber-400 text-black" : step > s.n ? "bg-emerald-500 text-white" : "bg-neutral-700 text-neutral-300"}`}>{s.n}</div>
              <div className={`${step >= s.n ? "text-white" : "text-neutral-400"}`}>{s.label}</div>
              {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-neutral-500" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4 p-6 bg-neutral-900/70">
          <div className="col-span-4">
            <div className="rounded-2xl bg-white text-neutral-900 p-5 shadow-inner">
              <div className="text-xl font-extrabold leading-snug">
                구매하실 상품을 <span className="text-amber-500">스캔</span>해 주세요
              </div>
              <form onSubmit={handleScanSubmit} className="mt-4">
                <div className="flex items-center rounded-xl border-2 border-amber-300 bg-amber-50 px-3 h-14 focus-within:ring-2 focus-within:ring-amber-400">
                  <ScanLine className="h-5 w-5 text-amber-600 mr-2" />
                  <Input ref={scanRef} value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="여기에 바코드를 스캔하거나 숫자를 입력하고 Enter" inputMode="numeric" pattern="[0-9]*" autoFocus className="h-10 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg" />
                  <Button type="submit" className="ml-2 h-10 px-4 bg-amber-400 hover:bg-amber-500 text-black font-bold">추가</Button>
                </div>
                <div className="mt-2 text-xs text-neutral-500">USB 스캐너가 연결되어 있으면 자동으로 입력됩니다. 엔터(↵) 접미가 설정되면 자동으로 담겨요.</div>
              </form>

              <div className="mt-5 space-y-3">
                <Button onClick={openProduce} className="w-full h-14 justify-start rounded-xl bg-amber-100 hover:bg-amber-200 text-neutral-900 font-bold">
                  <Camera className="mr-3 h-5 w-5" /> 바코드없는 과일·채소·즉석조리
                </Button>
                <Button onClick={openBag} variant="secondary" className="w-full h-14 justify-start rounded-xl border border-neutral-200 bg-white text-neutral-900">
                  <ShoppingBasket className="mr-3 h-5 w-5" /> 종량제/장바구니 추가
                </Button>
                <Button onClick={() => { setCouponScanOpen(true); setCouponScanValue(""); setCouponScanError(""); }} className="w-full h-14 justify-start rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold">
                  <TicketPercent className="mr-3 h-5 w-5" /> 쿠폰 등록{couponApplied ? "(1개)" : "(0개)"}
                </Button>
              </div>
            </div>
          </div>

          <div className="col-span-8">
            <div className="rounded-2xl bg-white text-neutral-900 shadow overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 text-sm border-b bg-neutral-50">
                <div className="flex gap-6 text-neutral-600">
                  <div>등록한 봉투 <b>{bagCount}</b></div>
                  <div>(대)장바구니 <b>{sBagCount}</b></div>
                </div>
                <div className="text-neutral-600">상품수량 <b className="text-neutral-900">{itemCount}</b></div>
              </div>

              <ScrollArea className="h-[330px]">
                <div className="divide-y">
                  {cart.length === 0 ? (
                    <div className="flex h-[320px] items-center justify-center text-neutral-500">아직 담은 상품이 없습니다. 바코드를 스캔해 보세요.</div>
                  ) : (
                    cart.map(it => (
                      <div key={it.product.barcode} className="grid grid-cols-12 items-center px-6 py-4">
                        <div className="col-span-7 font-medium truncate">{it.product.name}</div>
                        <div className="col-span-3 flex items-center gap-2">
                          <Button onClick={() => changeQty(it.product.barcode, -1)} className="h-8 w-8 p-0"><Minus className="h-4 w-4"/></Button>
                          <div className="w-8 text-center font-semibold">{it.qty}</div>
                          <Button onClick={() => changeQty(it.product.barcode, 1)} className="h-8 w-8 p-0"><Plus className="h-4 w-4"/></Button>
                        </div>
                        <div className="col-span-1 text-right font-semibold">{krw(it.product.price)}</div>
                        <div className="col-span-1 text-right">
                          <Button onClick={() => removeItem(it.product.barcode)} className="h-8 w-8 p-0"><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="grid grid-cols-12 items-center gap-4 border-t px-6 py-4">
                <div className="col-span-5 text-sm text-neutral-600 space-y-1">
                  <div className="flex items-center justify-between"><span>합계</span><span>{krw(subtotal)}</span></div>
                  <div className="flex items-center justify-between"><span>할인</span><span className="text-emerald-600">- {krw(discount)}</span></div>
                </div>
                <div className="col-span-3 text-lg font-extrabold text-right">결제 {krw(total)}</div>
                <div className="col-span-4 flex items-center justify-end gap-3">
                  <Button variant="secondary" className="h-12 px-5 border border-neutral-300"><Smartphone className="mr-2 h-5 w-5"/> emartpay 즉시 결제</Button>
                  <Button className="h-12 px-7 bg-amber-400 hover:bg-amber-500 text-black font-bold" onClick={() => { setAfterCouponGoPay(true); setCouponScanOpen(true); setCouponScanValue(""); setCouponScanError(""); }}>결제하기</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>도움이 필요하신가요?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600">직원을 호출하거나, 화면 왼쪽 버튼으로 바코드 없는 상품/봉투/쿠폰을 등록할 수 있습니다. 바코드 스캐너를 연결해 상품을 스캔해 주세요.</p>
          <DialogFooter>
            <Button onClick={() => setHelpOpen(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={produceOpen} onOpenChange={setProduceOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>바코드 없는 상품 추가</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCT_DB.filter(p => p.barcode.startsWith("NB")).map(p => (
              <div key={p.barcode} className="rounded-xl border p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-neutral-500">{krw(p.price)}</div>
                </div>
                <Button onClick={() => addProduct(p)} className="h-9">담기</Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setProduceOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bagOpen} onOpenChange={setBagOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>종량제/장바구니 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {PRODUCT_DB.filter(p => ["BAGL","BAGM","SBAG"].includes(p.barcode)).map(p => (
              <div key={p.barcode} className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-2">
                  {p.barcode.startsWith("BAG") ? <ShoppingBag className="h-5 w-5"/> : <ShoppingBasket className="h-5 w-5"/>}
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-neutral-500">{krw(p.price)}</div>
                  </div>
                </div>
                <Button onClick={() => addProduct(p)} className="h-9">추가</Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setBagOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={couponScanOpen} onOpenChange={(o)=>{ setCouponScanOpen(o); setCouponScanValue(""); setCouponScanError(""); if(!o) setAfterCouponGoPay(false); }}>
        <DialogContent className="max-w-3xl">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7">
              <div className="text-xl font-bold leading-snug">종이 쿠폰이나 앱 쿠폰이 있으시면,<br/>쿠폰 바코드를 스캔하여 등록해주세요</div>
              <form onSubmit={handleCouponScanSubmit} className="sr-only">
                <Input ref={couponInputRef} value={couponScanValue} onChange={(e)=>setCouponScanValue(e.target.value)} placeholder="쿠폰 스캔 대기" />
              </form>
              {couponScanError && (<div className="mt-3 text-sm text-red-600">{couponScanError}</div>)}
              <div className="mt-6 text-xs text-red-500">쿠폰 할인은 최종 결제시 적용됩니다</div>
              <div className="mt-2 text-sm text-neutral-600">쿠폰 할인 금액 <b className="text-neutral-900">{krw(discount)}</b> · {couponApplied ? "1개 쿠폰" : "0개 쿠폰"}</div>
            </div>
            <div className="col-span-5 flex items-center justify-center">
              <div className="rounded-2xl border p-6 bg-neutral-50 text-neutral-600 flex flex-col items-center">
                <div className="rounded-lg bg-amber-400 text-black font-bold px-2 py-1 text-sm mb-3">COUPON</div>
                <ScanLine className="h-12 w-12 text-amber-500" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            <Button variant="secondary" onClick={()=>setCouponScanOpen(false)}>취소</Button>
            <Button className="bg-amber-400 hover:bg-amber-500 text-black font-bold" onClick={()=>{ setCouponScanOpen(false); setStep(2); setPointsOpen(true); setAfterCouponGoPay(false); }}>쿠폰없음</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pointsOpen} onOpenChange={(o)=>{ setPointsOpen(o); if(!o && step===2) setStep(1); }}>
        <DialogContent className="max-w-5xl">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="rounded-2xl bg-neutral-50 p-6 h-full flex flex-col justify-between">
                <div className="text-xl font-extrabold leading-snug text-neutral-900">신세계포인트<br/>적립·사용을 위해<br/>조회 방법을 선택해 주세요</div>
                <Button variant="secondary" onClick={()=>{ setPointsOpen(false); setStep(1); }}>이전 단계</Button>
              </div>
            </div>
            <div className="col-span-8">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={()=>{ setPointsMethod("phone"); setPhoneInput(""); setPhoneError(""); }} className={`rounded-2xl border p-6 text-left hover:shadow ${pointsMethod==='phone' ? 'ring-2 ring-amber-400' : ''}`}>
                  <div className="flex items-center gap-3"><Phone className="h-6 w-6 text-amber-500"/><div className="font-semibold">휴대폰 번호 입력</div></div>
                </button>
                <button onClick={()=>{ setPointsMethod("barcode"); setPointBarcodeVal(""); }} className={`rounded-2xl border p-6 text-left hover:shadow ${pointsMethod==='barcode' ? 'ring-2 ring-amber-400' : ''}`}>
                  <div className="flex items-center gap-3"><Barcode className="h-6 w-6 text-amber-500"/><div className="font-semibold">바코드 스캔</div></div>
                </button>
                <button onClick={()=>{ setPointsMethod("sensing"); }} className={`rounded-2xl border p-6 text-left hover:shadow ${pointsMethod==='sensing' ? 'ring-2 ring-amber-400' : ''}`}>
                  <div className="flex items-center gap-3"><Contact2 className="h-6 w-6 text-amber-500"/><div className="font-semibold">포인트 카드 센싱</div></div>
                </button>
                <button onClick={()=>{ setPointsMethod("credit"); }} className={`rounded-2xl border p-6 text-left hover:shadow ${pointsMethod==='credit' ? 'ring-2 ring-amber-400' : ''}`}>
                  <div className="flex items-center gap-3"><CreditCard className="h-6 w-6 text-amber-500"/><div className="font-semibold">신세계포인트 제휴 신용카드</div></div>
                </button>
              </div>

              {pointsMethod === "phone" && (
                <div className="mt-6 rounded-xl border p-4">
                  <Label className="text-sm">휴대폰 번호</Label>
                  <div className="mt-2 flex gap-2">
                    <Input ref={phoneRef} value={phoneInput} onChange={(e)=>setPhoneInput(digitsOnly(e.target.value).slice(0,11))} placeholder="예: 01012345678" inputMode="numeric" className="h-10" />
                    <Button onClick={()=>{ if (!validPhone(phoneInput)) { setPhoneError("번호 형식이 올바르지 않습니다"); return; } setMembership(phoneInput); proceedToPayment(); }}>적립하기</Button>
                  </div>
                  {phoneError && <div className="mt-2 text-sm text-red-600">{phoneError}</div>}
                </div>
              )}

              {pointsMethod === "barcode" && (
                <div className="mt-6 rounded-xl border p-4">
                  <div className="text-sm text-neutral-600">포인트 카드 바코드를 스캐너로 읽혀주세요. (자동 포커스 유지)</div>
                  <form onSubmit={(e)=>{ e.preventDefault(); if (!pointBarcodeVal) return; setMembership(`BAR:${pointBarcodeVal}`); proceedToPayment(); }} className="sr-only">
                    <Input ref={pointBarcodeRef} value={pointBarcodeVal} onChange={(e)=>setPointBarcodeVal(e.target.value)} placeholder="스캔 대기" />
                  </form>
                </div>
              )}

              {pointsMethod === "sensing" && (
                <div className="mt-6 rounded-xl border p-4">
                  <div className="text-sm text-neutral-600">포인트 카드를 센싱 영역에 접촉해 주세요. (시뮬레이션)</div>
                  <Button className="mt-3" onClick={()=>{ setMembership("CARD-SENSE"); proceedToPayment(); }}>인식됨 · 적립하기</Button>
                </div>
              )}

              {pointsMethod === "credit" && (
                <div className="mt-6 rounded-xl border p-4">
                  <div className="text-sm text-neutral-600">제휴 신용카드를 태깅/삽입해 주세요. (시뮬레이션)</div>
                  <Button className="mt-3" onClick={()=>{ setMembership("COBRANDED-CC"); proceedToPayment(); }}>인식됨 · 적립하기</Button>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="secondary" onClick={()=>proceedToPayment()}>적립 안 함</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={payPanelOpen} onOpenChange={(o)=>{ setPayPanelOpen(o); if(!o && step===3) setStep(1); }}>
        <DialogContent className="max-w-5xl">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="rounded-2xl bg-neutral-50 p-6 h-full flex flex-col justify-between">
                <div className="text-xl font-extrabold leading-snug text-neutral-900">{krw(total)}을<br/>결제하실 방법을<br/>선택해 주세요</div>
                <Button variant="secondary" onClick={()=>{ setPayPanelOpen(false); setStep(2); setPointsOpen(true); }}>이전 단계</Button>
              </div>
            </div>
            <div className="col-span-8">
              <div className="mb-4 flex gap-3">
                <button onClick={()=>setPaymentTab('card')} className={`rounded-xl px-4 py-2 font-semibold ${paymentTab==='card' ? 'bg-amber-400 text-black' : 'bg-neutral-100 text-neutral-700'}`}>카드·기프티콘</button>
                <button onClick={()=>setPaymentTab('mobile')} className={`rounded-xl px-4 py-2 font-semibold ${paymentTab==='mobile' ? 'bg-amber-400 text-black' : 'bg-neutral-100 text-neutral-700'}`}>모바일결제</button>
              </div>

              {paymentTab==='card' && (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={()=>{ setPayPanelOpen(false); setCardInsertOpen(true); }} className="rounded-2xl border p-6 text-left hover:shadow"><div className="flex items-center gap-3"><CreditCard className="h-6 w-6 text-amber-500"/><div className="font-semibold">신용·체크카드</div></div></button>
                    <button onClick={()=>simulatePay('이마트콘·기프티콘')} className="rounded-2xl border p-6 text-left hover:shadow"><div className="flex items-center gap-3"><Gift className="h-6 w-6 text-amber-500"/><div className="font-semibold">이마트콘·기프티콘</div></div></button>
                    <button onClick={()=>simulatePay('현금IC카드')} className="rounded-2xl border p-6 text-left hover:shadow"><div className="flex items-center gap-3"><Wallet className="h-6 w-6 text-amber-500"/><div className="font-semibold">현금IC카드</div></div></button>
                    <button onClick={()=>simulatePay('온누리 카드')} className="rounded-2xl border p-6 text-left hover:shadow"><div className="flex items-center gap-3"><IdCard className="h-6 w-6 text-amber-500"/><div className="font-semibold">온누리 카드</div></div></button>
                  </div>
                  <div className="mt-3 text-xs text-neutral-500">삼성페이는 <b>모바일 결제</b> 탭에서 선택해 주세요.</div>
                </div>
              )}

              {paymentTab==='mobile' && (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={()=>simulatePay('삼성페이')} className="rounded-2xl border p-6 text-left hover:shadow"><div className="flex items-center gap-3"><Smartphone className="h-6 w-6 text-amber-500"/><div className="font-semibold">삼성페이</div></div></button>
                    <button onClick={()=>simulatePay('네이버페이')} className="rounded-2xl border p-6 text-left hover:shadow"><div className="flex items-center gap-3"><Smartphone className="h-6 w-6 text-amber-500"/><div className="font-semibold">네이버페이</div></div></button>
                    <button onClick={()=>simulatePay('카카오페이')} className="rounded-2xl border p-6 text-left hover:shadow"><div className="flex items-center gap-3"><Smartphone className="h-6 w-6 text-amber-500"/><div className="font-semibold">카카오페이</div></div></button>
                    <button onClick={()=>simulatePay('애플페이')} className="rounded-2xl border p-6 text-left hover:shadow"><div className="flex items-center gap-3"><Smartphone className="h-6 w-6 text-amber-500"/><div className="font-semibold">애플페이</div></div></button>
                  </div>
                  <div className="mt-3 text-xs text-neutral-500">실제 결제는 발생하지 않습니다 (교육용 시뮬레이션).</div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>결제 수단 선택</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Button className="h-20" onClick={() => simulatePay("신용/체크카드")}><CreditCard className="mr-2 h-5 w-5" />카드</Button>
            <Button className="h-20" onClick={() => simulatePay("간편결제(삼성/네이버/카카오)")}><Smartphone className="mr-2 h-5 w-5" />간편결제</Button>
            <Button className="h-20" onClick={() => simulatePay("현금")}><Wallet className="mr-2 h-5 w-5" />현금</Button>
          </div>
          <DialogFooter><div className="text-right text-sm text-neutral-500 w-full">결제 시 실제 청구는 발생하지 않습니다 (교육용)</div></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cardInsertOpen} onOpenChange={(o)=>{ setCardInsertOpen(o); if(!o) setCardInsertProgress(0); }}>
        <DialogContent className="max-w-5xl">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="rounded-2xl bg-neutral-50 p-6 h-full flex flex-col justify-between">
                <div className="text-xl font-extrabold leading-snug text-neutral-900">카드를<br/>카드 투입구 끝까지<br/>밀어 넣으세요</div>
                <Button variant="secondary" onClick={()=>{ setCardInsertOpen(false); setPayPanelOpen(true); }}>이전 단계</Button>
              </div>
            </div>
            <div className="col-span-8 flex items-center justify-center">
              <div className="relative w-[520px] h-[320px]">
                <div className="absolute left-1/2 -translate-x-1/2 top-8 w-[360px] h-[72px] rounded-2xl bg-neutral-800 text-white flex items-center justify-between px-4 shadow-inner">
                  <div className="text-sm opacity-80">카드 넣는 곳</div>
                  <div className="h-3 w-3 rounded-full bg-emerald-400"/>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `${190 - 110 * (cardInsertProgress/100)}px` }}>
                  <div className="w-[240px] h-[150px] rounded-lg border bg-white shadow-md relative">
                    <div className="absolute left-4 top-5 w-10 h-8 bg-yellow-400 rounded-sm" />
                    <div className="absolute right-4 bottom-4 text-[11px] text-neutral-400">EMV</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter><div className="text-right text-sm text-neutral-500 w-full">카드를 끝까지 넣으면 자동으로 인식됩니다… {cardInsertProgress}%</div></DialogFooter>
        </DialogContent>
      </Dialog>

      {paid && (
        <div className="mx-auto mt-4 max-w-6xl">
          <div className="rounded-2xl shadow-sm border border-emerald-200">
            <div className="px-4 py-3 border-b"><div className="text-2xl font-bold">영수증 (교육용)</div></div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div className="rounded-xl border bg-white">
                    <div className="border-b p-4 text-sm text-neutral-600">이마트 · 셀프계산대</div>
                    <div className="divide-y">
                      {cart.map(it => (
                        <div key={it.product.barcode} className="flex items-center justify-between px-4 py-2 text-sm">
                          <div>
                            <div className="font-medium">{it.product.name}</div>
                            <div className="text-[11px] text-neutral-500">{it.product.barcode} · {it.qty}개 × {krw(it.product.price)}</div>
                          </div>
                          <div className="font-semibold">{krw(it.product.price * it.qty)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t p-4">
                      <div className="flex items-center justify-between text-sm text-neutral-600"><span>상품 합계</span><span>{krw(subtotal)}</span></div>
                      <div className="flex items-center justify-between text-sm text-neutral-600"><span>할인</span><span>- {krw(discount)}</span></div>
                      <div className="mt-2 flex items-center justify-between text-lg font-bold"><span>결제 금액</span><span>{krw(total)}</span></div>
                      <div className="mt-1 text-right text-xs text-neutral-500">(공급가액 {krw(Math.floor(total/1.1))} · 부가세 {krw(total - Math.floor(total/1.1))})</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border bg-white p-4">
                    <div className="text-sm text-neutral-600">결제 정보</div>
                    <div className="mt-1 font-semibold">{paymentInfo?.method}</div>
                    {paymentInfo?.last4 && (<div className="text-sm text-neutral-500">승인번호 ****{paymentInfo.last4}</div>)}
                  </div>
                  {membership && (
                    <div className="rounded-xl border bg-white p-4">
                      <div className="text-sm text-neutral-600">포인트 적립</div>
                      <div className="mt-1 font-semibold">{membership}</div>
                    </div>
                  )}
                  {couponApplied && (
                    <div className="rounded-xl border bg-white p-4">
                      <div className="text-sm text-neutral-600">쿠폰 적용</div>
                      <div className="mt-1 font-semibold">{couponApplied}</div>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button className="w-full h-12" onClick={resetAll}>새 거래 시작</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 