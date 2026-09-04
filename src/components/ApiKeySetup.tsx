/**
 * ApiKeySetup.tsx — BYOK với hướng dẫn step-by-step và nút Test Key
 * Hỗ trợ chuyển đổi giữa Google Gemini và AgentRouter
 */
import React, { useState, useEffect } from 'react';

export type AiProvider = 'gemini' | 'agentrouter';

interface ApiKeySetupProps {
  onKeyReady: (decryptedKey: string, modelName: string, provider: AiProvider) => void;
}

type KeyStatus = 'idle' | 'testing' | 'valid' | 'invalid';

const STORED_API_KEY_GEMINI = 'tuviai_encrypted_apikey_gemini';
const STORED_API_KEY_LEGACY = 'tuviai_encrypted_apikey';
const STORED_API_KEY_AGENTROUTER = 'tuviai_encrypted_apikey_agentrouter';

let googleGenAiModulePromise: Promise<typeof import('@google/genai')> | null = null;
let cryptoServiceModulePromise: Promise<typeof import('../services/CryptoService')> | null = null;

function loadGoogleGenAiModule(): Promise<typeof import('@google/genai')> {
  if (!googleGenAiModulePromise) {
    googleGenAiModulePromise = import('@google/genai');
  }
  return googleGenAiModulePromise;
}

function loadCryptoServiceModule(): Promise<typeof import('../services/CryptoService')> {
  if (!cryptoServiceModulePromise) {
    cryptoServiceModulePromise = import('../services/CryptoService');
  }
  return cryptoServiceModulePromise;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeyReady }) => {
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hasEncryptedKey, setHasEncryptedKey] = useState(false);
  const [mode, setMode] = useState<'setup' | 'unlock'>('unlock');
  const [keyStatus, setKeyStatus] = useState<KeyStatus>('idle');
  const [showGuide, setShowGuide] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-flash-latest');

  const geminiModels = [
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Khuyên dùng)', desc: 'Mạnh nhất, luận giải chuyên sâu' },
    { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash-Lite (Mini)', desc: 'Phiên bản rút gọn 3.1' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Khuyên dùng)', desc: 'Mạnh nhất, nhanh, giá rẻ' },
    { id: 'gemini-pro-latest', name: 'Gemini Pro (Mới nhất)', desc: 'Phiên Pro mới nhất' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash (Mới nhất)', desc: 'Phiên nhanh mới nhất' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Ổn định)', desc: 'Phiên bản Pro ổn định cao' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Tốc độ)', desc: 'Nhanh, phổ thông, ít lỗi API nhất' },
  ];

  const agentRouterModels = [
    { id: 'claude-opus-4-6', name: 'Claude Opus 4.6 (Mới)', desc: 'Model Opus mới nhất' },
    { id: 'claude-opus-4-7', name: 'Claude Opus 4.7 (Mới)', desc: 'Model Opus mới nhất' },
    { id: 'claude-opus-4-8', name: 'Claude Opus 4.8 (Mới)', desc: 'Model Opus mới nhất' },
    { id: 'glm-5.2', name: 'GLM 5.2 (Mới)', desc: 'ChatGLM phiên bản mới' },
    { id: 'gpt-5.5', name: 'GPT 5.5 (Mới)', desc: 'Model OpenAI GPT thế hệ mới' },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat (V3)', desc: 'Mạnh mẽ, cực rẻ và phân tích tốt' },
    { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Cực kỳ thông minh và tự nhiên' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Rất nhanh và hiệu quả' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', desc: 'Model đa năng hàng đầu' },
    { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek Reasoner (R1)', desc: 'Mô hình suy luận chuyên sâu' },
  ];

  const models = provider === 'gemini' ? geminiModels : agentRouterModels;

  // Load preferences từ localStorage dựa trên provider đã chọn
  useEffect(() => {
    // 1. Xác định provider mặc định hoặc đã lưu
    const savedProvider = localStorage.getItem('tuviai_ai_provider') as AiProvider;
    const currentProvider = savedProvider === 'agentrouter' ? 'agentrouter' : 'gemini';
    setProvider(currentProvider);
    
    updateStateForProvider(currentProvider);
  }, []);

  const updateStateForProvider = (targetProvider: AiProvider) => {
    // 2. Kiểm tra key đã mã hóa
    let keyExists = false;
    if (targetProvider === 'gemini') {
      keyExists = !!localStorage.getItem(STORED_API_KEY_GEMINI) || !!localStorage.getItem(STORED_API_KEY_LEGACY);
    } else {
      keyExists = !!localStorage.getItem(STORED_API_KEY_AGENTROUTER);
    }
    setHasEncryptedKey(keyExists);
    setMode(keyExists ? 'unlock' : 'setup');

    // 3. Load model preference
    if (targetProvider === 'gemini') {
      const savedModel = localStorage.getItem('gemini_model_preference') || 'gemini-flash-latest';
      setSelectedModel(savedModel);
    } else {
      const savedModel = localStorage.getItem('agentrouter_model_preference') || 'deepseek/deepseek-chat';
      setSelectedModel(savedModel);
    }

    setApiKey('');
    setPassword('');
    setError('');
    setKeyStatus('idle');
  };

  const handleProviderChange = (newProvider: AiProvider) => {
    setProvider(newProvider);
    localStorage.setItem('tuviai_ai_provider', newProvider);
    updateStateForProvider(newProvider);
  };

  const testApiKey = async (keyToTest: string) => {
    if (!keyToTest || keyToTest.length < 5) return;
    setKeyStatus('testing');

    if (provider === 'gemini') {
      try {
        const { GoogleGenAI } = await loadGoogleGenAiModule();
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
    } else {
      // Test key cho AgentRouter
      try {
        const response = await fetch("https://agentrouter.org/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${keyToTest}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [{ role: "user", content: "say hi" }],
            max_tokens: 5,
          }),
        });

        if (response.ok) {
          setKeyStatus('valid');
        } else {
          setKeyStatus('invalid');
        }
      } catch {
        setKeyStatus('invalid');
      }
    }
  };

  const checkAvailableModels = async (keyToTest: string) => {
    try {
      if (!keyToTest) {
        alert("Vui lòng nhập API Key hợp lệ trước khi kiểm tra!");
        return;
      }

      if (provider === 'gemini') {
        console.log("Đang lấy danh sách model từ Google...");
        const { GoogleGenAI } = await loadGoogleGenAiModule();
        const ai = new GoogleGenAI({ apiKey: keyToTest });

        const response = await ai.models.list();
        const allModels = [];

        for await (const model of response) {
          const m = model as any;
          if (m.name) {
            allModels.push(m.name.replace('models/', ''));
          }
        }

        console.log("🔥 CÁC MODEL GEMINI KHẢ DỤNG:");
        console.log(allModels.join('\n'));
        alert(`Đã in danh sách ${allModels.length} model ra Console (F12)!\nHãy kiểm tra và chọn chuỗi chính xác.`);
      } else {
        console.log("Đang lấy danh sách model từ AgentRouter...");
        const response = await fetch("https://agentrouter.org/v1/models", {
          headers: {
            "Authorization": `Bearer ${keyToTest}`,
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const modelIds = data.data?.map((m: any) => m.id) || [];
        console.log("🔥 CÁC MODEL AGENTROUTER KHẢ DỤNG:");
        console.log(modelIds.join('\n'));
        alert(`Đã in danh sách ${modelIds.length} model khả dụng ra Console (F12)!`);
      }

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
      const { CryptoService } = await loadCryptoServiceModule();
      const encrypted = await CryptoService.encrypt(apiKey, password);
      
      if (provider === 'gemini') {
        localStorage.setItem(STORED_API_KEY_GEMINI, encrypted);
        localStorage.setItem('gemini_model_preference', selectedModel);
      } else {
        localStorage.setItem(STORED_API_KEY_AGENTROUTER, encrypted);
        localStorage.setItem('agentrouter_model_preference', selectedModel);
      }
      
      setHasEncryptedKey(true);
      setError('');
      onKeyReady(apiKey, selectedModel, provider);
    } catch {
      setError('Không thể mã hóa API Key.');
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let encrypted = null;
      if (provider === 'gemini') {
        encrypted = localStorage.getItem(STORED_API_KEY_GEMINI) || localStorage.getItem(STORED_API_KEY_LEGACY);
      } else {
        encrypted = localStorage.getItem(STORED_API_KEY_AGENTROUTER);
      }

      if (!encrypted) throw new Error('Không tìm thấy khóa.');
      
      const { CryptoService } = await loadCryptoServiceModule();
      const decryptedKey = await CryptoService.decrypt(encrypted, password);
      
      if (provider === 'gemini') {
        localStorage.setItem('gemini_model_preference', selectedModel);
      } else {
        localStorage.setItem('agentrouter_model_preference', selectedModel);
      }
      
      onKeyReady(decryptedKey, selectedModel, provider);
    } catch {
      setError('Mật khẩu sai hoặc dữ liệu bị lỗi.');
    }
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn xóa cấu hình API cũ không?')) {
      if (provider === 'gemini') {
        localStorage.removeItem(STORED_API_KEY_GEMINI);
        localStorage.removeItem(STORED_API_KEY_LEGACY);
      } else {
        localStorage.removeItem(STORED_API_KEY_AGENTROUTER);
      }
      setHasEncryptedKey(false);
      setMode('setup');
      setApiKey(''); setPassword(''); setError(''); setKeyStatus('idle');
    }
  };

  const KeyStatusBadge = () => {
    if (keyStatus === 'testing') return <span className="text-xs text-amber-300 animate-pulse">⏳ Đang kiểm tra...</span>;
    if (keyStatus === 'valid') return <span className="text-xs text-emerald-300">✅ Key hợp lệ</span>;
    if (keyStatus === 'invalid') return <span className="text-xs text-red-300">❌ Key không hợp lệ</span>;
    return null;
  };

  const GuidePanel = () => {
    if (provider === 'gemini') {
      return (
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
    } else {
      return (
        <div className="mt-4 p-0 text-sm">
          <p className="font-semibold text-cyan mb-3">Cách lấy AgentRouter API Key</p>
          <ol className="space-y-2 text-white/70 list-none">
            {[
              { n: '1', text: 'Mở AgentRouter Console:', link: 'https://agentrouter.org/console/token', linkText: 'agentrouter.org/console/token' },
              { n: '2', text: 'Đăng nhập bằng tài khoản GitHub của bạn.' },
              { n: '3', text: 'Nhấn tạo token và sao chép mã khóa token được cung cấp.' },
              { n: '4', text: 'Dán mã khóa Token (thường bắt đầu bằng "sk-...") vào ô bên dưới.' },
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
    }
  };

  return (
    <div className="p-0">
      {/* Tab Switcher Provider */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          type="button"
          onClick={() => handleProviderChange('gemini')}
          className={`flex-1 py-3 text-center font-medium text-sm transition-colors border-b-2 ${
            provider === 'gemini' ? 'border-gold text-gold bg-white/5' : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          Google Gemini
        </button>
        <button
          type="button"
          onClick={() => handleProviderChange('agentrouter')}
          className={`flex-1 py-3 text-center font-medium text-sm transition-colors border-b-2 ${
            provider === 'agentrouter' ? 'border-gold text-gold bg-white/5' : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          AgentRouter (Opus 4.8 / GPT 5.5 / DeepSeek V3)
        </button>
      </div>

      {mode === 'unlock' ? (
        <div className="p-0">
          <div className="flex flex-col gap-4 mb-5">
            <div className="section-kicker w-fit">Mở Khóa AI</div>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-[700px]">
                <h3 className="text-gold font-semibold text-xl sm:text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  Kích hoạt lại dịch vụ {provider === 'gemini' ? 'Gemini AI' : 'AgentRouter'}
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
      ) : (
        <div className="p-0">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-[700px]">
                <div className="section-kicker w-fit mb-3">Thiết Lập BYOK</div>
                <h3 className="text-gold font-semibold text-xl sm:text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  Kết nối {provider === 'gemini' ? 'Gemini AI' : 'AgentRouter'} theo cách riêng của bạn
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
                <label className="label mb-0" htmlFor="setup-api-key">
                  {provider === 'gemini' ? 'Google Gemini API Key' : 'AgentRouter API Token'}
                </label>
                <KeyStatusBadge />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="setup-api-key"
                  type="password"
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
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
              <p className="text-xs text-white/45 mt-2">Mật khẩu này không được gửi ra ngoài. Nó chỉ dùng để mã hóa khóa trên thiết bị của bạn.</p>
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
      )}
    </div>
  );
};
