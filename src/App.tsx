import { useState } from "react";
import { Header } from "./components/Header";
import { ImageUploader } from "./components/ImageUploader";
import { CaptionCard } from "./components/CaptionCard";
import { generateCaptions, CaptionOption } from "./services/geminiService";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2, RefreshCcw, AlertCircle, Sparkles } from "lucide-react";

export default function App() {
  const [productDescription, setProductDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productDescription && !selectedImage) {
      setError("Hãy chọn ảnh hoặc thêm mô tả sản phẩm nhé!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await generateCaptions(productDescription, selectedImage || undefined);
      setCaptions(results);
    } catch (err) {
      setError("Có lỗi xảy ra, thử lại xem sao bạn ơi!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProductDescription("");
    setSelectedImage(null);
    setCaptions([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-brand/30 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white border-4 border-black p-6 rounded-3xl brutal-shadow">
              <h2 className="text-2xl font-display font-black mb-4 uppercase flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">1</span>
                Sản phẩm là gì?
              </h2>
              
              <div className="space-y-4">
                <ImageUploader 
                  onImageSelect={setSelectedImage} 
                  selectedImage={selectedImage} 
                />
                
                <div className="space-y-2">
                  <label className="block font-mono text-xs font-bold uppercase text-neutral-500 ml-1">
                    Mô tả thêm (tùy chọn)
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Ví dụ: Giày Sneaker trắng basic, dễ phối đồ, đang có hot deal..."
                    className="w-full h-32 p-4 bg-neutral-50 border-2 border-neutral-200 rounded-2xl focus:border-black focus:ring-0 transition-all font-medium resize-none"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-brand font-bold bg-brand/10 p-3 rounded-xl border border-brand/20"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className={`
                    w-full py-4 rounded-2xl border-4 border-black font-display font-black text-xl uppercase tracking-tighter
                    flex items-center justify-center gap-2 transition-all
                    ${loading ? "bg-neutral-100 cursor-not-allowed" : "bg-brand text-white brutal-shadow-hover"}
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Đang "nặn" caption...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      Tạo Caption Viral
                    </>
                  )}
                </button>
              </div>
            </div>

            {captions.length > 0 && (
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl border-2 border-black font-display font-bold text-lg uppercase flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all"
              >
                <RefreshCcw className="w-5 h-5" />
                Làm lại từ đầu
              </button>
            )}
          </section>

          {/* Results Section */}
          <section className="lg:col-span-7">
            <div className="bg-white/50 border-4 border-black border-dashed rounded-3xl p-6 min-h-[500px]">
              <h2 className="text-2xl font-display font-black mb-6 uppercase flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">2</span>
                Gợi ý cho bạn
              </h2>

              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {captions.length > 0 ? (
                    captions.map((opt, idx) => (
                      <CaptionCard
                        key={idx}
                        index={idx}
                        headline={opt.headline}
                        description={opt.description}
                      />
                    ))
                  ) : !loading ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-24 text-neutral-400 space-y-4"
                    >
                      <div className="w-24 h-24 rounded-full border-4 border-neutral-100 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 opacity-20" />
                      </div>
                      <p className="font-medium text-lg">Caption viral của bạn sẽ hiện ở đây!</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-neutral-100 border-2 border-neutral-200 h-32 rounded-2xl" />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

