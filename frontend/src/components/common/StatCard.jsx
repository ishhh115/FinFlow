import React from 'react';

const toneClasses = {
    default: 'text-slate-900',
    success: 'text-emerald-500',
    danger: 'text-rose-500',
    accent: 'text-teal-600',
};

const StatCard = ({ label, value, tone = 'default', icon: Icon }) => {
    return (
        <div className="bg-white rounded-[20px] p-[20px] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3.5 rounded-[14px] bg-slate-50 text-slate-800">
                    {Icon && <Icon size={20} strokeWidth={2.5} />}
                </div>
                <div className="text-right mt-1.5 line-clamp-1 truncate max-w-[60%]">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                </div>
            </div>
            
            <div className="mt-2 text-left">
                <p className={`text-3xl font-black tracking-tight ${toneClasses[tone] || toneClasses.default}`}>
                    {value}
                </p>
            </div>
        </div>
    );
};

export default StatCard;
