import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Mountain, RefreshCw, Compass } from 'lucide-react';
import { fetchValparaiWeather, ValparaiWeather } from '../services/valparaiWeatherService';

interface ValparaiWeatherWidgetProps {
    compact?: boolean;
    className?: string;
}

export const ValparaiWeatherWidget: React.FC<ValparaiWeatherWidgetProps> = ({
    compact = false,
    className = ''
}) => {
    const [weather, setWeather] = useState<ValparaiWeather | null>(null);
    const [loading, setLoading] = useState(true);

    const loadWeather = async () => {
        setLoading(true);
        try {
            const data = await fetchValparaiWeather();
            setWeather(data);
        } catch {
            // Handled in service fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWeather();
    }, []);

    const renderIcon = (type?: ValparaiWeather['iconType'], size: number = 20) => {
        switch (type) {
            case 'sun':
                return <Sun size={size} className="text-amber-400" />;
            case 'cloud':
                return <Cloud size={size} className="text-slate-300" />;
            case 'rain':
            case 'cloud-rain':
                return <CloudRain size={size} className="text-sky-400" />;
            case 'storm':
                return <CloudLightning size={size} className="text-purple-400" />;
            case 'mist':
            default:
                return <Wind size={size} className="text-teal-300" />;
        }
    };

    if (compact) {
        return (
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#17130f]/80 border border-emerald-500/30 text-xs text-[#ede6d6] shadow-sm backdrop-blur-md ${className}`}>
                {renderIcon(weather?.iconType, 14)}
                {loading ? (
                    <span className="text-xs text-slate-400 animate-pulse">Valparai...</span>
                ) : weather ? (
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-emerald-400 font-bold">{weather.temperature}°C</span>
                        <span className="text-slate-400 text-[11px] hidden sm:inline">· {weather.condition}</span>
                        <span className="text-[10px] text-[#a5927a]">Valparai</span>
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#131b17] via-[#0f1412] to-[#0d100e] border border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden text-[#ede6d6] ${className}`}
        >
            {/* Top emerald accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

            {/* Ambient Mountain Mist Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
                        {renderIcon(weather?.iconType, 22)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] tracking-widest text-emerald-400 font-black uppercase">
                                Live Western Ghats Station
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <h4 className="font-serif text-xl font-bold text-white tracking-wide">
                            Valparai Hill Weather
                        </h4>
                    </div>
                </div>

                <button
                    onClick={loadWeather}
                    title="Refresh Live Weather"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Refresh Valparai Weather"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin mb-1" />
                    <span>Measuring Valparai mountain atmosphere...</span>
                </div>
            ) : weather ? (
                <div className="space-y-4">
                    {/* Primary Temp & Condition Banner */}
                    <div className="p-4 rounded-2xl bg-[#0b0e0c]/80 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl sm:text-5xl font-black font-sans text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white">
                                {weather.temperature}°C
                            </span>
                            <div>
                                <span className="text-base sm:text-lg font-bold text-white block">
                                    {weather.condition}
                                </span>
                                <span className="text-xs text-emerald-300/80 font-medium">
                                    {weather.conditionTamil}
                                </span>
                            </div>
                        </div>

                        {/* Station Elevation & Location Badge */}
                        <div className="sm:text-right sm:border-l sm:border-white/10 sm:pl-4 space-y-0.5">
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                                <Mountain size={14} className="text-emerald-400" />
                                <span>{weather.elevation}m Altitude</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                                7th Heaven of South India
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
                            <Wind size={16} className="text-teal-400 shrink-0" />
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Wind Speed</span>
                                <strong className="text-white font-bold">{weather.windspeed} km/h</strong>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
                            <Compass size={16} className="text-emerald-400 shrink-0" />
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sanctuary Station</span>
                                <strong className="text-emerald-300 font-bold">Pollachi Ghats</strong>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </motion.div>
    );
};
