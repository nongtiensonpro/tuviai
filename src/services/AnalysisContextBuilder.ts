import type {
  AnalysisBridgeContext,
  AiPalaceSnapshot,
  AnalysisFocusContext,
  AnalysisPromptContext,
  Palace,
  PalaceName,
  Star,
  ZiweiChart,
} from '../core/types/ZiweiTypes';

function formatMainStar(star: Star): string {
  const brightness = star.brightness ? `(${star.brightness})` : '';
  const sihua = star.sihua ? `[Hóa ${star.sihua}]` : '';

  return `${star.name}${brightness}${sihua}`;
}

function formatAuxStar(star: Star): string {
  const sihua = star.sihua ? `[Hóa ${star.sihua}]` : '';

  return `${star.name}${sihua}`;
}

function formatSihuaSummary(palace: Palace): string[] {
  return palace.sihua.map(trigger => `${trigger.starName} Hóa ${trigger.type}`);
}

function buildPalaceSnapshot(palace: Palace): AiPalaceSnapshot {
  return {
    palaceName: palace.palaceName,
    diaChi: palace.chi,
    mainStars: palace.mainStars.map(formatMainStar),
    auxStars: palace.auxStars.map(formatAuxStar),
    borrowedMainStars: palace.borrowedStars.map(formatMainStar),
    sihua: formatSihuaSummary(palace),
    trangSinh: palace.trangSinh,
    daiHan: palace.daiHan,
    isThanPalace: palace.isThanPalace,
    hasTuanKhong: palace.hasTuanKhong,
    hasTrietKhong: palace.hasTrinhKhong,
  };
}

function describeStarGroup(label: string, stars: string[]): string {
  if (stars.length === 0) {
    return `${label}: không nổi bật`;
  }

  return `${label}: ${stars.join(', ')}`;
}

function describePalace(snapshot: AiPalaceSnapshot): string {
  const markers: string[] = [];

  if (snapshot.isThanPalace) {
    markers.push('an Thân');
  }

  if (snapshot.hasTuanKhong) {
    markers.push('có Tuần Không');
  }

  if (snapshot.hasTrietKhong) {
    markers.push('có Triệt Không');
  }

  if (snapshot.borrowedMainStars.length > 0 && snapshot.mainStars.length === 0) {
    markers.push(`vô chính diệu, mượn ${snapshot.borrowedMainStars.join(', ')}`);
  }

  const markerText = markers.length > 0 ? `; ${markers.join('; ')}` : '';

  return `${snapshot.palaceName} (${snapshot.diaChi}) - ${describeStarGroup('chính tinh', snapshot.mainStars)}; ${describeStarGroup('phụ tinh', snapshot.auxStars)}${markerText}`;
}

function getTamHopPalaces(target: Palace, palaces: Palace[]): Palace[] {
  const first = palaces[(target.chiIndex + 4) % 12];
  const second = palaces[(target.chiIndex + 8) % 12];

  return [first, second].filter((palace): palace is Palace => !!palace);
}

function uniquePalaceNames(names: PalaceName[]): PalaceName[] {
  return Array.from(new Set(names));
}

function buildFocusContext(
  chart: ZiweiChart,
  targetPalaceName?: PalaceName,
): AnalysisFocusContext {
  if (!targetPalaceName) {
    return {
      tamHopPalaces: [],
      focusHighlights: [
        'Trọng tâm hiện tại là tổng quan mệnh bàn, ưu tiên các trục Mệnh, Thân, Tài Bạch, Quan Lộc.',
      ],
      referencedPalaces: [],
    };
  }

  const targetPalace = chart.palaces.find(palace => palace.palaceName === targetPalaceName);
  if (!targetPalace) {
    return {
      targetPalaceName,
      tamHopPalaces: [],
      focusHighlights: [
        `Không tìm thấy snapshot của cung ${targetPalaceName}; cần bám vào các dữ kiện mệnh bàn còn lại.`,
      ],
      referencedPalaces: [targetPalaceName],
    };
  }

  const tamHopPalaces = getTamHopPalaces(targetPalace, chart.palaces);
  const oppositePalace = chart.palaces[(targetPalace.chiIndex + 6) % 12];

  const targetSnapshot = buildPalaceSnapshot(targetPalace);
  const tamHopSnapshots = tamHopPalaces.map(buildPalaceSnapshot);
  const oppositeSnapshot = oppositePalace ? buildPalaceSnapshot(oppositePalace) : undefined;

  const focusHighlights = [
    `Cung ${targetSnapshot.palaceName} tọa ${targetSnapshot.diaChi}; ${describeStarGroup('chính tinh', targetSnapshot.mainStars)}; ${describeStarGroup('phụ tinh', targetSnapshot.auxStars)}.`,
    `Tam phương của ${targetSnapshot.palaceName} gồm ${tamHopSnapshots.map(snapshot => `${snapshot.palaceName} (${snapshot.diaChi})`).join(', ')}.`,
  ];

  if (oppositeSnapshot) {
    focusHighlights.push(
      `Cung xung chiếu là ${oppositeSnapshot.palaceName} (${oppositeSnapshot.diaChi}); ${describeStarGroup('chính tinh', oppositeSnapshot.mainStars)}.`,
    );
  }

  if (targetSnapshot.borrowedMainStars.length > 0 && targetSnapshot.mainStars.length === 0 && oppositeSnapshot) {
    focusHighlights.push(
      `Cung ${targetSnapshot.palaceName} vô chính diệu, cần mượn ${targetSnapshot.borrowedMainStars.join(', ')} từ ${oppositeSnapshot.palaceName}.`,
    );
  }

  const nearbySihua = [targetSnapshot, ...tamHopSnapshots, oppositeSnapshot]
    .filter((snapshot): snapshot is AiPalaceSnapshot => !!snapshot)
    .flatMap(snapshot => snapshot.sihua.map(item => `${snapshot.palaceName}: ${item}`));

  if (nearbySihua.length > 0) {
    focusHighlights.push(`Tứ Hóa quanh vùng trọng tâm: ${nearbySihua.join('; ')}.`);
  }

  return {
    targetPalaceName,
    targetPalace: targetSnapshot,
    tamHopPalaces: tamHopSnapshots,
    oppositePalace: oppositeSnapshot,
    focusHighlights,
    referencedPalaces: uniquePalaceNames([
      targetSnapshot.palaceName,
      ...tamHopSnapshots.map(snapshot => snapshot.palaceName),
      ...(oppositeSnapshot ? [oppositeSnapshot.palaceName] : []),
    ]),
  };
}

function buildChartHighlights(chart: ZiweiChart): string[] {
  const thanPalace = chart.palaces.find(palace => palace.isThanPalace);
  const menhPalace = chart.palaces.find(palace => palace.palaceName === 'Mệnh');
  const quanLocPalace = chart.palaces.find(palace => palace.palaceName === 'Quan Lộc');
  const taiBachPalace = chart.palaces.find(palace => palace.palaceName === 'Tài Bạch');

  const highlights = [
    `Mệnh đóng tại ${chart.cungMenhChi}; ${thanPalace ? `Thân cư ${thanPalace.palaceName} (${thanPalace.chi})` : `Thân tại ${chart.cungThanChi}`}; ${chart.tenCuc}; ${chart.amDuongLy}.`,
    `Bản mệnh ${chart.banMenh}; ${chart.amDuongNamNu}; ${chart.menhCucSinhKhac}.`,
  ];

  if (menhPalace) {
    highlights.push(`Cung Mệnh: ${describePalace(buildPalaceSnapshot(menhPalace))}.`);
  }

  if (quanLocPalace && taiBachPalace) {
    highlights.push(
      `Trục sự nghiệp - tài lộc: ${describePalace(buildPalaceSnapshot(quanLocPalace))}. ${describePalace(buildPalaceSnapshot(taiBachPalace))}.`,
    );
  }

  const sihuaHighlights = chart.palaces
    .map(palace => {
      const items = formatSihuaSummary(palace);
      return items.length > 0 ? `${palace.palaceName}: ${items.join(', ')}` : '';
    })
    .filter(Boolean);

  if (sihuaHighlights.length > 0) {
    highlights.push(`Các cung có Tứ Hóa nổi bật: ${sihuaHighlights.join('; ')}.`);
  }

  const voidPalaces = chart.palaces
    .filter(palace => palace.mainStars.length === 0)
    .map(palace => {
      const borrowed = palace.borrowedStars.length > 0
        ? `mượn ${palace.borrowedStars.map(formatMainStar).join(', ')}`
        : 'chưa có sao mượn';
      return `${palace.palaceName} (${borrowed})`;
    });

  if (voidPalaces.length > 0) {
    highlights.push(`Các cung vô chính diệu cần lưu ý: ${voidPalaces.join('; ')}.`);
  }

  return highlights;
}

function buildKeyPalaces(chart: ZiweiChart): AiPalaceSnapshot[] {
  const thanPalace = chart.palaces.find(palace => palace.isThanPalace);
  const importantNames: PalaceName[] = ['Mệnh', 'Quan Lộc', 'Tài Bạch'];

  if (thanPalace) {
    importantNames.push(thanPalace.palaceName);
  }

  return uniquePalaceNames(importantNames)
    .map(name => chart.palaces.find(palace => palace.palaceName === name))
    .filter((palace): palace is Palace => !!palace)
    .map(buildPalaceSnapshot);
}

function buildFocusPalaces(
  chart: ZiweiChart,
  focusContext: AnalysisFocusContext,
): AiPalaceSnapshot[] | undefined {
  if (!focusContext.targetPalaceName) {
    return undefined;
  }

  return uniquePalaceNames(focusContext.referencedPalaces)
    .map(name => chart.palaces.find(palace => palace.palaceName === name))
    .filter((palace): palace is Palace => !!palace)
    .map(buildPalaceSnapshot);
}

export class AnalysisContextBuilder {
  static buildInitialAnalysisContext(
    chart: ZiweiChart,
    targetPalaceName?: PalaceName,
    userQuestion?: string,
    bridgeContext?: AnalysisBridgeContext,
  ): AnalysisPromptContext {
    const thanPalace = chart.palaces.find(palace => palace.isThanPalace);
    const focusContext = buildFocusContext(chart, targetPalaceName);
    const focusPalaces = buildFocusPalaces(chart, focusContext);

    return {
      userIntent: {
        mode: 'initial_analysis',
        focusArea: targetPalaceName ?? 'overall',
        userQuestion,
      },
      chartFacts: {
        basicInfo: {
          ngaySinhDuongLich: `${chart.solarDate.day}/${chart.solarDate.month}/${chart.solarDate.year}`,
          ngaySinhAmLich: `${chart.lunarDate.day}/${chart.lunarDate.month}/${chart.lunarDate.year}${chart.lunarDate.isLeap ? ' (tháng nhuận)' : ''}`,
          gioDia: chart.lunarDate.hourChi,
          namCanChi: chart.namCanChi.displayName,
          gioiTinh: chart.gender === 'male' ? 'Nam' : 'Nữ',
          banMenh: chart.banMenh,
          nguHanhCuc: chart.tenCuc,
          amDuongLy: chart.amDuongLy,
          amDuongNamNu: chart.amDuongNamNu,
          menhCucSinhKhac: chart.menhCucSinhKhac,
          menhChu: chart.menhChu,
          thanChu: chart.thanChu,
          cungMenh: chart.cungMenhChi,
          cungThan: chart.cungThanChi,
          thanCuTaiCung: thanPalace?.palaceName ?? 'Mệnh',
        },
        keyPalaces: buildKeyPalaces(chart),
        ...(focusPalaces ? { focusPalaces } : {}),
      },
      derivedSignals: {
        chartHighlights: buildChartHighlights(chart),
        focusContext,
      },
      bridgeContext,
    };
  }

  static stringifyContext(context: AnalysisPromptContext): string {
    return JSON.stringify(context, null, 2);
  }
}
