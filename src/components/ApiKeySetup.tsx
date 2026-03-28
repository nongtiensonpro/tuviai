/**
 * ApiKeySetup.tsx — BYOK với hướng dẫn step-by-step và nút Test Key
 */
import React, { useState, useEffect } from 'react';
import { CryptoService } from '../services/CryptoService';
import { GoogleGenAI } from '@google/genai';

interface ApiKeySetupProps {
  onKeyReady: (decryptedKey: string, modelName: string) => void;
}

type KeyStatus = 'idle' | 'testing' | 'valid' | 'invalid';

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeyReady }) => {
  const [apiKey, setApiKey] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hasEncryptedKey, setHasEncryptedKey] = useState(false);
  const [mode, setMode] = useState<'setup' | 'unlock'>('unlock');
  const [keyStatus, setKeyStatus] = useState<KeyStatus>('idle');
  const [showGuide, setShowGuide] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-flash-latest');

  const models = [
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Khuyên dùng)', desc: 'Mạnh nhất, luận giải chuyên sâu' },
    { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash-Lite (Mini)', desc: 'Phiên bản rút gọn 3.1' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Khuyên dùng)', desc: 'Mạnh nhất, nhanh, giá rẻ' },
    { id: 'gemini-pro-latest', name: 'Gemini Pro (Mới nhất)', desc: 'Phiên Pro mới nhất' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash (Mới nhất)', desc: 'Phiên nhanh mới nhất' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Ổn định)', desc: 'Phiên bản Pro ổn định cao' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Tốc độ)', desc: 'Nhanh, phổ thông, ít lỗi API nhất' },
  ];

  useEffect(() => {
    const checkKey = CryptoService.hasStoredKey();
    setHasEncryptedKey(checkKey);
    setMode(checkKey ? 'unlock' : 'setup');

    // Load model preference
    const savedModel = localStorage.getItem('gemini_model_preference');
    if (savedModel) setSelectedModel(savedModel);
  }, []);

  const testApiKey = async (keyToTest: string) => {
    if (!keyToTest || keyToTest.length < 10) return;
    setKeyStatus('testing');
    try {
      const ai = new GoogleGenAI({ apiKey: keyToTest });
      await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'Hello',
        config: { maxOutputTokens: 5 }
      });
      setKeyStatus('valid');
    } catch {
      setKeyStatus('invalid');
    }
  };

  const checkAvailableModels = async (keyToTest: string) => {
    try {
      if (!keyToTest || keyToTest.length < 10) {
        alert("Vui lòng nhập API Key hợp lệ trước khi kiểm tra!");
        return;
      }
      console.log("Đang lấy danh sách model từ Google...");
      const ai = new GoogleGenAI({ apiKey: keyToTest });

      // Gọi API ListModels
      const response = await ai.models.list();
      const allModels = [];

      for await (const model of response) {
        const m = model as any;
        if (m.name) {
          allModels.push(m.name.replace('models/', ''));
        }
      }

      console.log("🔥 TẤT CẢ CÁC MODEL KHẢ DỤNG TỪ API KEY CỦA BẠN LÀ:");
      console.log(allModels.join('\n'));

      alert(`Đã in danh sách ${allModels.length} model ra Console (F12)!\nHãy kiểm tra và chọn chuỗi chính xác (vd: gemini-2.0-pro-exp...).`);

    } catch (err) {
      console.error("Lỗi khi lấy danh sách model:", err);
      alert("Có lỗi khi lấy danh sách, vui lòng kiểm tra lại API Key hoặc xem chi tiết trong Console.");
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !password) { setError('Vui lòng nhập đủ API Key và Mật khẩu.'); return; }
    if (password.length < 6) { setError('Mật khẩu bảo vệ cần ít nhất 6 ký tự.'); return; }
    try {
      const encrypted = await CryptoService.encrypt(apiKey, password);
      CryptoService.saveEncryptedKey(encrypted);
      localStorage.setItem('gemini_model_preference', selectedModel);
      setHasEncryptedKey(true);
      setError('');
      onKeyReady(apiKey, selectedModel);
    } catch {
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
      localStorage.setItem('gemini_model_preference', selectedModel); // Cập nhật lại nếu người dùng đổi model lúc unlock
      onKeyReady(decryptedKey, selectedModel);
    } catch {
      setError('Mật khẩu sai hoặc dữ liệu bị lỗi.');
    }
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn xóa cấu hình API cũ không?')) {
      CryptoService.clearStoredKey();
      setHasEncryptedKey(false);
      setMode('setup');
      setApiKey(''); setPassword(''); setError(''); setKeyStatus('idle');
    }
  };

  // --- Chỉ báo trạng thái Key ---
  const KeyStatusBadge = () => {
    if (keyStatus === 'testing') return <span className="text-xs text-yellow-400 animate-pulse">⏳ Đang kiểm tra...</span>;
    if (keyStatus === 'valid') return <span className="text-xs text-green-400">✅ Key hợp lệ</span>;
    if (keyStatus === 'invalid') return <span className="text-xs text-red-400">❌ Key không hợp lệ</span>;
    return null;
  };

  // --- Hướng dẫn lấy Key ---
  const GuidePanel = () => (
    <div className="mt-4 bg-indigo-950/40 border border-indigo-500/20 rounded-lg p-4 text-sm">
      <p className="font-semibold text-indigo-300 mb-3">📖 Cách lấy Gemini API Key miễn phí:</p>
      <ol className="space-y-2 text-white/70 list-none">
        {[
          { n: '1', text: 'Mở Google AI Studio:', link: 'https://aistudio.google.com/apikey', linkText: 'aistudio.google.com/apikey' },
          { n: '2', text: 'Đăng nhập bằng tài khoản Google của bạn.' },
          { n: '3', text: 'Nhấn nút "Create API Key" → Chọn dự án (hoặc tạo mới).' },
          { n: '4', text: 'Sao chép chuỗi key bắt đầu bằng "AIza..." và dán vào ô bên dưới.' },
        ].map((step) => (
          <li key={step.n} className="flex gap-2 items-start">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/50 text-indigo-300 text-xs flex items-center justify-center font-bold mt-0.5">{step.n}</span>
            <span>
              {step.text}{' '}
              {step.link && <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{step.linkText} →</a>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );

  // === MODE: UNLOCK (đã có key cũ) ===
  if (mode === 'unlock') {
    return (
      <div className="bg-gray-900/40 p-5 rounded-xl border border-gold/30">
        <h3 className="text-gold font-bold mb-2 flex items-center gap-2 text-base"><span>🔒</span> Mở Khóa Gemini AI</h3>
        <p className="text-xs text-white/50 mb-4">API Key của bạn đã được mã hóa an toàn. Nhập mật khẩu để kích hoạt.</p>

        <form onSubmit={handleUnlock} className="flex gap-2 items-start flex-wrap sm:flex-nowrap">
          <div className="flex-1 w-full sm:w-auto space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 uppercase font-bold px-1">Chọn Model</label>
              <select
                className="input !py-1 text-sm bg-black/60 border-white/20"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
              >
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <input type="password" placeholder="Mật khẩu cục bộ (6+ ký tự)"
                className="input w-full" value={password} onChange={e => setPassword(e.target.value)} />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-5">
            <button type="submit" className="btn-primary !py-2 whitespace-nowrap">Mở Khóa</button>
            <button type="button" onClick={handleReset} className="btn-secondary !py-1 whitespace-nowrap !border-red-800/50 text-red-300 hover:!bg-red-900/20 text-xs">Cài lại</button>
          </div>
        </form>
      </div>
    );
  }

  // === MODE: SETUP (chưa có key) ===
  return (
    <div className="bg-gray-900/40 p-5 rounded-xl border border-gold/30">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gold font-bold flex items-center gap-2 text-base"><span>🔑</span> Thiết Lập Gemini AI (BYOK)</h3>
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded transition-colors"
        >
          {showGuide ? 'Ẩn hướng dẫn ▲' : '📖 Cách lấy key ▼'}
        </button>
      </div>
      <p className="text-xs text-white/50 mb-4 leading-relaxed">
        Ứng dụng chạy 100% trên trình duyệt. Key sẽ được mã hóa <strong className="text-white/70">AES-GCM</strong> và chỉ lưu trên thiết bị của bạn — không gửi đi đâu cả.
      </p>

      {showGuide && <GuidePanel />}

      <form onSubmit={handleSetup} className="space-y-4 mt-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Google Gemini API Key</label>
            <KeyStatusBadge />
          </div>
          <div className="flex gap-2">
            <input type="password" placeholder="AIzaSy..."
              className="input flex-1 bg-black/40" value={apiKey}
              onChange={e => { setApiKey(e.target.value); setKeyStatus('idle'); }} />
            <button
              type="button"
              disabled={!apiKey || keyStatus === 'testing'}
              onClick={() => testApiKey(apiKey)}
              className="btn-secondary text-xs whitespace-nowrap !px-3 disabled:opacity-40"
            >
              🧪 Test
            </button>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Chọn Model AI</label>
            <button
              type="button"
              onClick={() => checkAvailableModels(apiKey)}
              disabled={!apiKey}
              className="text-[10px] bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 transition-colors disabled:opacity-30"
            >
              🔍 Xem model hỗ trợ
            </button>
          </div>
          <select
            className="input w-full bg-black/40"
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name} — {m.desc}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Mật Khẩu Bảo Vệ</label>
          <input type="password" placeholder="Ít nhất 6 ký tự — để mở khóa lần sau"
            className="input w-full bg-black/40" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button type="submit"
          className={`btn-primary w-full ${keyStatus === 'invalid' ? 'opacity-70' : ''}`}
          disabled={keyStatus === 'testing'}
        >
          {keyStatus === 'valid' ? '✅ Lưu & Kích Hoạt AI' : '🔐 Lưu & Kích Hoạt AI'}
        </button>
      </form>
    </div>
  );
};
