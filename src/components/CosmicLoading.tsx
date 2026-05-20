/**
 * CosmicLoading.tsx — Màn hình chờ Huyền học vũ trụ "Cosmic Alchemy"
 * Trình diễn các tiến trình hiệu chỉnh thiên văn và an sao theo thời gian thực với thiết kế cực kỳ sang trọng.
 */
import React, { useState, useEffect } from 'react';

interface LoadingStep {
  id: number;
  label: string;
  duration: number; // thời gian hiển thị bước này (ms)
}

const LOADING_STEPS: LoadingStep[] = [
  { id: 1, label: 'Định vị tọa độ địa lý và kinh vĩ độ nơi sinh...', duration: 400 },
  { id: 2, label: 'Tra cứu lịch sử múi giờ hành chính Việt Nam tại thời điểm sinh...', duration: 500 },
  { id: 3, label: 'Tính toán Phương trình thời gian (Equation of Time) của Trái Đất...', duration: 400 },
  { id: 4, label: 'Hiệu chỉnh Giờ Mặt Trời Thực (True Solar Time) tại kinh tuyến sinh...', duration: 450 },
  { id: 5, label: 'Đồng bộ hóa tiết khí và pha Mặt Trăng bằng thuật toán thiên văn...', duration: 400 },
  { id: 6, label: 'Khởi tạo Mệnh bàn, phân định 12 cung chức năng...', duration: 350 },
  { id: 7, label: 'Thiết lập chòm sao Tử Vi & Thiên Phủ (An định 114 cát hung tinh)...', duration: 300 },
];

export const CosmicLoading: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let currentStep = 0;
    
    const runNextStep = () => {
      if (currentStep >= LOADING_STEPS.length) return;

      const duration = LOADING_STEPS[currentStep]!.duration;
      
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, LOADING_STEPS[currentStep]!.id]);
        currentStep++;
        
        if (currentStep < LOADING_STEPS.length) {
          setActiveStepIndex(currentStep);
          runNextStep();
        }
      }, duration);

      return timer;
    };

    const firstTimer = runNextStep();

    return () => {
      if (firstTimer) clearTimeout(firstTimer);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712] overflow-hidden px-4"
      style={{ background: 'radial-gradient(circle at center, #0f1524 0%, #030712 100%)' }}
    >
      {/* Sao lấp lánh nền */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')] opacity-30 pointer-events-none animate-pulse"></div>

      <div className="relative max-w-[500px] w-full flex flex-col items-center justify-center p-8 rounded-2xl border border-gold/10 bg-black/60 backdrop-blur-md shadow-2xl text-center">
        {/* Glow hiệu ứng */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/15 via-coral/10 to-gold/15 rounded-2xl blur-xl opacity-30"></div>

        {/* Bát quái / Thái cực quay chậm */}
        <div className="relative w-24 h-24 mb-8 select-none">
          <div className="absolute inset-0 rounded-full border border-dashed border-gold/25 animate-[spin_40s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full border border-gold/15 animate-[spin_20s_linear_infinite_reverse]"></div>
          
          {/* Thái cực tâm */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-gold/20 via-transparent to-gold/60 animate-[spin_8s_linear_infinite] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-gold fill-current opacity-80" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0a50 50 0 0 0 0 100V50z" />
              <path d="M50 0a50 50 0 0 1 0 100 25 25 0 0 1 0-50 25 25 0 0 0 0-50" className="opacity-40" />
              <circle cx="50" cy="25" r="8" className="fill-black/80" />
              <circle cx="50" cy="75" r="8" className="fill-white/80" />
            </svg>
          </div>
        </div>

        {/* Tiêu đề chính */}
        <h4 className="text-lg font-serif-sc text-gold tracking-widest uppercase mb-1">
          Thiết Lập Bản Mệnh
        </h4>
        <p className="text-xs text-white/40 tracking-[0.2em] uppercase mb-8">
          Astronomical High-Precision Calibration
        </p>

        {/* Tiến trình logs */}
        <div className="w-full text-left space-y-3.5 mb-2 font-mono text-[11px] sm:text-xs">
          {LOADING_STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = activeStepIndex === idx;
            
            return (
              <div 
                key={step.id} 
                className={`flex items-start gap-2.5 transition-all duration-300 ${
                  isActive ? 'text-gold opacity-100 font-semibold translate-x-1' : 
                  isCompleted ? 'text-white/60 opacity-80' : 'text-white/20 opacity-30'
                }`}
              >
                <span className="shrink-0 text-sm leading-none">
                  {isCompleted ? '✦' : isActive ? '⚡' : '◇'}
                </span>
                <span className="leading-relaxed">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Thanh progress bar mượt mà */}
        <div className="w-full h-[1px] bg-white/10 rounded-full mt-6 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gold/30 via-gold to-coral/50 transition-all duration-300 ease-out"
            style={{ width: `${((completedSteps.length) / LOADING_STEPS.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
