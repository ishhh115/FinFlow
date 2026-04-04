import React from 'react';

const toneClasses = {
    default: 'text-slate-900',
    success: 'text-emerald-500',
    danger: 'text-rose-500',
    accent: 'text-teal-600',
};

const StatCard = ({ label, value, tone = 'default', icon: Icon }) => {
    return (
        <div className="group rounded-[2rem] bg-white border border-slate-200/60 p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-4 rounded-2xl shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 ease-out bg-slate-50 text-slate-800`}>
                    {Icon && <Icon size={24} strokeWidth={2.5} />}
                </div>
                <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-500 transition-colors duration-300">{label}</p>
                </div>
            </div>
            
            <div className="relative z-10 mt-auto pt-4">
                <p className={`text-4xl lg:text-5xl 2xl:text-6xl font-black tracking-tighter ${toneClasses[tone] || toneClasses.default} drop-shadow-sm`}>
                    {value}
                </p>
            </div>
            
            {/* Structural edge highlight */}
            <div className="absolute inset-x-0 bottom-0 h-1.5 opacity-20 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
            
            {/* Ambient Background Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
        </div>
    );
};

export default StatCard;
