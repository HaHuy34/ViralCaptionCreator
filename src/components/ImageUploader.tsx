import React, { useState, useRef, useEffect } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImageUploaderProps {
  onImageSelect: (base64: string | null) => void;
  selectedImage: string | null;
}

export function ImageUploader({ onImageSelect, selectedImage }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          e.preventDefault();
          handleFile(file);
        }
      } else if (e.clipboardData?.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              handleFile(file);
            }
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedImage ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer border-4 border-dashed rounded-3xl p-12
              flex flex-col items-center justify-center transition-all duration-300
              ${isDragging ? "border-brand bg-brand/5 scale-[1.02]" : "border-neutral-300 hover:border-black bg-white"}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              accept="image/*"
            />
            <div className="bg-neutral-100 p-6 rounded-full mb-6">
              <Upload className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2 text-center decoration-brand decoration-wavy underline-offset-4">Kéo thả ảnh vào đây</h3>
            <p className="text-neutral-500 text-center font-medium">
              Hoặc click để chọn / nhấn Ctrl + V để dán ảnh
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl overflow-hidden border-4 border-black brutal-shadow aspect-video bg-neutral-200"
          >
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => onImageSelect(null)}
              className="absolute top-4 right-4 bg-black text-white p-2 rounded-full hover:bg-brand transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-4 text-white flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-brand" />
              <span className="font-medium">Ảnh sản phẩm đã được tải lên</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
