/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  CreditCard, 
  User, 
  Users, 
  Link as LinkIcon,
  AlertCircle,
  Sparkles,
  Target,
  Banknote,
  FileText,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { domToPng } from 'modern-screenshot';
import confetti from 'canvas-confetti';

// Types
interface InvoiceData {
  from: string;
  to: string;
  relation: string;
  amount: number;
  date: string;
  serial: string;
  terms?: string[];
  application?: string;
}

const RELATIONSHIPS = [
  'বড় ভাই', 'আপু', 'মামা', 'চাচা', 'দুলাভাই', 'খালামণি', 'ফুপি', 'ক্রাশ', 'বন্ধু', 'অন্যান্য'
];

const FUNNY_APPLICATIONS: Record<string, string> = {
  'বড় ভাই': 'সম্মানিত বড় ভাই, আপনার পকেট অনেক বড়, কিন্তু আমার পকেট একদম খালি। এই ঈদে আপনার পকেটের ভার একটু কমাতে চাই। বিনীত নিবেদন, কিছু সালামি দিয়ে ছোট ভাইয়ের মুখে হাসি ফোটান।',
  'আপু': 'প্রিয় আপু, দুলাভাই তো দিবেই, কিন্তু আপনার হাতের সালামি না পেলে ঈদের আনন্দই মাটি। আপনার জমানো টাকা থেকে সামান্য কিছু দান করে এই অভাগা ছোট ভাই/বোনকে ধন্য করুন।',
  'মামা': 'প্রিয় মামা, ভাগ্নে যখন বিপদে, মামা তখন পকেটে হাত দেয়! আমার পকেটে এখন মরুভূমির হাওয়া বইছে। এমতাবস্থায়, কিছু সালামি প্রদান করিয়া আপনার প্রিয় ভাগ্নেকে উদ্ধার করুন।',
  'চাচা': 'শ্রদ্ধেয় চাচা, আপনার ভাতিজা বড়ই অর্থকষ্টে দিনাতিপাত করিতেছে। আপনার অঢেল সম্পদ হইতে কিঞ্চিৎ সালামি প্রদান করিলে পরকালে নেকি হাসিল হইবে (হয়তো!)।',
  'দুলাভাই': 'প্রিয় দুলাভাই, আপুর কাছে তো অনেক খরচ করেন, শ্যালক/শ্যালিকার জন্য কি একটু মনটা বড় করা যায় না? সালামি না দিলে কিন্তু আপুর কাছে আপনার সব গোপন কথা বলে দেব!',
  'খালামণি': 'প্রিয় খালামণি, আপনার হাতের রান্না যেমন সেরা, আপনার সালামিও যেন তেমনই সেরা হয়। আপনার আদরের ভাগ্নে/ভাগ্নির পকেটটা একটু গরম করে দিন না!',
  'ফুপি': 'প্রিয় ফুপি, ফুপু মানেই তো বাড়তি আদর। সেই আদরের সাথে যদি কিছু কড়কড়ে নোট পাওয়া যেত, তবে ঈদের খুশি ডাবল হয়ে যেত। আপনার প্রিয় ভাতিজা/ভাতিজির আবদারটা রাখুন।',
  'ক্রাশ': 'প্রিয় ক্রাশ, আপনার হাসিতে আমি ফিদা, কিন্তু আপনার সালামিতে আমি আরও বেশি ফিদা হব। সালামি না দিলে কিন্তু আনফলো করে দেওয়ার কঠিন সিদ্ধান্ত নিতে বাধ্য হব!',
  'বন্ধু': 'দোস্ত, অনেক তো খাওয়ালি, এবার একটু সালামি দে। কৃপণতা ছাড়, পকেট বের কর। সালামি না দিলে ঈদের দিন তোর বাসায় গিয়ে সব বিরিয়ানি একাই খেয়ে ফেলব!',
  'অন্যান্য': 'বিনীত নিবেদন এই যে, আমি আপনার অতি আদরের একজন মানুষ। বর্তমানে আমার পকেটে তীব্র অর্থসংকট চলিতেছে। এমতাবস্থায়, কিছু সালামি প্রদান করিয়া আমার পকেটকে সজীব করার আকুল আবেদন জানাচ্ছি।'
};

const FUNNY_TERMS = [
  'কোনো শর্ত নেই',
  'বিকাশ বা নগদে টাকা না পাঠালে ঈদের দিন আপনার বাসায় গিয়ে সব সেমাই খেয়ে ফেলা হবে।',
  'টাকা না দিলে আপনার সব গোপন কথা সবার কাছে ফাঁস করে দেওয়া হবে।',
  'এই ইনভয়েসটি পাওয়ার ২৪ ঘণ্টার মধ্যে পেমেন্ট না করলে পরবর্তী ঈদে সালামি ডাবল হয়ে যাবে।',
  'সালামি না দিলে আপনার ক্রাশের সাথে আপনার বিয়ে হবে না (গ্যারান্টিড)।',
  'সালামি না দিলে ঈদের দিন আপনার সাথে কোনো সেলফি তোলা হবে না।',
  'এই ইনভয়েসটি ইগনোর করলে আপনার কপালে সারা বছর সিঙ্গেল থাকা নিশ্চিত।',
  'সালামি না দিলে আপনার পছন্দের বিরিয়ানির প্যাকেট আমি খেয়ে ফেলব।',
  'সালামি না দিলে আপনার ফোনের চার্জার চুরি করে নিয়ে যাব।',
  'টাকা না দিলে আপনার ফেসবুক প্রোফাইল হ্যাক করার হুমকি দেওয়া হলো (মজা করছি)।'
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export default function App() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    relation: RELATIONSHIPS[0],
    otherRelation: '',
    selectedTerms: [] as string[],
    customAmount: '',
    customApplication: ''
  });
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Check for URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathName = window.location.pathname.substring(1); // Remove leading slash
    const decodedPathName = pathName ? decodeURIComponent(pathName) : null;
    
    const from = params.get('from');
    const to = decodedPathName || params.get('to');
    const relation = params.get('relation');
    const amount = params.get('amount');
    const date = params.get('date');
    const serial = params.get('serial');
    const terms = params.get('terms');
    const application = params.get('app');

    if (from && to && relation && amount) {
      setInvoice({
        from,
        to,
        relation,
        amount: parseInt(amount),
        date: date || new Date().toLocaleDateString('bn-BD'),
        serial: serial || `SL-${Math.floor(100000 + Math.random() * 900000)}`,
        terms: terms ? JSON.parse(decodeURIComponent(terms)) : undefined,
        application: application || undefined
      });
      setIsSharedView(true);
    }
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from || !formData.to) return;

    // Additional validation
    if (formData.customAmount && (parseInt(formData.customAmount) <= 0 || isNaN(parseInt(formData.customAmount)))) {
      alert('দয়া করে একটি সঠিক পজিটিভ সংখ্যা লিখুন।');
      return;
    }

    setIsGenerating(true);
    
    // Simulate a small delay for "generating" effect
    setTimeout(() => {
      const finalAmount = formData.customAmount 
        ? parseInt(formData.customAmount) 
        : QUICK_AMOUNTS[Math.floor(Math.random() * QUICK_AMOUNTS.length)];

      const finalRelation = formData.relation === 'অন্যান্য' 
        ? (formData.otherRelation || 'অন্যান্য') 
        : formData.relation;

      const newInvoice: InvoiceData = {
        from: formData.from,
        to: formData.to,
        relation: finalRelation,
        amount: finalAmount,
        date: new Date().toLocaleDateString('bn-BD'),
        serial: `SL-${Math.floor(100000 + Math.random() * 900000)}`,
        terms: formData.selectedTerms.length > 0 ? formData.selectedTerms : undefined,
        application: formData.customApplication.trim() || (FUNNY_APPLICATIONS[formData.relation] || FUNNY_APPLICATIONS['অন্যান্য'])
      };

      setInvoice(newInvoice);
      setIsGenerating(false);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FCD34D', '#F59E0B', '#EF4444', '#10B981']
      });
    }, 800);
  };

  const copyLink = () => {
    if (!invoice) return;
    const params = new URLSearchParams({
      from: invoice.from,
      // 'to' is now in the path, but we keep it in params as fallback
      to: invoice.to,
      relation: invoice.relation,
      amount: invoice.amount.toString(),
      date: invoice.date,
      serial: invoice.serial,
      ...(invoice.terms && { terms: encodeURIComponent(JSON.stringify(invoice.terms)) }),
      ...(invoice.application && { app: invoice.application })
    });
    
    // Create personalized path: origin/RecipientName
    const personalizedPath = `/${encodeURIComponent(invoice.to)}`;
    const url = `${window.location.origin}${personalizedPath}?${params.toString()}`;
    
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadImage = async () => {
    if (!invoiceRef.current) return;
    try {
      const dataUrl = await domToPng(invoiceRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `salami-invoice-${invoice?.from}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  const reset = () => {
    setInvoice(null);
    setFormData({ from: '', to: '', relation: RELATIONSHIPS[0], otherRelation: '', selectedTerms: [], customAmount: '', customApplication: '' });
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-100 p-4 md:p-8 selection:bg-amber-500/30 font-sans">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Stars */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-amber-200/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s infinite`
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        {!isSharedView && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                <div className="w-8 h-8 bg-[#0a192f] rounded-full translate-x-2" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-amber-400 leading-tight">
                ডিজিটাল সালামি<br />ইনভয়েস জেনারেটর
              </h1>
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                <div className="w-8 h-8 bg-[#0a192f] rounded-full translate-x-2" />
              </div>
            </div>
            
            <div className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-2 rounded-full shadow-lg">
              <span className="text-slate-900 font-black tracking-[0.2em] text-sm">EID-UL-FITR 2026</span>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!invoice ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#112240] border border-slate-800 rounded-[2rem] p-6 md:p-10 shadow-2xl max-w-lg mx-auto"
            >
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-bold text-amber-400 mb-2 ml-1 flex items-center gap-2">
                      <User size={18} className="text-blue-500" /> আপনার নাম
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={30}
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      className="w-full bg-[#1d2d44] border border-transparent rounded-xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-lg"
                      placeholder="আপনার নাম লিখুন..."
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-amber-400 mb-2 ml-1 flex items-center gap-2">
                      <Target size={18} className="text-red-500" /> কার কাছে সালামি চান?
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={30}
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      className="w-full bg-[#1d2d44] border border-transparent rounded-xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-lg"
                      placeholder="তার নাম লিখুন..."
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-amber-400 mb-2 ml-1 flex items-center gap-2">
                      <LinkIcon size={18} className="text-blue-400" /> সম্পর্ক
                    </label>
                    <div className="relative">
                      <select
                        value={formData.relation}
                        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                        className="w-full bg-[#1d2d44] border border-transparent rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-lg appearance-none cursor-pointer"
                      >
                        {RELATIONSHIPS.map((rel) => (
                          <option key={rel} value={rel} className="bg-[#112240]">{rel}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    
                    {/* Conditional Input for 'Others' */}
                    <AnimatePresence>
                      {formData.relation === 'অন্যান্য' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="overflow-hidden"
                        >
                          <input
                            required
                            type="text"
                            maxLength={20}
                            value={formData.otherRelation}
                            onChange={(e) => setFormData({ ...formData, otherRelation: e.target.value })}
                            className="w-full bg-[#1d2d44] border border-amber-500/30 rounded-xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-lg"
                            placeholder="সম্পর্কটি লিখুন..."
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-amber-400 mb-2 ml-1 flex items-center gap-2">
                      <Sparkles size={18} className="text-purple-400" /> আপনার বিশেষ বার্তা (ঐচ্ছিক)
                    </label>
                    <textarea
                      value={formData.customApplication}
                      onChange={(e) => setFormData({ ...formData, customApplication: e.target.value })}
                      className="w-full bg-[#1d2d44] border border-transparent rounded-xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-lg resize-none h-24"
                      placeholder="এখানে আপনার নিজের কোনো মজার মেসেজ লিখতে পারেন... (খালি রাখলে অটোমেটিক মেসেজ সেট হবে)"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-amber-400 mb-3 ml-1 flex items-center gap-2">
                      <AlertCircle size={18} className="text-orange-400" /> বিশেষ শর্তাবলি (একাধিক সিলেক্ট করতে পারেন)
                    </label>
                    <div className="grid gap-2 max-h-48 overflow-y-auto p-2 bg-[#1d2d44] rounded-xl border border-slate-800 custom-scrollbar">
                      {FUNNY_TERMS.slice(1).map((term) => (
                        <label 
                          key={term} 
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                            formData.selectedTerms.includes(term) 
                              ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' 
                              : 'bg-[#112240]/50 border-transparent text-slate-400 hover:bg-[#112240]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-800"
                            checked={formData.selectedTerms.includes(term)}
                            onChange={(e) => {
                              const newTerms = e.target.checked
                                ? [...formData.selectedTerms, term]
                                : formData.selectedTerms.filter(t => t !== term);
                              setFormData({ ...formData, selectedTerms: newTerms });
                            }}
                          />
                          <span className="text-xs font-medium leading-relaxed">{term}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-amber-400 mb-2 ml-1 flex items-center gap-2">
                      <Banknote size={18} className="text-yellow-500" /> সালামির পরিমাণ (টাকা)
                    </label>
                    <div className="relative mb-4">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-xl">৳</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        onKeyDown={(e) => {
                          if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        value={formData.customAmount}
                        onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                        className="w-full bg-[#1d2d44] border border-transparent rounded-xl pl-10 pr-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-lg"
                        placeholder="কত টাকা চান?"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {QUICK_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setFormData({ ...formData, customAmount: amt.toString() })}
                          className={`py-2 px-1 rounded-lg border border-slate-700 text-xs font-bold transition-all ${
                            formData.customAmount === amt.toString() 
                            ? 'bg-amber-500 text-slate-900 border-amber-500' 
                            : 'bg-[#1d2d44] text-slate-400 hover:border-amber-500/50'
                          }`}
                        >
                          ৳{amt.toLocaleString('bn-BD')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-[#1d2d44] hover:bg-[#233554] text-slate-300 font-bold py-5 rounded-xl transition-all flex items-center justify-center gap-3 text-xl disabled:opacity-70"
                >
                  {isGenerating ? (
                    <RefreshCw className="animate-spin" size={24} />
                  ) : (
                    <FileText size={24} className="text-blue-400" />
                  )}
                  {isGenerating ? 'তৈরি হচ্ছে...' : 'ইনভয়েস জেনারেট করুন'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="invoice"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Invoice Card */}
              <div 
                ref={invoiceRef}
                className="bg-white text-slate-900 rounded-[2.5rem] p-8 md:p-14 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden max-w-2xl mx-auto border-[12px] border-slate-50"
              >
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-bl-full -mr-10 -mt-10 opacity-50" />
                
                {/* Unpaid Stamp */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[25deg] opacity-[0.08] pointer-events-none select-none">
                  <span className="text-[10rem] md:text-[14rem] font-black border-[16px] border-red-600 text-red-600 px-12 py-6 rounded-[3rem]">
                    UNPAID
                  </span>
                </div>

                <div className="flex justify-between items-start mb-12 relative">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">SALAMI RECEIPT</h2>
                    <p className="text-slate-400 font-mono text-sm font-bold">NO: {invoice.serial}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">ইস্যু তারিখ</p>
                    <p className="font-extrabold text-lg">{invoice.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12 relative">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">প্রেরক (আবেদনকারী)</p>
                    <p className="text-2xl font-black text-slate-800">{invoice.from}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">প্রাপক (সালামি দাতা)</p>
                    <p className="text-2xl font-black text-slate-800">{invoice.to}</p>
                    <p className="text-sm font-bold text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full">{invoice.relation}</p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-3xl p-8 mb-10 relative shadow-inner">
                  <div className="flex justify-between items-center mb-6 opacity-50 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span>বিবরণ</span>
                    <span>মোট পরিমাণ</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-lg font-bold block">ঈদুল ফিতর সালামি ২০২৬</span>
                      <span className="text-xs text-slate-400">ডিজিটাল পেমেন্ট রিকোয়েস্ট</span>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl md:text-5xl font-black text-amber-400 leading-none">
                        ৳{invoice.amount.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  </div>
                </div>

                {invoice.application && (
                  <div className="mb-10 p-6 bg-amber-50 rounded-3xl border-2 border-dashed border-amber-200 relative">
                    <div className="absolute -top-3 left-6 bg-white px-3 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                      ঈদ মোবারক
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed italic font-medium">
                      "{invoice.application}"
                    </p>
                  </div>
                )}

                {invoice.terms && invoice.terms.length > 0 && (
                  <div className="space-y-4 mb-12 relative">
                    <h3 className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                      <AlertCircle size={14} className="text-orange-500" /> বিশেষ শর্তাবলি:
                    </h3>
                    <div className="grid gap-3">
                      {invoice.terms.map((term, i) => (
                        <div key={i} className="flex gap-3 text-xs text-slate-500 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-amber-500 font-bold">{i + 1}.</span>
                          <p>{term}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center pt-8 border-t-2 border-slate-100 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4">
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 italic">ডিজিটাল সিগনেচার: {invoice.from}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row justify-center gap-4 max-w-2xl mx-auto">
                {!isSharedView && (
                  <button
                    onClick={copyLink}
                    className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                    {isCopied ? <CheckCircle2 size={22} className="text-emerald-400" /> : <Share2 size={22} className="text-amber-400" />}
                    {isCopied ? 'লিঙ্ক কপি হয়েছে!' : 'শেয়ার লিঙ্ক কপি করুন'}
                  </button>
                )}
                
                <button
                  onClick={downloadImage}
                  className={`flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-900/20 ${isSharedView ? 'max-w-md mx-auto w-full' : ''}`}
                >
                  <Download size={22} /> ছবি হিসেবে সেভ করুন
                </button>
              </div>

              {!isSharedView && (
                <div className="flex justify-center">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-sm bg-slate-900/30 px-6 py-3 rounded-full border border-slate-800"
                  >
                    <RefreshCw size={16} /> নতুন ইনভয়েস তৈরি করুন
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {!isSharedView && (
          <footer className="mt-20 pb-10 text-center">
            <p className="text-slate-600 text-sm font-bold tracking-widest uppercase">
              EID MUBARAK | সালামি ইনভয়েস © ২০২৬
            </p>
          </footer>
        )}
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #112240;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fbbf24;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
