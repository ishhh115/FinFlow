const SectionCard = ({ title, subtitle, action, className = '', children, ...rest }) => {
    return (
        <section className={`rounded-[2rem] bg-white border border-slate-100 p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden group/section ${className}`} {...rest}>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none rounded-[2rem]"></div>
            <div className="relative z-10">
                {(title || subtitle || action) ? (
                    <div className="flex items-center justify-between gap-4 mb-8">
                        <div>
                            {title ? <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2> : null}
                            {subtitle ? <p className="text-sm font-bold text-slate-400 mt-1.5 uppercase tracking-wider">{subtitle}</p> : null}
                        </div>
                        {action ? <div>{action}</div> : null}
                    </div>
                ) : null}
                {children}
            </div>
        </section>
    );
};

export default SectionCard;
