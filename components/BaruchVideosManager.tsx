import React, { useState, useEffect } from 'react';
import { Video, Save, Clock, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { api, BaruchVideo } from '../services/api';

const praiseDataNames = [
    { part: 1, name: "Aleph" },
    { part: 2, name: "Bet" },
    { part: 3, name: "Gimel" },
    { part: 4, name: "Dalet" },
    { part: 5, name: "Hey" },
    { part: 6, name: "Vav" },
    { part: 7, name: "Zayin" },
    { part: 8, name: "Chet" },
    { part: 9, name: "Tet" },
    { part: 10, name: "Yod" },
    { part: 11, name: "Kaf" },
    { part: 12, name: "Lamed" },
    { part: 13, name: "Mem" },
    { part: 14, name: "Nun" },
    { part: 15, name: "Samekh" },
    { part: 16, name: "Ayin" },
    { part: 17, name: "Pei" },
    { part: 18, name: "Tsade" },
    { part: 19, name: "Qoph" },
    { part: 20, name: "Resh" },
    { part: 21, name: "Shin" },
    { part: 22, name: "Tav" },
];

export const BaruchVideosManager: React.FC = () => {
    const [videos, setVideos] = useState<BaruchVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        setLoading(true);
        const data = await api.getBaruchVideos();
        // ensure we have 22 entries
        const completeData = Array.from({ length: 22 }, (_, i) => {
            const part = i + 1;
            const existing = data.find(v => v.part === part);
            return existing || { id: `baruch_${part}`, part, youtubeId: '' };
        });
        setVideos(completeData);
        setLoading(false);
    };

    const handleUpdate = (part: number, value: string) => {
        setVideos(prev => prev.map(v => v.part === part ? { ...v, youtubeId: value } : v));
    };

    const saveVideo = async (video: BaruchVideo) => {
        setSaving(video.id);
        
        // Extract ID if URL is pasted
        let parsedId = video.youtubeId.trim();
        if (parsedId.includes('youtube.com/watch?v=')) {
            parsedId = new URLSearchParams(parsedId.split('?')[1]).get('v') || parsedId;
        } else if (parsedId.includes('youtu.be/')) {
            parsedId = parsedId.split('youtu.be/')[1].split('?')[0];
        }

        const toSave = { ...video, youtubeId: parsedId };
        
        await api.updateBaruchVideo(toSave);
        
        // update local state to reflect extracted ID
        setVideos(prev => prev.map(v => v.id === video.id ? toSave : v));
        
        setTimeout(() => setSaving(null), 1000);
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading videos...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                <Video className="text-red-600" size={24} />
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Baruch Hashem Videos</h2>
                    <p className="text-sm text-slate-500">Manage YouTube video IDs for the 22 parts of Aathuma Nandri Baligal.</p>
                </div>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {videos.map((video) => {
                        const hasVideo = !!video.youtubeId;
                        const isSaving = saving === video.id;
                        
                        return (
                            <div key={video.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${hasVideo ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {video.part}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 leading-none">Part {video.part}</h3>
                                            <span className="text-xs text-slate-500">{praiseDataNames[video.part - 1].name}</span>
                                        </div>
                                    </div>
                                    {hasVideo ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            <CheckCircle size={12} /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                            <Clock size={12} /> Pending
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex flex-col gap-2 mt-auto">
                                    <label className="text-xs font-bold text-slate-500 uppercase">YouTube Video ID / URL</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={video.youtubeId}
                                            onChange={(e) => handleUpdate(video.part, e.target.value)}
                                            placeholder="e.g. dQw4w9WgXcQ" 
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                        />
                                        <Button 
                                            onClick={() => saveVideo(video)} 
                                            disabled={isSaving}
                                            className={`px-3 ${isSaving ? 'bg-green-600' : 'bg-brand-600 hover:bg-brand-700'} text-white rounded-lg transition-colors`}
                                        >
                                            {isSaving ? <CheckCircle size={18} /> : <Save size={18} />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
