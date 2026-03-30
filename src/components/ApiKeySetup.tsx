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
    if (keyStatus === 'testing') return <span className="text-xs text-amber-300 animate-pulse">⏳ Đang kiểm tra...</span>;
    if (keyStatus === 'valid') return <span className="text-xs text-emerald-300">✅ Key hợp lệ</span>;
    if (keyStatus === 'invalid') return <span className="text-xs text-red-300">❌ Key không hợp lệ</span>;
    return null;
  };

  // --- Hướng dẫn lấy Key ---
  const GuidePanel = () => (
    <div className="mt-4 p-0 text-sm">
      <p className="font-semibold text-cyan mb-3">Cách lấy Gemini API Key miễn phí</p>
      <ol className="space-y-2 text-white/70 list-none">
        {[
          { n: '1', text: 'Mở Google AI Studio:', link: 'https://aistudio.google.com/apikey', linkText: 'aistudio.google.com/apikey' },
          { n: '2', text: 'Đăng nhập bằng tài khoản Google của bạn.' },
          { n: '3', text: 'Nhấn nút "Create API Key" → Chọn dự án (hoặc tạo mới).' },
          { n: '4', text: 'Sao chép chuỗi key bắt đầu bằng "AIza..." và dán vào ô bên dưới.' },
        ].map((step) => (
          <li key={step.n} className="flex gap-2 items-start">
            <span className="flex-shrink-0 text-cyan/70 text-xs font-semibold mt-0.5">{step.n}.</span>
            <span>
              {step.text}{' '}
              {step.link && <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">{step.linkText} →</a>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );

  // === MODE: UNLOCK (đã có key cũ) ===
  if (mode === 'unlock') {
    return (
      <div className="p-0">
        <div className="flex flex-col gap-4 mb-5">
          <div className="section-kicker w-fit">Mở Khóa AI</div>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-[700px]">
              <h3 className="text-gold font-semibold text-xl sm:text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                Kích hoạt lại Gemini AI
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                API Key của bạn đã được mã hóa cục bộ bằng AES-GCM. Nhập mật khẩu để mở khóa và tiếp tục luận giải.
              </p>
            </div>

            <div className="text-xs sm:text-sm text-white/55 xl:max-w-[320px] xl:text-right">
              Bạn có thể đổi model mỗi lần mở khóa mà không cần lưu lại API Key mới.
            </div>
          </div>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="unlock-model">Chọn Model</label>
              <select
                id="unlock-model"
                className="input min-h-[3rem]"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
              >
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="unlock-password">Mật khẩu cục bộ</label>
              <input
                id="unlock-password"
                type="password"
                placeholder="Nhập mật khẩu đã dùng khi lưu key"
                className="input w-full min-h-[3rem]"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <p className="text-xs text-white/45 mt-2">Mật khẩu này chỉ dùng để giải mã khóa đã lưu trên thiết bị của bạn.</p>
              {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button type="submit" className="btn-primary min-h-[3rem] w-full sm:w-auto sm:min-w-[160px]">Mở Khóa</button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary min-h-[2.8rem] w-full sm:w-auto sm:min-w-[160px] !border-red-800/45 text-red-200 hover:!bg-red-900/20"
              >
                Cài lại key
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // === MODE: SETUP (chưa có key) ===
  return (
    <div className="p-0">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-[700px]">
            <div className="section-kicker w-fit mb-3">Thiết Lập BYOK</div>
            <h3 className="text-gold font-semibold text-xl sm:text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Kết nối Gemini AI theo cách riêng của bạn
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Ứng dụng chạy hoàn toàn trên trình duyệt. API Key sẽ được mã hóa bằng <strong className="text-white/80">AES-GCM</strong> và lưu cục bộ trên thiết bị của bạn.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="btn-secondary w-full sm:w-auto text-xs px-3 py-2"
          >
            {showGuide ? 'Ẩn hướng dẫn' : 'Cách lấy key'}
          </button>
        </div>

        {showGuide && <GuidePanel />}
      </div>

      <form onSubmit={handleSetup} className="space-y-4 mt-4">
        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <label className="label mb-0" htmlFor="setup-api-key">Google Gemini API Key</label>
            <KeyStatusBadge />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="setup-api-key"
              type="password"
              placeholder="AIzaSy..."
              className="input flex-1 min-h-[3rem]"
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setKeyStatus('idle'); }}
            />
            <button
              type="button"
              disabled={!apiKey || keyStatus === 'testing'}
              onClick={() => testApiKey(apiKey)}
              className="btn-secondary min-h-[3rem] text-xs whitespace-nowrap px-4 disabled:opacity-40"
            >
              Kiểm tra key
            </button>
          </div>
          <p className="text-xs text-white/45 mt-2">Hãy kiểm tra key trước khi lưu để giảm lỗi khi bắt đầu luận giải.</p>
        </div>

        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
            <label className="label mb-0" htmlFor="setup-model">Chọn Model AI</label>
            <button
              type="button"
              onClick={() => checkAvailableModels(apiKey)}
              disabled={!apiKey}
              className="text-[11px] text-cyan/80 hover:text-cyan px-0 py-1 transition-colors disabled:opacity-30"
            >
              Xem model hỗ trợ
            </button>
          </div>
          <select
            id="setup-model"
            className="input w-full min-h-[3rem]"
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name} — {m.desc}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="setup-password">Mật Khẩu Bảo Vệ</label>
          <input
            id="setup-password"
            type="password"
            placeholder="Ít nhất 6 ký tự để mở khóa lần sau"
            className="input w-full min-h-[3rem]"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <p className="text-xs text-white/45 mt-2">Mật khẩu này không được gửi tới Gemini. Nó chỉ dùng để mã hóa khóa trên thiết bị của bạn.</p>
        </div>

        {error && <p className="text-red-300 text-sm">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
          <p className="text-sm text-white/55 leading-relaxed">
            Sau khi lưu, AI sẽ sẵn sàng hoạt động ngay trong phiên hiện tại.
          </p>

          <button
            type="submit"
            className={`btn-primary w-full sm:w-auto min-h-[3.25rem] px-6 ${keyStatus === 'invalid' ? 'opacity-70' : ''}`}
            disabled={keyStatus === 'testing'}
          >
            {keyStatus === 'valid' ? 'Lưu và kích hoạt AI' : 'Lưu cấu hình AI'}
          </button>
        </div>
      </form>
    </div>
  );
};
