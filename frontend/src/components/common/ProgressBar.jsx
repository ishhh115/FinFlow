const ProgressBar = ({ value = 0, colorClass = 'bg-teal-600' }) => {
    return (
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
                className={`h-full ${colorClass}`}
                style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
            />
        </div>
    );
};

export default ProgressBar;
