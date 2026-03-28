/**
 * ApiKeySetup.tsx
 * Component hỗ trợ người dùng nhập và mã hóa API Key của họ.
 * Đây là chìa khóa của BYOK (Bring Your Own Key).
 */
import React, { useState, useEffect } from 'react';
import { CryptoService } from '../services/CryptoService';

interface ApiKeySetupProps {
  onKeyReady: (decryptedKey: string) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeyReady }) => {
  const [apiKey, setApiKey] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hasEncryptedKey, setHasEncryptedKey] = useState(false);
  const [mode, setMode] = useState<'setup' | 'unlock'>('unlock');

  useEffect(() => {
    const checkKey = CryptoService.hasStoredKey();
    setHasEncryptedKey(checkKey);
    setMode(checkKey ? 'unlock' : 'setup');
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !password) {
      setError('Vui lòng nhập đủ API Key và Mật khẩu.');
      return;
    }
    
    if (password.length < 6) {
      setError('Mật khẩu bảo vệ cần ít nhất 6 ký tự.');
      return;
    }

    try {
      const encrypted = await CryptoService.encrypt(apiKey, password);
      CryptoService.saveEncryptedKey(encrypted);
      
      setHasEncryptedKey(true);
      setError('');
      // Gửi raw key ra ngoài để dùng ngay lập tức
      onKeyReady(apiKey);
    } catch (err: any) {
      setError('Không thể mã hóa API Key.');
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const encrypted = CryptoService.getStoredKey();
      if (!encrypted) throw new Error('Không tìm thấy khóa.');

      const decryptedKey = await CryptoService.decrypt(encrypted, password);
      onKeyReady(decryptedKey);
    } catch (err: any) {
      setError('Mật khẩu sai hoặc file bảo mật bị lỗi.');
    }
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn xóa cấu hình API cũ không?')) {
      CryptoService.clearStoredKey();
      setHasEncryptedKey(false);
      setMode('setup');
      setApiKey('');
      setPassword('');
      setError('');
    }
  };

  if (mode === 'unlock') {
    return (
      <div className="bg-gray-900/40 p-5 rounded-lg border border-gold/30">
        <h3 className="text-gold font-bold mb-3 flex items-center gap-2">
          <span>🔒</span> Mở Khóa Gemini AI
        </h3>
        <p className="text-xs text-white/50 mb-4">
          Hệ thống phát hiện có một API Key đã được lưu trữ (Mã hóa an toàn). Hãy nhập mật khẩu bạn đã tạo để mở nó.
        </p>

        <form onSubmit={handleUnlock} className="flex gap-2 items-start">
          <div className="flex-1">
             <input 
               type="password" 
               placeholder="Mật khẩu cục bộ (6+ ký tự)"
               className="input w-full"
               value={password}
               onChange={e => setPassword(e.target.value)}
             />
             {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap !py-2.5">Mở Khóa</button>
          <button type="button" onClick={handleReset} className="btn-secondary !py-2.5 bg-red-900/30 text-red-300">Cài lại</button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 p-5 rounded-lg border border-gold/30">
       <h3 className="text-gold font-bold mb-3 flex items-center gap-2">
          <span>🔑</span> Thiết Lập AI (Bring Your Own Key)
       </h3>
       <p className="text-xs text-white/50 mb-4 leading-relaxed">
         Ứng dụng hoạt động 100% trên trình duyệt của bạn (Không có Backend). Để dùng AI, hãy lấy <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 hover:underline">Google AI Studio API Key</a> (Miễn phí). Key của bạn sẽ được mã hóa AES-GCM với một Mật Khẩu do bạn nghĩ ra, và chỉ lưu trên trình duyệt (localStorage).
       </p>

       <form onSubmit={handleSetup} className="space-y-3">
         <div>
            <label className="text-xs uppercase text-white/60 font-bold mb-1 block">Google Gemini API Key</label>
            <input 
               type="password" 
               placeholder="AIzaSy..."
               className="input w-full bg-black/40"
               value={apiKey}
               onChange={e => setApiKey(e.target.value)}
            />
         </div>
         <div>
            <label className="text-xs uppercase text-white/60 font-bold mb-1 block">Mật Khẩu Bảo Vệ Tự Chọn</label>
            <input 
               type="password" 
               placeholder="Dùng để mã hóa/mở khóa API trong tương lai"
               className="input w-full bg-black/40"
               value={password}
               onChange={e => setPassword(e.target.value)}
            />
         </div>
         
         {error && <p className="text-red-400 text-xs">{error}</p>}

         <button type="submit" className="btn-primary w-full shadow-lg shadow-gold/20">
            Lưu & Kích Hoạt AI
         </button>
       </form>
    </div>
  );
}
