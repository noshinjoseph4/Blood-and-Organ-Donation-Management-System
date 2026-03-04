import { motion } from 'framer-motion';

const MatchScore = ({ score = 0, label = "Compatibility" }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s) => {
        if (s >= 80) return '#22c55e'; // green-500
        if (s >= 50) return '#eab308'; // yellow-500
        return '#ef4444'; // red-500
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                    />
                    <motion.circle
                        cx="48"
                        cy="48"
                        r={radius}
                        fill="transparent"
                        stroke={getColor(score)}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-slate-900">{score}%</span>
                </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
};

export default MatchScore;
