import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion } from "motion/react";

interface CaptionCardProps {
  headline: string;
  description: string;
  index: number;
}

export const CaptionCard: React.FC<CaptionCardProps> = ({ headline, description, index }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `${headline}\n${description}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vibes = [
    "bg-brand",
    "bg-brand-cyan",
    "bg-yellow-400",
    "bg-purple-500",
    "bg-green-400"
  ];

  const currentVibe = vibes[index % vibes.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white border-2 border-black rounded-2xl overflow-hidden brutal-shadow hover:-translate-y-1 transition-all"
    >
      <div className={`h-2 ${currentVibe}`} />
      <div className="p-6">
        <div className="flex justify-between items-start gap-4 mb-4">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400">
            Option {index + 1}
          </span>
          <button
            onClick={copyToClipboard}
            className={`p-2 rounded-lg border-2 border-black transition-all ${copied ? "bg-green-100" : "bg-white hover:bg-neutral-100"}`}
          >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        
        <h4 className="text-xl font-display font-black leading-tight mb-3 uppercase underline decoration-brand decoration-4 group-hover:decoration-brand-cyan transition-all">
          {headline}
        </h4>
        <p className="text-neutral-700 font-medium leading-relaxed">
          {description}
        </p>
      </div>
      
      {copied && (
        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center backdrop-blur-[1px] pointer-events-none">
          <span className="bg-black text-white px-4 py-2 rounded-full font-bold text-sm brutal-shadow">
            Đã copy!
          </span>
        </div>
      )}
    </motion.div>
  );
}
