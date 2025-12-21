import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  IdCard, 
  User, 
  CloudUpload, 
  RotateCcw, 
  ShieldCheck, 
  QrCode, 
  Church
} from 'lucide-react';
import { Button } from './Button';
import { MemberData } from '../types';

export const EntrustCardGenerator: React.FC = () => {
  const [formData, setFormData] = useState<MemberData>({
    name: 'S. Shaveesh Jeshurun',
    email: 'shaveesh@example.com',
    dob: '1995-08-20',
    location: 'Valparai',
    gender: 'Male',
    bloodGroup: 'O+ve',
    memberSince: '2015',
    emergency: '9876543210',
    role: 'Media Team'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <header className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4"
          >
            <ShieldCheck size={14} /> Official Document Service
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-950 mb-4">Entrust Card Generation</h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-normal">Generate your official City of Truth Ministries Entrust Card. Identity verification is required for all active members.</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-brand-50 p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <User className="text-brand-600" size={24} />
              <h3 className="text-xl font-bold text-brand-950 font-serif">Member Details</h3>
            </div>

            <form className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-brand-400 hover:bg-brand-50/30 flex flex-col items-center justify-center p-8 text-center"
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-xl object-cover shadow-lg border-2 border-white" />
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 transition-colors mb-4">
                      <CloudUpload size={28} />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 font-normal">Upload member photo</p>
                  </>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-medium text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                  <input name="dob" value={formData.dob} onChange={handleInputChange} type="date" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Role</label>
                  <input name="role" value={formData.role} onChange={handleInputChange} type="text" className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all text-sm" placeholder="e.g. Media Team" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="secondary" className="flex-1 py-3.5 text-xs font-bold uppercase tracking-widest">
                  <RotateCcw size={16} /> Reset
                </Button>
                <Button type="button" variant="primary" className="flex-[2] py-3.5 text-xs font-bold uppercase tracking-widest" onClick={() => window.print()}>
                  <IdCard size={16} /> Verify & Print
                </Button>
              </div>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full sticky top-32">
              <div className="flex items-center justify-center gap-2 mb-6 text-brand-600 font-bold uppercase tracking-widest text-[10px]">
                <span className="w-6 h-px bg-brand-200"></span>
                Document Preview
                <span className="w-6 h-px bg-brand-200"></span>
              </div>

              <div className="id-card-visual relative w-[320px] h-[460px] bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-brand-100 mx-auto">
                <div className="bg-brand-950 px-5 py-4 flex items-center gap-3 text-white">
                  <div className="p-1.5 bg-brand-600 rounded-lg text-white border border-brand-400"><Church size={20} strokeWidth={2} /></div>
                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase leading-none mb-1">City of Truth Ministries</h4>
                    <p className="text-[10px] font-medium text-brand-300 leading-none">சத்திய நகரம் ஊழியங்கள்</p>
                  </div>
                </div>

                <div className="bg-brand-100 py-1.5 text-center">
                  <span className="text-[9px] font-bold text-brand-900 tracking-widest uppercase">அனுமதி அட்டை • ENTRUST CARD</span>
                </div>

                <div className="p-6 relative h-[360px]">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-brand-50 text-brand-700 px-2 py-1 rounded text-[8px] font-bold border border-brand-100">ID: COT-6585</div>
                    <div className="w-20 h-28 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shadow-sm relative z-10">
                      {photoPreview ? <img src={photoPreview} alt="Member" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={32} /></div>}
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Full Member Name</label>
                      <span className="block text-sm font-bold text-brand-950 uppercase tracking-tight">{formData.name || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-[7px] font-bold text-slate-400 uppercase">Birth Date</label><span className="block text-[10px] font-semibold text-slate-800 font-normal">{formData.dob || '—'}</span></div>
                      <div><label className="block text-[7px] font-bold text-slate-400 uppercase">Blood Group</label><span className="block text-[10px] font-semibold text-slate-800 font-normal">{formData.bloodGroup || '—'}</span></div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div className="text-[8px] font-serif text-slate-400 italic leading-snug">"இரவும் பகலும் இனையனோம்; <br />கர்த்தரின் அருள் என்றும்"</div>
                    <div className="p-1 bg-slate-50 border border-slate-100 rounded shadow-sm text-slate-800"><QrCode size={32} strokeWidth={1.5} /></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};