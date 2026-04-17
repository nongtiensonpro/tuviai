import React, { useEffect, useState } from 'react';
import type {
  InsightExploreCategory,
  InsightExploreGroup,
  InsightPayload,
  InsightRelatedItem,
  InsightStarSelection,
  InsightTermSelection,
  ZiweiChart,
  PalaceName,
} from '../core/types/ZiweiTypes';
import { PalaceCell } from './PalaceCell';
import { CenterPanel } from './CenterPanel';
import { buildStarInsightPayload, buildTermInsightPayload } from '../data/InsightBuilder';

// Mảng chứa thứ tự index Địa Chi (0..11) map vào Grid CSS.
const GRID_CELLS_ORDER = [
  /* R1 */ 5, 6, 7, 8,
  /* R2 */ 4, 'CENTER', 'CENTER', 9,
  /* R3 */ 3, 'CENTER', 'CENTER', 10,
  /* R4 */ 2, 1, 0, 11
];

interface ZiWeiBoardProps {
  chart: ZiweiChart;
  onPalaceClick?: (palaceName: PalaceName) => void;
  activePalace?: PalaceName;
}

const KNOWLEDGE_MAP_CATEGORY_ORDER: InsightExploreCategory[] = [
  'family',
  'counterpart',
  'palace-impact',
  'theme',
];

const KNOWLEDGE_MAP_META: Record<InsightExploreCategory, {
  label: string;
  bridge: string;
  accentClassName: string;
  chipClassName: string;
}> = {
  family: {
    label: 'Bộ sao',
    bridge: 'Thuộc cùng một họ sao hoặc cùng một lớp kiến thức.',
    accentClassName: 'border-emerald-300/14 bg-emerald-300/[0.05]',
    chipClassName: 'border-emerald-300/18 bg-emerald-300/[0.06] text-emerald-100 hover:border-emerald-200/30 hover:text-emerald-50',
  },
  counterpart: {
    label: 'Đối cặp',
    bridge: 'Đặt mục đang đọc cạnh đối tinh, đối cung hoặc nửa còn lại của bộ sao.',
    accentClassName: 'border-sky-300/14 bg-sky-300/[0.05]',
    chipClassName: 'border-sky-300/18 bg-sky-300/[0.06] text-sky-100 hover:border-sky-200/30 hover:text-sky-50',
  },
  'palace-impact': {
    label: 'Cung chịu lực',
    bridge: 'Chỉ ra nơi bộ sao hoặc chỉ dấu này đang đổ lực trên toàn lá số.',
    accentClassName: 'border-amber-300/14 bg-amber-300/[0.05]',
    chipClassName: 'border-amber-300/18 bg-amber-300/[0.06] text-amber-100 hover:border-amber-200/30 hover:text-amber-50',
  },
  theme: {
    label: 'Chủ đề',
    bridge: 'Mở rộng từ một mục đơn lẻ sang các đường đọc lớn của hệ Tử Vi.',
    accentClassName: 'border-rose-300/14 bg-rose-300/[0.05]',
    chipClassName: 'border-rose-300/18 bg-rose-300/[0.06] text-rose-100 hover:border-rose-200/30 hover:text-rose-50',
  },
  related: {
    label: 'Theo mạch',
    bridge: 'Các điểm đọc gần nhất trên cùng một nhánh khám phá.',
    accentClassName: 'border-white/10 bg-white/[0.03]',
    chipClassName: 'border-white/12 bg-white/[0.03] text-white/68 hover:border-white/22 hover:text-white',
  },
};

const INSIGHT_NODE_LABELS: Record<InsightPayload['kind'], string> = {
  star: 'Sao đang xem',
  palace: 'Cung đang xem',
  glossary: 'Thuật ngữ đang xem',
  'state-marker': 'Chỉ dấu đang xem',
};

function isExploreGroup(group: InsightExploreGroup | undefined): group is InsightExploreGroup {
  return Boolean(group);
}

function buildInsightMapContext(insight: InsightPayload): string[] {
  return Array.from(new Set([
    insight.context.palaceName ? `Cung ${insight.context.palaceName}` : '',
    insight.context.chi ? `Địa chi ${insight.context.chi}` : '',
    insight.context.nguHanh ? `Ngũ hành ${insight.context.nguHanh}` : '',
    insight.context.sihua ? `Hóa ${insight.context.sihua}` : '',
    insight.context.trangSinh ? `Tràng Sinh ${insight.context.trangSinh}` : '',
    insight.context.isBorrowed ? 'Mượn chiếu' : '',
    insight.context.isThanPalace ? 'Thân cư cung này' : '',
  ].filter(Boolean)));
}

export const ZiWeiBoard: React.FC<ZiWeiBoardProps> = ({ chart, onPalaceClick, activePalace }) => {
  const [activeInsight, setActiveInsight] = useState<InsightPayload | null>(null);
  const [activeExploreFilter, setActiveExploreFilter] = useState<'all' | InsightExploreCategory>('all');

  useEffect(() => {
    setActiveExploreFilter('all');
  }, [activeInsight?.kind, activeInsight?.title]);

  if (!chart || !chart.palaces) {
    return <div className="text-white text-center">Đang tải Mệnh Bàn...</div>;
  }

  const handleStarClick = (selection: InsightStarSelection) => {
    setActiveInsight(buildStarInsightPayload(chart, selection));
  };

  const handleGlossaryClick = (selection: InsightTermSelection) => {
    setActiveInsight(buildTermInsightPayload(chart, selection));
  };

  const handleRelatedInsightClick = (item: InsightRelatedItem) => {
    if (item.kind === 'star') {
      handleStarClick({ name: item.name });
      return;
    }

    handleGlossaryClick({ name: item.name });
  };

  const insightEyebrowMap: Record<InsightPayload['kind'], string> = {
    star: 'Tra cứu sao',
    palace: 'Tra cứu cung',
    glossary: 'Tra cứu thuật ngữ',
    'state-marker': 'Tra cứu chỉ dấu',
  };

  const insightTitleClassMap: Record<InsightPayload['kind'], string> = {
    star: 'text-gold',
    palace: 'text-emerald-300',
    glossary: 'text-sky-200',
    'state-marker': 'text-amber-300',
  };

  const contextRows = activeInsight ? [
    activeInsight.context.palaceName ? `Cung: ${activeInsight.context.palaceName}` : '',
    activeInsight.context.chi ? `Địa chi: ${activeInsight.context.chi}` : '',
    activeInsight.context.nguHanh ? `Ngũ hành: ${activeInsight.context.nguHanh}` : '',
    activeInsight.context.brightness ? `Độ sáng: ${activeInsight.context.brightness}` : '',
    activeInsight.context.sihua ? `Tứ Hóa: ${activeInsight.context.sihua}` : '',
    activeInsight.context.isBorrowed ? 'Trạng thái: Mượn chiếu' : '',
    activeInsight.context.isMainStar === true ? 'Vai trò: Chính tinh' : '',
    activeInsight.context.isMainStar === false ? 'Vai trò: Phụ tinh' : '',
    activeInsight.context.trangSinh ? `Tràng Sinh: ${activeInsight.context.trangSinh}` : '',
    activeInsight.context.daiHan !== undefined ? `Đại Hạn: ${activeInsight.context.daiHan}` : '',
    activeInsight.context.isThanPalace ? 'Ghi chú: Thân cư cung này' : '',
  ].filter(Boolean) : [];

  const exploreCategoryLabelMap: Record<InsightExploreCategory, string> = {
    family: 'Bộ sao',
    counterpart: 'Đối cặp',
    'palace-impact': 'Cung chịu lực',
    theme: 'Chủ đề',
    related: 'Theo mạch',
  };

  const visibleExploreGroups = activeInsight
    ? activeInsight.exploreGroups.filter((group) => activeExploreFilter === 'all' || group.category === activeExploreFilter)
    : [];
  const availableExploreFilters = activeInsight
    ? Array.from(new Set(activeInsight.exploreGroups.map((group) => group.category)))
    : [];
  const knowledgeMapGroups = activeInsight
    ? KNOWLEDGE_MAP_CATEGORY_ORDER
      .map((category) => activeInsight.exploreGroups.find((group) => group.category === category))
      .filter(isExploreGroup)
    : [];
  const relatedExploreGroup = activeInsight?.exploreGroups.find((group) => group.category === 'related');
  const knowledgeMapContext = activeInsight ? buildInsightMapContext(activeInsight) : [];

  return (
    <div className="ziwei-board-wrapper">
      {/* Scroll hint — chỉ hiện trên mobile */}
      <p className="ziwei-scroll-hint">← Vuốt để xem toàn bộ Mệnh Bàn →</p>

      <div className="mb-4 flex flex-col gap-2 text-center sm:text-left">
        <p className="text-sm uppercase tracking-[0.18em] text-white/45">Mệnh bàn tổng quan</p>
        <p className="text-sm text-white/65">
          Chạm vào từng cung để xem trọng tâm luận giải.
        </p>
      </div>

      <div className="ziwei-scroll-container pb-6 pt-3">
        <div className="ziwei-grid mx-auto max-w-[800px] w-full text-white relative">
          {GRID_CELLS_ORDER.map((item, index) => {
            // Render Center Panel
            if (item === 'CENTER') {
              if (index === 5) {
                return (
                  <CenterPanel
                    key="center"
                    chart={chart}
                    onGlossaryClick={handleGlossaryClick}
                    onStarClick={handleStarClick}
                  />
                );
              }
              return null;
            }

            // Render Palace Cell
            const chiIndex = item as number;
            const palace = chart.palaces[chiIndex];
            if (!palace) return null;

            const isActive = activePalace === palace.palaceName;

            return (
              <PalaceCell
                key={`palace-${chiIndex}`}
                palace={palace}
                isActive={isActive}
                onClick={() => onPalaceClick?.(palace.palaceName)}
                onStarClick={handleStarClick}
                onGlossaryClick={handleGlossaryClick}
              />
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-3 w-full max-w-[800px]">
        <div className="p-2 sm:p-4">
          {activeInsight ? (
            <div className="animate-fade-up">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{insightEyebrowMap[activeInsight.kind]}</p>
                  <h4 className={`mt-2 text-lg font-bold sm:text-xl ${insightTitleClassMap[activeInsight.kind]}`}>
                    {activeInsight.title}
                  </h4>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
                    {activeInsight.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInsight(null)}
                  className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-white/52 transition-colors hover:text-white"
                >
                  Đóng
                </button>
              </div>

              {activeInsight.keywords.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeInsight.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-gold/20 bg-gold/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-gold/85"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {activeInsight.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeInsight.tags.map((tag) => (
                    <span
                      key={tag.label}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-white/58"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-start">
                <div>
                  <p className="text-sm leading-7 text-white/84 whitespace-pre-line">
                    {activeInsight.description}
                  </p>

                  {activeInsight.sections.length > 0 && (
                    <div className="mt-5 flex flex-col gap-4">
                      {activeInsight.sections.map((section) => (
                        <div key={`${section.title}-${section.body.slice(0, 32)}`} className="border-t border-white/8 pt-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">{section.title}</p>
                          <p className="mt-2 text-sm leading-7 text-white/72 whitespace-pre-line">
                            {section.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {contextRows.length > 0 && (
                  <div className="rounded-sm border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">Ngữ cảnh trên lá số này</p>
                    <div className="mt-2 flex flex-col gap-1.5 text-sm leading-6 text-white/63">
                      {contextRows.map((row) => (
                        <p key={row}>{row}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {activeInsight.exploreGroups.length > 0 && (
                <div className="mt-5 border-t border-white/8 pt-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">Khám phá lá số</p>
                      <p className="mt-1 text-sm leading-6 text-white/56">
                        Từ mục đang xem, bạn có thể nhìn cả sơ đồ liên hệ rồi đi tiếp theo bộ sao, trục đối chiếu, cung chịu lực hoặc chủ đề.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveExploreFilter('all')}
                        className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition-colors ${
                          activeExploreFilter === 'all'
                            ? 'border-gold/40 bg-gold/10 text-gold'
                            : 'border-white/10 text-white/55 hover:text-white'
                        }`}
                      >
                        Tất cả
                      </button>
                      {availableExploreFilters.map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setActiveExploreFilter(filter)}
                          className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition-colors ${
                            activeExploreFilter === filter
                              ? 'border-gold/40 bg-gold/10 text-gold'
                              : 'border-white/10 text-white/55 hover:text-white'
                          }`}
                        >
                          {exploreCategoryLabelMap[filter]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {knowledgeMapGroups.length > 0 && (
                    <div className="mt-4 overflow-hidden rounded-sm border border-gold/12 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.12),_rgba(17,25,34,0.78)_52%)] p-4 sm:p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Bản đồ tri thức</p>
                          <p className="mt-1 text-sm leading-6 text-white/60">
                            Sơ đồ nhỏ này gom các nhánh đáng xem nhất quanh điểm bạn đang đọc để bớt phải lần mò theo từng chip rời.
                          </p>
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-gold/70">
                          {knowledgeMapGroups.length} nhánh đang mở
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)] lg:items-start">
                        <div className="relative rounded-sm border border-gold/18 bg-[#17130d]/72 p-4 shadow-[0_0_30px_rgba(212,175,55,0.06)]">
                          <div className="absolute right-0 top-1/2 hidden h-px w-8 translate-x-8 bg-gold/18 lg:block" />
                          <p className="text-[11px] uppercase tracking-[0.16em] text-gold/72">{INSIGHT_NODE_LABELS[activeInsight.kind]}</p>
                          <h5 className={`mt-2 text-lg font-semibold ${insightTitleClassMap[activeInsight.kind]}`}>
                            {activeInsight.title}
                          </h5>
                          <p className="mt-2 text-sm leading-6 text-white/64">
                            {activeInsight.subtitle}
                          </p>

                          {knowledgeMapContext.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {knowledgeMapContext.slice(0, 4).map((item) => (
                                <span
                                  key={item}
                                  className="rounded-full border border-gold/18 bg-gold/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-gold/88"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {knowledgeMapGroups.map((group) => {
                            const visibleItems = group.items.slice(0, 4);
                            const hiddenItemCount = Math.max(0, group.items.length - visibleItems.length);
                            const mapMeta = KNOWLEDGE_MAP_META[group.category];

                            return (
                              <div
                                key={`knowledge-map-${group.category}-${group.id}`}
                                className={`relative rounded-sm border px-4 py-4 ${mapMeta.accentClassName}`}
                              >
                                <div className="absolute left-0 top-1/2 hidden h-px w-4 -translate-x-4 bg-gold/18 lg:block" />
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">{mapMeta.label}</p>
                                    <h5 className="mt-1 text-sm font-semibold text-white/88">{group.title}</h5>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setActiveExploreFilter(group.category)}
                                    className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-white/56 transition-colors hover:text-white"
                                  >
                                    Mở nhánh
                                  </button>
                                </div>

                                <p className="mt-2 text-sm leading-6 text-white/56">
                                  {mapMeta.bridge}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {visibleItems.map((item) => (
                                    <button
                                      key={`knowledge-map-node-${group.id}-${item.kind}-${item.name}`}
                                      type="button"
                                      onClick={() => handleRelatedInsightClick(item)}
                                      className={`rounded-full border px-3 py-2 text-left text-xs leading-5 transition-colors ${mapMeta.chipClassName}`}
                                    >
                                      {item.label}
                                    </button>
                                  ))}

                                  {hiddenItemCount > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setActiveExploreFilter(group.category)}
                                      className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-white/60 transition-colors hover:text-white"
                                    >
                                      +{hiddenItemCount} mục trong nhánh
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {relatedExploreGroup && relatedExploreGroup.items.length > 0 && (
                        <div className="mt-4 border-t border-white/8 pt-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">Nhánh đang nối tiếp</p>
                              <p className="mt-1 text-sm leading-6 text-white/56">
                                Các điểm gần nhất trên cùng mạch khám phá để bạn chuyển nhanh mà không mất ngữ cảnh.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveExploreFilter('related')}
                              className="self-start rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/56 transition-colors hover:text-white"
                            >
                              Mở mạch này
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {relatedExploreGroup.items.slice(0, 5).map((item) => (
                              <button
                                key={`knowledge-map-related-${item.kind}-${item.name}`}
                                type="button"
                                onClick={() => handleRelatedInsightClick(item)}
                                className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-white/68 transition-colors hover:border-white/24 hover:text-white"
                              >
                                {item.label}
                              </button>
                            ))}
                            {relatedExploreGroup.items.length > 5 && (
                              <button
                                type="button"
                                onClick={() => setActiveExploreFilter('related')}
                                className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-white/60 transition-colors hover:text-white"
                              >
                                +{relatedExploreGroup.items.length - 5} mục theo mạch
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 grid gap-4">
                    {visibleExploreGroups.map((group) => (
                      <div key={`${group.category}-${group.id}`} className="rounded-sm border border-white/8 bg-white/[0.02] p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">{exploreCategoryLabelMap[group.category]}</p>
                            <h5 className="mt-1 text-sm font-semibold text-white/88">{group.title}</h5>
                          </div>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/56">{group.description}</p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {group.items.map((item) => (
                            <button
                              key={`${group.id}-${item.kind}-${item.name}`}
                              type="button"
                              onClick={() => handleRelatedInsightClick(item)}
                              className="rounded-sm border border-white/10 bg-white/[0.02] px-3 py-3 text-left transition-colors hover:border-gold/30 hover:text-gold"
                            >
                              <p className="text-sm font-medium text-white/78">{item.label}</p>
                              {item.hint && (
                                <p className="mt-1 text-xs leading-5 text-white/45">{item.hint}</p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">Ghi chú lá số</p>
              <h4 className="mt-2 text-lg font-bold text-gold sm:text-xl">Chọn một sao hoặc thuật ngữ để xem chi tiết</h4>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
                Khu vực này sẽ giữ lại ghi chú bạn vừa chọn trên lá số thay cho popup nổi. Bạn có thể bấm vào sao, tên cung, Tuần, Triệt, Tràng Sinh,
                Mệnh Chủ, Thân Chủ hoặc các nhãn ở trung tâm để đọc kỹ hơn mà không bị tự động đóng.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
