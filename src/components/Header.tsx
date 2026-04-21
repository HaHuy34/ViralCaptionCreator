import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="py-12 border-b-2 border-black bg-white mb-8">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <div className="bg-brand p-3 rounded-full brutal-shadow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter uppercase">
            Viral <span className="text-brand">Caption</span> Creator
          </h1>
          <p className="text-xl md:text-2xl font-medium text-neutral-600 max-w-2xl">
            Biến sản phẩm của bạn thành những caption "triệu view" trên TikTok & Reels chỉ trong giây lát.
          </p>
        </motion.div>
      </div>
    </header>
  );
}
