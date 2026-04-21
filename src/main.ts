import './index.css';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// DOM Elements
const dropzone = document.getElementById('dropzone') as HTMLDivElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const previewContainer = document.getElementById('previewContainer') as HTMLDivElement;
const imagePreview = document.getElementById('imagePreview') as HTMLImageElement;
const removeImageBtn = document.getElementById('removeImageBtn') as HTMLButtonElement;
const descriptionInput = document.getElementById('descriptionInput') as HTMLTextAreaElement;
const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
const generateBtnText = document.getElementById('generateBtnText') as HTMLSpanElement;
const generateIcon = document.getElementById('generateIcon') as unknown as SVGElement;
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
const errorText = document.getElementById('errorText') as HTMLSpanElement;
const resultsContainer = document.getElementById('resultsContainer') as HTMLDivElement;
const resultsEmpty = document.getElementById('resultsEmpty') as HTMLDivElement;

let currentImageBase64: string | null = null;
let currentMimeType: string | null = null;

// --- Image Handling ---

function handleFile(file: File) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    currentImageBase64 = result.split(',')[1];
    currentMimeType = file.type;
    
    imagePreview.src = result;
    dropzone.classList.add('hidden');
    previewContainer.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) handleFile(file);
});

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('border-[#ff3b5c]', 'bg-[#ff3b5c]/5', 'scale-[1.02]');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('border-[#ff3b5c]', 'bg-[#ff3b5c]/5', 'scale-[1.02]');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('border-[#ff3b5c]', 'bg-[#ff3b5c]/5', 'scale-[1.02]');
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    handleFile(e.dataTransfer.files[0]);
  }
});

window.addEventListener('paste', (e) => {
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
});

removeImageBtn.addEventListener('click', () => {
  currentImageBase64 = null;
  currentMimeType = null;
  imagePreview.src = "";
  previewContainer.classList.add('hidden');
  dropzone.classList.remove('hidden');
  fileInput.value = "";
});

// --- Generation Logic ---

const defaultIcon = `<line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`;
const spinIcon = `<line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/>`;

generateBtn.addEventListener('click', async () => {
  const description = descriptionInput.value.trim();
  
  if (!description && !currentImageBase64) {
    showError("Hãy chọn ảnh hoặc thêm mô tả sản phẩm nhé!");
    return;
  }

  errorMessage.classList.add('hidden');
  setLoading(true);

  try {
    const captions = await generateCaptions(description, currentImageBase64, currentMimeType);
    renderCaptions(captions);
    resetBtn.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    showError("Có lỗi xảy ra, thử lại xem sao bạn ơi!");
  } finally {
    setLoading(false);
  }
});

function showError(msg: string) {
  errorText.textContent = msg;
  errorMessage.classList.remove('hidden');
}

function setLoading(isLoading: boolean) {
  if (isLoading) {
    generateBtn.disabled = true;
    generateBtn.classList.replace('bg-[#ff3b5c]', 'bg-neutral-100');
    generateBtn.classList.replace('text-white', 'text-neutral-500');
    generateBtn.classList.remove('brutal-shadow-hover');
    generateIcon.innerHTML = spinIcon;
    generateIcon.classList.add('animate-spin');
    generateBtnText.textContent = 'Đang "nặn" caption...';
    
    // Show pulse loading state
    resultsEmpty.classList.add('hidden');
    resultsContainer.innerHTML = '';
    for(let i=0; i<3; i++) {
        resultsContainer.innerHTML += `<div class="animate-pulse bg-neutral-100 border-2 border-neutral-200 h-32 rounded-2xl w-full"></div>`;
    }
  } else {
    generateBtn.disabled = false;
    generateBtn.classList.replace('bg-neutral-100', 'bg-[#ff3b5c]');
    generateBtn.classList.replace('text-neutral-500', 'text-white');
    generateBtn.classList.add('brutal-shadow-hover');
    generateIcon.innerHTML = defaultIcon;
    generateIcon.classList.remove('animate-spin');
    generateBtnText.textContent = 'Tạo Caption Viral';
  }
}

resetBtn.addEventListener('click', () => {
  currentImageBase64 = null;
  currentMimeType = null;
  imagePreview.src = "";
  previewContainer.classList.add('hidden');
  dropzone.classList.remove('hidden');
  fileInput.value = "";
  descriptionInput.value = "";
  resultsContainer.innerHTML = '';
  resultsContainer.appendChild(resultsEmpty);
  resultsEmpty.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  resetBtn.classList.add('hidden');
});

async function generateCaptions(desc: string, base64Data: string | null, mimeType: string | null) {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `Bạn là một content creator chuyên viết caption viral cho TikTok/Reels bán hàng tại Việt Nam.
Nhiệm vụ: Dựa trên hình ảnh hoặc mô tả sản phẩm, hãy tạo ra 5 option caption.
Yêu cầu phong cách:
- Giọng văn tự nhiên, như người thật nói.
- Hơi "lầy", bắt trend, relatable.
- Dùng từ đơn giản, không quá trang trọng.
- Ưu tiên so sánh thú vị (ví dụ: giá = 2 ly trà sữa, đẹp như crush, etc.).
- Dòng tiêu đề PHẢI VIẾT HOA và gây tò mò.
- Mô tả ngắn gọn (1-2 câu), có giải thích và twist hài hước.
- Tránh lặp lại, mỗi option mang một vibe khác nhau.`;

  const contents: any[] = [];
  
  if (base64Data && mimeType) {
    contents.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    });
  }

  contents.push({
    text: `Hãy tạo caption cho sản phẩm này: ${desc}`,
  });

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            description: { type: Type.STRING },
          },
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
}

const vibes = ["bg-[#ff3b5c]", "bg-[#00f2ea]", "bg-yellow-400", "bg-purple-500", "bg-green-400"];

function renderCaptions(captions: any[]) {
  resultsContainer.innerHTML = '';
  if (!captions || captions.length === 0) {
    resultsContainer.appendChild(resultsEmpty);
    resultsEmpty.classList.remove('hidden');
    return;
  }

  captions.forEach((cap, idx) => {
    const vibeClass = vibes[idx % vibes.length];
    const card = document.createElement('div');
    card.className = "group relative bg-white border-2 border-black rounded-2xl overflow-hidden brutal-shadow hover:-translate-y-1 transition-all";
    card.style.animation = `slideUp 0.3s ease-out ${idx * 0.1}s both`;
    
    card.innerHTML = `
      <div class="h-2 ${vibeClass}"></div>
      <div class="p-6">
        <div class="flex justify-between items-start gap-4 mb-4">
          <span class="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400">Option ${idx + 1}</span>
          <button class="copy-btn p-2 rounded-lg border-2 border-black transition-all bg-white hover:bg-neutral-100" data-text="${cap.headline}\\n${cap.description}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
        <h4 class="text-xl font-display font-black leading-tight mb-3 uppercase underline decoration-[#ff3b5c] decoration-4 group-hover:decoration-[#00f2ea] transition-all">${cap.headline}</h4>
        <p class="text-neutral-700 font-medium leading-relaxed">${cap.description}</p>
      </div>
      <div class="copy-toast absolute inset-0 bg-green-500/10 flex items-center justify-center backdrop-blur-[1px] pointer-events-none opacity-0 transition-opacity">
        <span class="bg-black text-white px-4 py-2 rounded-full font-bold text-sm brutal-shadow">Đã copy!</span>
      </div>
    `;
    
    const copyBtn = card.querySelector('.copy-btn') as HTMLButtonElement;
    const copyToast = card.querySelector('.copy-toast') as HTMLDivElement;
    
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(copyBtn.getAttribute('data-text') || '');
      copyBtn.classList.replace('bg-white', 'bg-green-100');
      copyBtn.classList.replace('hover:bg-neutral-100', 'bg-green-100');
      copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M20 6 9 17l-5-5"/></svg>`;
      copyToast.classList.remove('opacity-0');
      
      setTimeout(() => {
        copyBtn.classList.replace('bg-green-100', 'bg-white');
        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        copyToast.classList.add('opacity-0');
      }, 2000);
    });

    resultsContainer.appendChild(card);
  });
}
