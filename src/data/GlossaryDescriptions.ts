import type {
  AmDuongLy,
  MenhCucRelation,
  PalaceName,
  TenCuc,
} from '../core/types/ZiweiTypes';
import { PALACE_NAMES_ORDER } from '../core/types/ZiweiTypes';
import { getStarDescription } from './StarDescriptions';

const PALACE_DESC: Record<PalaceName, string> = {
  'Mệnh': 'Cung gốc của lá số, chủ về khí chất bẩm sinh, hình tướng, cá tính, cách phản ứng trước đời và hướng vận hành chung của bản thân. Đây là điểm xuất phát để đọc toàn cục, nhưng không nên tách rời khỏi Thân, Quan Lộc, Tài Bạch, Thiên Di và tam phương tứ chính.',
  'Phụ Mẫu': 'Chủ về cha mẹ, người nuôi dưỡng, nền giáo dưỡng, phúc ấm từ bề trên và mối quan hệ với người có vai trò dìu dắt. Ngoài nghĩa huyết thống, cung này còn phản ánh cách đương số tiếp nhận khuôn phép, quyền uy và sự nâng đỡ từ thế hệ trước.',
  'Phúc Đức': 'Gốc phúc của dòng họ, nền tinh thần, nội lực chịu đựng, đời sống tâm thức và hậu thuẫn vô hình phía sau cuộc đời. Cung này đẹp thì tâm dễ yên, gia tộc có lực đỡ; yếu thì hay lao tâm, khó thấy bình an dù bề ngoài vẫn có thành tựu.',
  'Điền Trạch': 'Chủ về nhà cửa, đất đai, bất động sản, môi trường sinh sống, nếp sinh hoạt gia cư và khả năng giữ gìn cơ nghiệp. Không chỉ xét tài sản cố định, cung này còn cho thấy cảm giác an cư, mức ổn định của tổ ấm và duyên với nơi chốn.',
  'Quan Lộc': 'Chủ về nghề nghiệp, công danh, vai trò xã hội, tham vọng lập thân và cách đương số làm việc để tạo vị thế. Khi luận cung này cần nhìn cả năng lực gánh trách nhiệm, kiểu môi trường hợp mệnh và con đường phát triển sự nghiệp lâu dài.',
  'Nô Bộc': 'Chủ về bạn bè, đồng nghiệp, đối tác, cấp dưới, người cộng tác và mạng lưới xã hội có tính làm việc cùng nhau. Cung này mạnh thì dễ gặp người hỗ trợ đúng việc; xấu thì dễ bị liên lụy, khó nhờ cậy hoặc quan hệ qua lại thiếu bền.',
  'Thiên Di': 'Chủ về môi trường bên ngoài, khả năng ra đời lập nghiệp, xuất hành, giao tiếp xã hội, hình ảnh khi bước ra khỏi vùng an toàn và các tác động từ ngoại cảnh. Đây cũng là cung hay dùng để xét quý nhân, cơ hội, va chạm và độ thích ứng với thế giới rộng hơn.',
  'Tật Ách': 'Chủ về bệnh tật, điểm yếu thân thể, stress, thương tổn, tai nạn và những vùng dễ tích tụ áp lực của đời sống. Ngoài nghĩa sức khỏe, cung này còn cho thấy cách đương số đối diện khủng hoảng, mặt bóng tâm lý và những thứ khó nói thành lời.',
  'Tài Bạch': 'Chủ về tiền bạc, cách kiếm tiền, nhịp thu chi, khả năng xoay vốn và thái độ của đương số với vật chất. Đây là cung của dòng tiền vận hành thực tế, nên phải đọc cùng Mệnh, Quan Lộc, Điền Trạch và Phúc Đức mới biết tài khí bền hay chỉ là cơ hội thoáng qua.',
  'Tử Tức': 'Chủ về con cái, chuyện sinh nở, sự tiếp nối, hậu duệ và những gì mình tạo ra để truyền lại. Trong cách đọc rộng, cung này còn phản ánh học trò, người chịu ảnh hưởng từ mình và cả năng lực sinh thành các “đứa con tinh thần” như dự án, tác phẩm hay hệ giá trị.',
  'Phu Thê': 'Chủ về hôn phối, người bạn đời, quan hệ gắn bó một đối một và cách đương số bước vào đời sống đôi lứa hay hợp tác dài hạn. Khi luận cần xét cả sức hút, mẫu người dễ gặp, kiểu ràng buộc trong quan hệ và bài học cân bằng giữa bản thân với đối phương.',
  'Huynh Đệ': 'Chủ về anh chị em, người ngang hàng, bạn đồng lứa, đồng môn và năng lực phối hợp với những người ở thế “vai ngang”. Cung này cũng phản ánh chuyện nâng đỡ hay cạnh tranh trong nội bộ gần gũi, mức hòa hợp và cảm giác có người cùng phe hay không.',
};

const CUC_DESC: Record<TenCuc, string> = {
  'Thủy Nhị Cục': 'Một dạng Cục thiên về lưu động, thích ứng, xoay chuyển và phản ứng nhanh với hoàn cảnh. Khi đi đúng hướng thì linh hoạt, biết biến nguy thành cơ; khi lệch dễ thành thiếu ổn định, cảm xúc và cuộc sống lên xuống theo hoàn cảnh.',
  'Mộc Tam Cục': 'Một dạng Cục thiên về sinh trưởng, mở rộng, học hỏi và phát triển từng bước. Thường hợp con đường cần bồi đắp lâu dài, lấy tăng trưởng làm gốc; đi xấu thì dễ ôm đồm, phát tán lực hoặc phát triển thiếu kỷ luật.',
  'Kim Tứ Cục': 'Một dạng Cục thiên về kỷ luật, chuẩn mực, quyết đoán và khả năng định hình khuôn phép. Hợp lối đi rõ ràng, có cấu trúc, làm việc bằng nguyên tắc; lệch cách thì thành khô cứng, khó mềm hóa hay quá nặng thắng thua đúng sai.',
  'Thổ Ngũ Cục': 'Một dạng Cục thiên về tích lũy, ổn định, bền bỉ và gây dựng từng lớp nền chắc chắn. Hợp với con đường chậm mà chắc, biết giữ thành quả; đi xấu thì thành trì trệ, lo giữ hơn lo tiến và dễ mang gánh nặng trách nhiệm lâu dài.',
  'Hỏa Lục Cục': 'Một dạng Cục thiên về phát động, bứt tốc, nhiệt tâm và khả năng khai mở mạnh. Hợp môi trường cần quyết liệt, tiên phong, tạo thế; nếu mất cân bằng dễ nóng vội, lên nhanh xuống nhanh hoặc tự đốt lực của chính mình.',
};

const AM_DUONG_NAM_NU_DESC: Record<string, string> = {
  'Dương Nam': 'Cho biết đương số là Nam mệnh có Thiên Can năm sinh thuộc Dương. Trong hệ thống hiện tại, nhóm này đi thuận khi an đại hạn và vòng Tràng Sinh, nên thường nhấn vào khuynh hướng chủ động phát triển theo chiều mở ra bên ngoài.',
  'Âm Nam': 'Cho biết đương số là Nam mệnh có Thiên Can năm sinh thuộc Âm. Trong hệ thống hiện tại, nhóm này đi nghịch khi an đại hạn và vòng Tràng Sinh, nên thường nhấn vào lối phát triển thận trọng hơn, nhiều bước vòng và dễ trải nghiệm bài học qua lực cản.',
  'Dương Nữ': 'Cho biết đương số là Nữ mệnh có Thiên Can năm sinh thuộc Dương. Trong hệ thống hiện tại, nhóm này đi nghịch khi an đại hạn và vòng Tràng Sinh, nên đời sống thường dễ biểu lộ mâu thuẫn giữa xung lực tiến lên với nhu cầu điều chỉnh cho hợp thời.',
  'Âm Nữ': 'Cho biết đương số là Nữ mệnh có Thiên Can năm sinh thuộc Âm. Trong hệ thống hiện tại, nhóm này đi thuận khi an đại hạn và vòng Tràng Sinh, nên thường nhấn vào nhịp phát triển nhu hòa hơn nhưng có độ liền mạch và tích lũy rõ nếu gặp đúng môi trường.',
};

const AM_DUONG_LY_DESC: Record<AmDuongLy, string> = {
  'Âm dương thuận lý': 'Chỉ trạng thái khí Âm Dương của năm sinh tương ứng với tính Âm Dương của vị trí cung Mệnh. Theo cách đọc cổ điển, đây là thế dễ “ăn khớp” hơn giữa khí nền và chỗ Mệnh tọa, nên việc thể hiện bản thân thường ít nghịch chiều hơn.',
  'Âm dương nghịch lý': 'Chỉ trạng thái khí Âm Dương của năm sinh không đồng chiều với tính Âm Dương của vị trí cung Mệnh. Điều này không mặc định là xấu, nhưng thường báo hiệu hành trình phải qua va chạm, sửa cách sống hoặc tự điều chỉnh nhiều hơn mới ổn.',
};

const MENH_CUC_RELATION_DESC: Record<MenhCucRelation, string> = {
  'Cục sinh Bản Mệnh': 'Ngũ hành của Cục sinh cho ngũ hành Bản Mệnh. Thường hiểu là môi trường, thế cuộc hoặc nhịp vận hành của lá số có xu hướng nâng đỡ bản thân, giúp đương số dễ nhận lực từ bên ngoài hơn.',
  'Cục hòa Bản Mệnh': 'Ngũ hành của Cục đồng hành với Bản Mệnh. Đây là thế khá quân bình giữa chất người và chất hoàn cảnh, đời sống thường bớt cực đoan hơn, dễ ổn định nếu biết đi đúng đường.',
  'Bản Mệnh sinh Cục': 'Ngũ hành Bản Mệnh sinh cho ngũ hành Cục. Thường phải lấy sức mình nuôi việc, nuôi hoàn cảnh hoặc gánh phần chủ động nhiều hơn; được cái là dễ thành người biết khai mở, nhưng hay hao lực nếu ôm quá nhiều.',
  'Bản Mệnh khắc Cục': 'Ngũ hành Bản Mệnh khắc ngũ hành Cục. Thường thấy cá tính muốn ép hoàn cảnh theo ý mình, có sức phá khuôn và cải biến, nhưng cũng dễ mệt vì va chạm môi trường hoặc vì đi ngược dòng quá sớm.',
  'Cục khắc Bản Mệnh': 'Ngũ hành Cục khắc ngũ hành Bản Mệnh. Thường báo hiệu môi trường đặt sức ép khá mạnh lên bản thân, khiến thành tựu phải đổi bằng rèn luyện, nhẫn nại và khả năng chọn trận địa cho đúng.',
};

const TERM_DESC: Record<string, string> = {
  'Cung Thân': 'Cung Thân được xem là phần hậu thiên và phần “người thật đang sống” của đương số, chủ về hành vi, sức gánh, ý chí nhập đời và lĩnh vực dồn nhiều tâm lực khi trưởng thành. Thân cư cung nào thì cung đó thành điểm nhấn mạnh hơn trong hành trình thực tế của đời người.',
  'Bản Mệnh': 'Trên lá số này, Bản Mệnh là Nạp Âm của năm sinh, phản ánh chất ngũ hành bẩm sinh và lớp khí nền của đương số. Nó không đồng nghĩa với Cung Mệnh hay Mệnh Cục, mà là một trục riêng dùng để đối chiếu sinh khắc với Cục và các tín hiệu vận hành khác.',
  'Mệnh Cục': 'Mệnh Cục là tên gọi gộp cho Ngũ Hành Cục của lá số, phản ánh “thế vận hành” hay loại môi trường năng lượng mà Mệnh đang đi vào. Khi luận, Cục cho biết nhịp phát triển của đời người thiên về động hay tĩnh, nhanh hay chậm, tích lũy hay bứt phá.',
  'Âm Dương': 'Nhóm Âm Dương Nam Nữ cho biết tổ hợp giữa tính Âm/Dương của Thiên Can năm sinh với giới tính đương số. Trong hệ thống hiện tại, nó còn quyết định chiều đi thuận hay nghịch khi an Đại Hạn và Tràng Sinh.',
  'Mệnh Chủ': 'Mệnh Chủ là sao chủ của Cung Mệnh theo địa chi nơi Mệnh đóng. Nó không thay thế chính tinh thủ Mệnh, mà đóng vai trò như một “tông khí” nền giúp nhận ra mạch vận hành bẩm sinh, lối phản ứng cốt lõi và sắc thái nội tại của mệnh cách.',
  'Thân Chủ': 'Thân Chủ là sao chủ của phần Thân, dùng để gợi ra cách vận động của đời sống hậu thiên, khí lực hành động và kiểu biểu hiện khi đương số bước sâu vào thực tế. Khi phối cùng Cung Thân và chính tinh liên quan, nó giúp nhìn rõ lối ứng xử ngoài đời hơn.',
  'Đại Hạn': 'Đại Hạn là chu kỳ 10 năm của đời người, được an sẵn trên 12 cung để cho biết mỗi thập kỷ sẽ đi qua trọng tâm nào. Khi đọc đại hạn, phải xét cung đó, chính tinh, phụ tinh, tam phương tứ chính và sự sinh khắc với mệnh cục chứ không đọc mỗi con số tuổi.',
  'Tiểu Hạn': 'Tiểu Hạn hay Tiểu Vận là lớp vận trình của từng năm cụ thể. Nó không thay thế Đại Hạn mà dùng để soi điểm nổi lên trong một năm, giúp biết thời điểm nào cơ hội hoặc thử thách của một cung được kích hoạt rõ hơn.',
  'Tràng Sinh': 'Vòng Tràng Sinh là chu trình 12 trạng thái khí của ngũ hành, từ lúc phát sinh đến cực thịnh rồi suy, tuyệt và tái sinh. Đây là lớp khí nền cho từng cung, cho biết cung ấy đang nhận dạng sinh lực nào; nó cần được đọc cùng sao và cung, không nên tách riêng để kết luận.',
  'Tam Phương Tứ Chính': 'Một cung không nên luận riêng lẻ mà phải xét cả tam phương tứ chính: bản cung, hai cung tam hợp và cung xung chiếu. Đây là khung phối hợp quan trọng nhất để biết lực hỗ trợ, lực đối trọng và mạch nghiệp quả qua lại giữa các cung.',
  'Tam Phương': 'Tam phương là hai cung nằm trong thế tam hợp với bản cung, thường được xem như hai chân phụ trợ quan trọng cho cung đang xét. Khi tam phương đẹp, bản cung được nâng đỡ mạnh; khi tam phương xấu, bản cung khó tự đứng vững dù tự thân không quá tệ.',
  'Tam Hợp': 'Tam hợp là nhóm ba địa chi cùng một khí cục: Thân - Tý - Thìn, Tỵ - Dậu - Sửu, Dần - Ngọ - Tuất, Hợi - Mão - Mùi. Trong lá số, các cung cùng tam hợp thường tạo thành mạch ảnh hưởng hỗ trợ hoặc cộng hưởng rất rõ với nhau.',
  'Xung Chiếu': 'Xung chiếu là cung nằm đối diện trực diện với bản cung. Nó giống như tấm gương hay lực đối ứng, vừa gây áp lực vừa cho thêm dữ kiện để hiểu đúng bản cung, nhất là khi cung đó vô chính diệu hoặc bản thân tín hiệu đang mâu thuẫn.',
  'Vô Chính Diệu': 'Cung Vô Chính Diệu là cung không có chính tinh tọa thủ. Loại cung này không phải “trống rỗng”, mà phải đọc kỹ phụ tinh, sao hội chiếu, tam phương tứ chính và đặc biệt là chính tinh mượn từ cung xung chiếu để luận đúng lực của nó.',
  'Mượn Chính Tinh': 'Khi một cung vô chính diệu, người luận thường mượn chính tinh từ cung xung chiếu để làm điểm tựa giải thích. Việc “mượn” không có nghĩa là cung đó biến thành cung đối diện, mà là nó tiếp nhận lực dẫn giải mạnh từ phía đối cung.',
  'Cung Vị': 'Cung vị là khung 12 địa chi cố định của lá số. Bản thân cung vị không tự nói cát hung, nhưng nó là nền không gian để an cung chức, an sao và xác định các mối quan hệ như tam hợp, xung chiếu hay vòng trường sinh.',
  'Cung Chức': 'Cung chức là tên chức năng gán vào một cung vị cụ thể, như Mệnh, Quan Lộc hay Phu Thê. Cùng là một vị trí địa chi, nhưng khi được gán cung chức khác nhau thì đối tượng được luận cũng đổi theo.',
};

const TERM_ALIASES: Record<string, string> = {
  'Thân': 'Cung Thân',
  'Cục': 'Mệnh Cục',
  'Đại Vận': 'Đại Hạn',
  'Tiểu Vận': 'Tiểu Hạn',
  'VCD': 'Vô Chính Diệu',
  'Mượn Sao': 'Mượn Chính Tinh',
  'Tam Hợp Cục': 'Tam Hợp',
  'Cung Xung Chiếu': 'Xung Chiếu',
};

const STAR_BACKED_TERMS = new Set<string>([
  'Hóa Lộc',
  'Hóa Quyền',
  'Hóa Khoa',
  'Hóa Kỵ',
  'Trường Sinh',
  'Mộc Dục',
  'Quan Đới',
  'Lâm Quan',
  'Đế Vượng',
  'Suy',
  'Bệnh',
  'Tử',
  'Mộ',
  'Tuyệt',
  'Thai',
  'Dưỡng',
  'Tuần',
  'Tuần Không',
  'Triệt',
  'Triệt Không',
]);

const UNKNOWN_GLOSSARY_MARKER = 'chưa có ghi chú riêng';

export const KNOWN_GLOSSARY_TERMS: string[] = [
  ...PALACE_NAMES_ORDER,
  ...Object.keys(CUC_DESC),
  ...Object.keys(AM_DUONG_NAM_NU_DESC),
  ...Object.keys(AM_DUONG_LY_DESC),
  ...Object.keys(MENH_CUC_RELATION_DESC),
  ...Object.keys(TERM_DESC),
  ...Object.keys(TERM_ALIASES),
  ...STAR_BACKED_TERMS,
];

function normalizeGlossaryTerm(name: string): string {
  const cleanName = name.replace(/\[.*?\]|\(.*?\)/g, '').trim();
  return TERM_ALIASES[cleanName] ?? cleanName;
}

export function resolveGlossaryTerm(name: string): string {
  return normalizeGlossaryTerm(name);
}

export function getGlossaryDescription(name: string): string {
  const normalized = normalizeGlossaryTerm(name);

  if ((PALACE_DESC as Record<string, string>)[normalized]) {
    return (PALACE_DESC as Record<string, string>)[normalized];
  }

  if ((CUC_DESC as Record<string, string>)[normalized]) {
    return (CUC_DESC as Record<string, string>)[normalized];
  }

  if (AM_DUONG_NAM_NU_DESC[normalized]) {
    return AM_DUONG_NAM_NU_DESC[normalized];
  }

  if ((AM_DUONG_LY_DESC as Record<string, string>)[normalized]) {
    return (AM_DUONG_LY_DESC as Record<string, string>)[normalized];
  }

  if ((MENH_CUC_RELATION_DESC as Record<string, string>)[normalized]) {
    return (MENH_CUC_RELATION_DESC as Record<string, string>)[normalized];
  }

  if (TERM_DESC[normalized]) {
    return TERM_DESC[normalized];
  }

  if (STAR_BACKED_TERMS.has(normalized)) {
    return getStarDescription(normalized);
  }

  return `"${normalized}" là một nhãn học thuật trên lá số, nhưng hiện ${UNKNOWN_GLOSSARY_MARKER}.`;
}

export { UNKNOWN_GLOSSARY_MARKER };
