import {
  PALACE_NAMES_ORDER,
  type InsightKind,
  type InsightExploreGroup,
  type InsightPayload,
  type InsightRelatedItem,
  type InsightSection,
  type InsightStarSelection,
  type InsightTag,
  type InsightTermSelection,
  type Palace,
  type PalaceName,
  type Star,
  type StarCategory,
  type ZiweiChart,
} from '../core/types/ZiweiTypes';
import { getGlossaryDescription, resolveGlossaryTerm } from './GlossaryDescriptions';
import { getGlossaryInsightProfile, getStarInsightProfile } from './InsightProfiles';
import { getStarDescription } from './StarDescriptions';

const STATE_MARKER_TERMS = new Set<string>([
  'Cung Thân',
  'Mệnh Chủ',
  'Thân Chủ',
  'Đại Hạn',
  'Tiểu Hạn',
  'Tràng Sinh',
  'Vô Chính Diệu',
  'Mượn Chính Tinh',
  'Hóa Lộc',
  'Hóa Quyền',
  'Hóa Khoa',
  'Hóa Kỵ',
  'Tuần',
  'Tuần Không',
  'Triệt',
  'Triệt Không',
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
]);

const TRANG_SINH_SEQUENCE = [
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
] as const;

const TRANG_SINH_PHASE_SUMMARY: Record<string, string> = {
  'Trường Sinh': 'khởi sinh và mở mầm',
  'Mộc Dục': 'uốn nắn, dễ dao động và dễ hấp thụ ảnh hưởng',
  'Quan Đới': 'định hình hình thức và bắt đầu mang vai trò',
  'Lâm Quan': 'ra thế, đứng vào guồng hành động',
  'Đế Vượng': 'cực thịnh, cực mạnh và rất dễ bộc lộ bản ngã',
  'Suy': 'bắt đầu giảm lực và đi vào pha tiết chế',
  'Bệnh': 'hao mòn, yếu khí và dễ lộ điểm nhược',
  'Tử': 'khép một vòng lực và ngả sang tính tĩnh',
  'Mộ': 'tàng chứa, gom lại và bảo lưu',
  'Tuyệt': 'đứt đoạn, phá mạch cũ để chuẩn bị chu kỳ mới',
  'Thai': 'kết mầm, mới hình thành và còn non yếu',
  'Dưỡng': 'nuôi dưỡng, bồi nền và chờ đủ lực để phát',
};

const PALACE_CROSS_READ_MAP: Record<PalaceName, PalaceName[]> = {
  'Mệnh': ['Thiên Di', 'Quan Lộc', 'Tài Bạch', 'Phúc Đức'],
  'Phụ Mẫu': ['Mệnh', 'Phúc Đức', 'Điền Trạch'],
  'Phúc Đức': ['Mệnh', 'Phu Thê', 'Thiên Di'],
  'Điền Trạch': ['Phúc Đức', 'Tài Bạch', 'Quan Lộc'],
  'Quan Lộc': ['Mệnh', 'Tài Bạch', 'Thiên Di'],
  'Nô Bộc': ['Quan Lộc', 'Thiên Di', 'Phu Thê'],
  'Thiên Di': ['Mệnh', 'Nô Bộc', 'Quan Lộc'],
  'Tật Ách': ['Mệnh', 'Phúc Đức', 'Thiên Di'],
  'Tài Bạch': ['Mệnh', 'Quan Lộc', 'Điền Trạch'],
  'Tử Tức': ['Phu Thê', 'Phúc Đức', 'Điền Trạch'],
  'Phu Thê': ['Mệnh', 'Phúc Đức', 'Thiên Di'],
  'Huynh Đệ': ['Mệnh', 'Phúc Đức', 'Tài Bạch'],
};

type StarFamilyMeta = {
  family: string;
  summary: string;
  peers: string[];
  keywords?: string[];
};

const STAR_CATEGORY_LABELS: Record<StarCategory, string> = {
  main: 'Nhóm chính tinh',
  cat: 'Cát tinh',
  sha: 'Sát tinh',
  fixed: 'Sao cố định',
  support: 'Trợ tinh',
  other: 'Phụ tinh',
};

const STAR_CATEGORY_SECTIONS: Record<StarCategory, InsightSection> = {
  main: {
    title: 'Vị trí trong hệ sao',
    body: 'Đây là chính tinh, tức lớp sao trục chính của cung. Chính tinh quyết định khí lớn và vai trò cốt lõi của cung, còn phụ tinh sẽ làm rõ, sửa sắc hoặc khuếch đại cách biểu hiện của nó.',
  },
  cat: {
    title: 'Vị trí trong hệ sao',
    body: 'Đây là cát tinh, thường không tự thay thế vai trò của chính tinh nhưng có tác dụng nâng cách, mở cơ hội, thêm trợ lực và làm bề mặt của cung sáng hơn. Giá trị của nó thường thấy rõ nhất khi đi cùng chính tinh sáng sủa hoặc bố cục đủ nền.',
  },
  sha: {
    title: 'Vị trí trong hệ sao',
    body: 'Đây là sát tinh, tức nhóm sao tạo va chạm, cắt lực, áp lực hoặc biến cố. Sát tinh không phải lúc nào cũng chỉ mang nghĩa xấu tuyệt đối; trong cách cục mạnh, nó còn cho gan lực, bản lĩnh và sức bứt ra khỏi trì trệ, nhưng cái giá thường là căng hơn người khác.',
  },
  fixed: {
    title: 'Vị trí trong hệ sao',
    body: 'Đây là sao cố định hoặc sao có tính chất khá đặc thù. Khi đọc nhóm này, nên chú trọng ngữ cảnh cung và các sao hội hợp, vì chúng thường phát tác như một tín hiệu bổ nghĩa rõ nét hơn là một trục khí độc lập.',
  },
  support: {
    title: 'Vị trí trong hệ sao',
    body: 'Đây là trợ tinh, thiên về nâng đỡ, phối hợp và làm mịn cách cục. Nhóm sao này phát huy mạnh khi đứng cạnh đúng chính tinh hoặc đúng lĩnh vực mà cung đang phải triển khai ngoài đời.',
  },
  other: {
    title: 'Vị trí trong hệ sao',
    body: 'Đây là phụ tinh mang tính bổ nghĩa. Muốn đọc đúng nên xem nó đang làm gì với chính tinh, với trạng thái cung và với tam phương tứ chính hơn là đọc độc lập như một dấu hiệu hoàn chỉnh.',
  },
};

const STAR_FAMILY_METADATA: Record<string, StarFamilyMeta> = {
  'Tả Phù': {
    family: 'Tả Hữu',
    summary: 'Bộ Tả Hữu là cặp sao phò tá, tượng trưng cho người trợ lực, cộng sự và sức nâng đỡ thực tế lẫn chiến lược. Khi bộ này sáng, nó giúp chính tinh bớt cô quân và tăng lực tổ chức.',
    peers: ['Hữu Bật'],
    keywords: ['Tả Hữu'],
  },
  'Hữu Bật': {
    family: 'Tả Hữu',
    summary: 'Bộ Tả Hữu là cặp sao phò tá, tượng trưng cho người trợ lực, cộng sự và sức nâng đỡ thực tế lẫn chiến lược. Khi bộ này sáng, nó giúp chính tinh bớt cô quân và tăng lực tổ chức.',
    peers: ['Tả Phù'],
    keywords: ['Tả Hữu'],
  },
  'Thiên Khôi': {
    family: 'Khôi Việt',
    summary: 'Khôi Việt là bộ quý nhân, thường đem tới cơ hội, sự nâng đỡ và những cánh cửa mở ra đúng lúc. Bộ này rất hay đi cùng học vấn, danh vị và các bước bật lên nhờ người trên hoặc môi trường tốt.',
    peers: ['Thiên Việt'],
    keywords: ['Khôi Việt', 'Quý nhân tinh'],
  },
  'Thiên Việt': {
    family: 'Khôi Việt',
    summary: 'Khôi Việt là bộ quý nhân, thường đem tới cơ hội, sự nâng đỡ và những cánh cửa mở ra đúng lúc. Bộ này rất hay đi cùng học vấn, danh vị và các bước bật lên nhờ người trên hoặc môi trường tốt.',
    peers: ['Thiên Khôi'],
    keywords: ['Khôi Việt', 'Quý nhân tinh'],
  },
  'Văn Xương': {
    family: 'Xương Khúc',
    summary: 'Xương Khúc là bộ văn tinh nổi tiếng về học hành, tài hoa, thi cử, biểu đạt và danh tiếng nhờ năng lực tri thức. Khi đứng đúng cách, bộ này làm sáng hẳn mặt văn minh, học thuật và khả năng truyền đạt.',
    peers: ['Văn Khúc'],
    keywords: ['Xương Khúc', 'Văn tinh'],
  },
  'Văn Khúc': {
    family: 'Xương Khúc',
    summary: 'Xương Khúc là bộ văn tinh nổi tiếng về học hành, tài hoa, thi cử, biểu đạt và danh tiếng nhờ năng lực tri thức. Khi đứng đúng cách, bộ này làm sáng hẳn mặt văn minh, học thuật và khả năng truyền đạt.',
    peers: ['Văn Xương'],
    keywords: ['Xương Khúc', 'Văn tinh'],
  },
  'Kình Dương': {
    family: 'Kình Đà',
    summary: 'Kình Đà là bộ huyết sát, nổi bật ở va chạm, hình thương, cản trở và xung lực rất mạnh. Khi gặp cách cục cứng cáp, bộ này còn cho gan lực, độ lì và khả năng chịu áp lực cao.',
    peers: ['Đà La'],
    keywords: ['Kình Đà', 'Lục Sát'],
  },
  'Đà La': {
    family: 'Kình Đà',
    summary: 'Kình Đà là bộ huyết sát, nổi bật ở va chạm, hình thương, cản trở và xung lực rất mạnh. Khi gặp cách cục cứng cáp, bộ này còn cho gan lực, độ lì và khả năng chịu áp lực cao.',
    peers: ['Kình Dương'],
    keywords: ['Kình Đà', 'Lục Sát'],
  },
  'Hỏa Tinh': {
    family: 'Hỏa Linh',
    summary: 'Hỏa Linh là bộ sát tinh thiên về bộc phát, tăng nhiệt, làm cục diện chuyển rất nhanh và khá gắt. Trong lá số mạnh, bộ này có thể trở thành năng lượng xung kích; trong lá số yếu, nó dễ thành tai họa hoặc quyết định nóng.',
    peers: ['Linh Tinh'],
    keywords: ['Hỏa Linh', 'Lục Sát'],
  },
  'Linh Tinh': {
    family: 'Hỏa Linh',
    summary: 'Hỏa Linh là bộ sát tinh thiên về bộc phát, tăng nhiệt, làm cục diện chuyển rất nhanh và khá gắt. Trong lá số mạnh, bộ này có thể trở thành năng lượng xung kích; trong lá số yếu, nó dễ thành tai họa hoặc quyết định nóng.',
    peers: ['Hỏa Tinh'],
    keywords: ['Hỏa Linh', 'Lục Sát'],
  },
  'Địa Không': {
    family: 'Không Kiếp',
    summary: 'Không Kiếp là bộ sát tinh phá cục rất mạnh, chủ trống rỗng, đứt nền, mất mát và các cú đảo chiều. Bộ sao này thường đòi hỏi phải đọc bằng toàn cục, vì hiệu ứng của nó thay đổi nhiều theo chính tinh và thế đứng.',
    peers: ['Địa Kiếp'],
    keywords: ['Không Kiếp', 'Lục Sát'],
  },
  'Địa Kiếp': {
    family: 'Không Kiếp',
    summary: 'Không Kiếp là bộ sát tinh phá cục rất mạnh, chủ trống rỗng, đứt nền, mất mát và các cú đảo chiều. Bộ sao này thường đòi hỏi phải đọc bằng toàn cục, vì hiệu ứng của nó thay đổi nhiều theo chính tinh và thế đứng.',
    peers: ['Địa Không'],
    keywords: ['Không Kiếp', 'Lục Sát'],
  },
  'Lộc Tồn': {
    family: 'Lộc Mã',
    summary: 'Lộc Tồn đi cùng Thiên Mã thường tạo thành mạch lộc do dịch chuyển, xoay việc và biết nắm thời cơ mà ra. Khi đứng đúng cách, đây là bộ sao rất đáng chú ý về tài lực và nhịp bứt tiến ngoài thực tế.',
    peers: ['Thiên Mã'],
    keywords: ['Lộc Mã'],
  },
  'Thiên Mã': {
    family: 'Lộc Mã',
    summary: 'Thiên Mã đi cùng Lộc Tồn thường tạo thành mạch lộc do dịch chuyển, xoay việc và biết nắm thời cơ mà ra. Khi đứng đúng cách, đây là bộ sao rất đáng chú ý về tài lực và nhịp bứt tiến ngoài thực tế.',
    peers: ['Lộc Tồn'],
    keywords: ['Lộc Mã'],
  },
  'Đào Hoa': {
    family: 'Tam Minh',
    summary: 'Đào Hồng Hỷ là bộ Tam Minh, làm tăng sức sáng về nhân duyên, cảm tình, hỷ khí và khả năng được chú ý. Nếu đi cùng cát tinh, bộ này tăng duyên; nếu đi với sát khí, nó lại dễ làm chuyện tình cảm trở thành chỗ vướng lớn.',
    peers: ['Hồng Loan', 'Thiên Hỷ'],
    keywords: ['Tam Minh'],
  },
  'Hồng Loan': {
    family: 'Tam Minh',
    summary: 'Đào Hồng Hỷ là bộ Tam Minh, làm tăng sức sáng về nhân duyên, cảm tình, hỷ khí và khả năng được chú ý. Nếu đi cùng cát tinh, bộ này tăng duyên; nếu đi với sát khí, nó lại dễ làm chuyện tình cảm trở thành chỗ vướng lớn.',
    peers: ['Đào Hoa', 'Thiên Hỷ'],
    keywords: ['Tam Minh'],
  },
  'Thiên Hỷ': {
    family: 'Tam Minh',
    summary: 'Đào Hồng Hỷ là bộ Tam Minh, làm tăng sức sáng về nhân duyên, cảm tình, hỷ khí và khả năng được chú ý. Nếu đi cùng cát tinh, bộ này tăng duyên; nếu đi với sát khí, nó lại dễ làm chuyện tình cảm trở thành chỗ vướng lớn.',
    peers: ['Đào Hoa', 'Hồng Loan'],
    keywords: ['Tam Minh'],
  },
  'Long Trì': {
    family: 'Long Phượng',
    summary: 'Long Phượng là bộ sao thanh quý, nhấn mạnh phong thái, nhan sắc, tài nghệ và danh đến từ khí chất. Nhiều sách cũng xem đây là bộ sao cho tiếng tăm, nhất là khi gặp thêm Xương Khúc hoặc Khôi Việt.',
    peers: ['Phượng Các'],
    keywords: ['Long Phượng', 'Tứ Linh'],
  },
  'Phượng Các': {
    family: 'Long Phượng',
    summary: 'Long Phượng là bộ sao thanh quý, nhấn mạnh phong thái, nhan sắc, tài nghệ và danh đến từ khí chất. Nhiều sách cũng xem đây là bộ sao cho tiếng tăm, nhất là khi gặp thêm Xương Khúc hoặc Khôi Việt.',
    peers: ['Long Trì'],
    keywords: ['Long Phượng', 'Tứ Linh'],
  },
  'Ân Quang': {
    family: 'Quang Quý',
    summary: 'Quang Quý là bộ sao phúc quý, nghiêng về danh dự, được tưởng thưởng, được ân sủng hoặc được nâng theo cách tinh tế. Khác với Tả Hữu là trợ lực trực tiếp, bộ này thường mang màu “được chiếu cố” hơn.',
    peers: ['Thiên Quý'],
    keywords: ['Quang Quý'],
  },
  'Thiên Quý': {
    family: 'Quang Quý',
    summary: 'Quang Quý là bộ sao phúc quý, nghiêng về danh dự, được tưởng thưởng, được ân sủng hoặc được nâng theo cách tinh tế. Khác với Tả Hữu là trợ lực trực tiếp, bộ này thường mang màu “được chiếu cố” hơn.',
    peers: ['Ân Quang'],
    keywords: ['Quang Quý'],
  },
  'Thiên Đức': {
    family: 'Tứ Đức',
    summary: 'Tứ Đức gồm Thiên Đức, Nguyệt Đức, Long Đức và Phúc Đức, là nhóm sao thiên về lòng thiện, phúc hậu, đoan chính và khả năng giảm bớt độ gay gắt của cục diện. Bộ này đặc biệt hữu ích khi đọc các cung dễ bị đào hoa hoặc sát khí làm lệch.',
    peers: ['Nguyệt Đức', 'Long Đức', 'Phúc Đức'],
    keywords: ['Tứ Đức'],
  },
  'Nguyệt Đức': {
    family: 'Tứ Đức',
    summary: 'Tứ Đức gồm Thiên Đức, Nguyệt Đức, Long Đức và Phúc Đức, là nhóm sao thiên về lòng thiện, phúc hậu, đoan chính và khả năng giảm bớt độ gay gắt của cục diện. Bộ này đặc biệt hữu ích khi đọc các cung dễ bị đào hoa hoặc sát khí làm lệch.',
    peers: ['Thiên Đức', 'Long Đức', 'Phúc Đức'],
    keywords: ['Tứ Đức'],
  },
  'Hóa Lộc': {
    family: 'Tứ Hóa',
    summary: 'Tứ Hóa là nhóm hóa khí làm nổi rõ mặt phát triển, quyền thế, danh tín và bài học nghiệp của sao gốc. Khi nhiều hóa khí liên kết đẹp, lá số thường có điểm bật rất rõ; khi lệch, chúng cũng làm mâu thuẫn lộ ra nhanh hơn.',
    peers: ['Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'],
    keywords: ['Tứ Hóa'],
  },
  'Hóa Quyền': {
    family: 'Tứ Hóa',
    summary: 'Tứ Hóa là nhóm hóa khí làm nổi rõ mặt phát triển, quyền thế, danh tín và bài học nghiệp của sao gốc. Khi nhiều hóa khí liên kết đẹp, lá số thường có điểm bật rất rõ; khi lệch, chúng cũng làm mâu thuẫn lộ ra nhanh hơn.',
    peers: ['Hóa Lộc', 'Hóa Khoa', 'Hóa Kỵ'],
    keywords: ['Tứ Hóa'],
  },
  'Hóa Khoa': {
    family: 'Tứ Hóa',
    summary: 'Tứ Hóa là nhóm hóa khí làm nổi rõ mặt phát triển, quyền thế, danh tín và bài học nghiệp của sao gốc. Khi nhiều hóa khí liên kết đẹp, lá số thường có điểm bật rất rõ; khi lệch, chúng cũng làm mâu thuẫn lộ ra nhanh hơn.',
    peers: ['Hóa Lộc', 'Hóa Quyền', 'Hóa Kỵ'],
    keywords: ['Tứ Hóa'],
  },
  'Hóa Kỵ': {
    family: 'Tứ Hóa',
    summary: 'Tứ Hóa là nhóm hóa khí làm nổi rõ mặt phát triển, quyền thế, danh tín và bài học nghiệp của sao gốc. Khi nhiều hóa khí liên kết đẹp, lá số thường có điểm bật rất rõ; khi lệch, chúng cũng làm mâu thuẫn lộ ra nhanh hơn.',
    peers: ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa'],
    keywords: ['Tứ Hóa'],
  },
};

const CONCEPT_STAR_GROUPS: Record<string, string[]> = {
  'Lục Cát': ['Tả Phù', 'Hữu Bật', 'Thiên Khôi', 'Thiên Việt', 'Văn Xương', 'Văn Khúc'],
  'Lục Sát': ['Kình Dương', 'Đà La', 'Hỏa Tinh', 'Linh Tinh', 'Địa Không', 'Địa Kiếp'],
  'Tứ Hóa': ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'],
  'Tả Hữu': ['Tả Phù', 'Hữu Bật'],
  'Khôi Việt': ['Thiên Khôi', 'Thiên Việt'],
  'Xương Khúc': ['Văn Xương', 'Văn Khúc'],
  'Kình Đà': ['Kình Dương', 'Đà La'],
  'Hỏa Linh': ['Hỏa Tinh', 'Linh Tinh'],
  'Không Kiếp': ['Địa Không', 'Địa Kiếp'],
  'Tam Minh': ['Đào Hoa', 'Hồng Loan', 'Thiên Hỷ'],
  'Long Phượng': ['Long Trì', 'Phượng Các'],
  'Quang Quý': ['Ân Quang', 'Thiên Quý'],
  'Tứ Đức': ['Thiên Đức', 'Nguyệt Đức', 'Long Đức', 'Phúc Đức'],
  'Lộc Mã': ['Lộc Tồn', 'Thiên Mã'],
};

const STAR_TOPIC_TERMS_BY_CATEGORY: Partial<Record<StarCategory, string[]>> = {
  main: ['Tam Phương Tứ Chính', 'Đại Hạn', 'Tràng Sinh'],
  cat: ['Lục Cát', 'Tam Phương Tứ Chính', 'Đại Hạn'],
  sha: ['Lục Sát', 'Tam Phương Tứ Chính', 'Đại Hạn'],
  fixed: ['Tam Phương Tứ Chính', 'Tràng Sinh'],
  support: ['Lục Cát', 'Tam Phương Tứ Chính', 'Đại Hạn'],
  other: ['Tam Phương Tứ Chính', 'Tràng Sinh'],
};

function cleanName(name: string): string {
  return name.replace(/\[.*?\]|\(.*?\)/g, '').trim();
}

function dedupeTags(tags: string[]): InsightTag[] {
  return Array.from(new Set(tags.filter(Boolean))).map((label) => ({ label }));
}

function dedupeRelated(items: InsightRelatedItem[]): InsightRelatedItem[] {
  const seen = new Set<string>();
  const deduped: InsightRelatedItem[] = [];

  for (const item of items) {
    const key = `${item.kind}:${item.name}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}

function dedupeKeywords(keywords: string[]): string[] {
  return Array.from(new Set(keywords.filter(Boolean)));
}

function dedupeSections(sections: InsightSection[]): InsightSection[] {
  const seen = new Set<string>();
  const deduped: InsightSection[] = [];

  for (const section of sections) {
    if (!section.title || !section.body) {
      continue;
    }

    const key = `${section.title}:${section.body}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(section);
  }

  return deduped;
}

function dedupeExploreGroups(groups: InsightExploreGroup[]): InsightExploreGroup[] {
  const seen = new Set<string>();
  const deduped: InsightExploreGroup[] = [];

  for (const group of groups) {
    if (group.items.length === 0) {
      continue;
    }

    const key = `${group.category}:${group.id}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push({
      ...group,
      items: dedupeRelated(group.items),
    });
  }

  return deduped;
}

function getOppositePalace(chart: ZiweiChart, palace: Palace): Palace | undefined {
  return chart.palaces[(palace.chiIndex + 6) % 12];
}

function getFamilyMembers(familyName: string): string[] {
  if (CONCEPT_STAR_GROUPS[familyName]) {
    return CONCEPT_STAR_GROUPS[familyName];
  }

  return Array.from(
    new Set(
      Object.entries(STAR_FAMILY_METADATA)
        .filter(([, meta]) => meta.family === familyName)
        .map(([name]) => name),
    ),
  );
}

function formatStarList(stars: Star[]): string {
  return stars.map((star) => cleanName(star.name)).join(', ');
}

function findStarOccurrences(chart: ZiweiChart, names: string[]): Array<{ name: string; palace: Palace; isBorrowed: boolean }> {
  const hits: Array<{ name: string; palace: Palace; isBorrowed: boolean }> = [];

  for (const palace of chart.palaces) {
    for (const star of palace.mainStars) {
      const normalized = cleanName(star.name);
      if (names.includes(normalized)) {
        hits.push({ name: normalized, palace, isBorrowed: false });
      }
    }

    for (const star of palace.auxStars) {
      const normalized = cleanName(star.name);
      if (names.includes(normalized)) {
        hits.push({ name: normalized, palace, isBorrowed: false });
      }
    }

    for (const star of palace.borrowedStars) {
      const normalized = cleanName(star.name);
      if (names.includes(normalized)) {
        hits.push({ name: normalized, palace, isBorrowed: true });
      }
    }
  }

  return hits;
}

function findPalaceByName(chart: ZiweiChart, palaceName?: PalaceName): Palace | undefined {
  if (!palaceName) {
    return undefined;
  }

  return chart.palaces.find((palace) => palace.palaceName === palaceName);
}

function findStarContext(chart: ZiweiChart, selection: InsightStarSelection): {
  star?: Star;
  palace?: Palace;
  isMainStar: boolean;
  isBorrowed: boolean;
} {
  const targetName = cleanName(selection.name);
  const preferredPalace = findPalaceByName(chart, selection.palaceName);
  const palaces = preferredPalace
    ? [preferredPalace, ...chart.palaces.filter((palace) => palace.palaceName !== preferredPalace.palaceName)]
    : chart.palaces;

  for (const palace of palaces) {
    if (selection.isBorrowed) {
      const borrowedStar = palace.borrowedStars.find((star) => cleanName(star.name) === targetName);
      if (borrowedStar) {
        return { star: borrowedStar, palace, isMainStar: true, isBorrowed: true };
      }
    }

    const mainStar = palace.mainStars.find((star) => cleanName(star.name) === targetName);
    if (mainStar) {
      return {
        star: mainStar,
        palace,
        isMainStar: selection.isMainStar ?? true,
        isBorrowed: false,
      };
    }

    const auxStar = palace.auxStars.find((star) => cleanName(star.name) === targetName);
    if (auxStar) {
      return { star: auxStar, palace, isMainStar: false, isBorrowed: false };
    }

    if (!selection.isBorrowed) {
      const borrowedStar = palace.borrowedStars.find((star) => cleanName(star.name) === targetName);
      if (borrowedStar) {
        return { star: borrowedStar, palace, isMainStar: true, isBorrowed: true };
      }
    }
  }

  return {
    palace: preferredPalace,
    isMainStar: selection.isMainStar ?? false,
    isBorrowed: selection.isBorrowed ?? false,
  };
}

function buildPalaceRelatedItems(palace?: Palace, currentName?: string): InsightRelatedItem[] {
  if (!palace) {
    return [];
  }

  const related: InsightRelatedItem[] = [
    { kind: 'palace', name: palace.palaceName, label: `Cung ${palace.palaceName}` },
  ];

  if (palace.isThanPalace) {
    related.push({ kind: 'state-marker', name: 'Cung Thân', label: 'Cung Thân' });
  }

  if (palace.trangSinh) {
    related.push({ kind: 'state-marker', name: palace.trangSinh, label: palace.trangSinh });
  }

  if (palace.hasTuanKhong) {
    related.push({ kind: 'state-marker', name: 'Tuần', label: 'Tuần' });
  }

  if (palace.hasTrietKhong) {
    related.push({ kind: 'state-marker', name: 'Triệt', label: 'Triệt' });
  }

  if (palace.mainStars.length === 0 && palace.borrowedStars.length > 0) {
    related.push({ kind: 'state-marker', name: 'Mượn Chính Tinh', label: 'Mượn Chính Tinh' });
  }

  for (const star of palace.mainStars.slice(0, 3)) {
    if (cleanName(star.name) !== cleanName(currentName ?? '')) {
      related.push({ kind: 'star', name: star.name, label: star.name });
    }
  }

  for (const star of palace.auxStars.slice(0, 3)) {
    if (cleanName(star.name) !== cleanName(currentName ?? '')) {
      related.push({ kind: 'star', name: star.name, label: star.name });
    }
  }

  return dedupeRelated(related);
}

function buildStarDynamicSections(
  palace: Palace | undefined,
  star: Star | undefined,
  isMainStar: boolean,
  isBorrowed: boolean,
): InsightSection[] {
  if (!palace) {
    return [];
  }

  const starPosition = isBorrowed ? 'mượn chiếu từ đối cung' : isMainStar ? 'tọa thủ như chính tinh' : 'hội tụ như phụ tinh';
  const starSignals = [
    `Sao này đang ${starPosition} tại cung ${palace.palaceName} (${palace.can}.${palace.chi}).`,
    palace.isThanPalace ? 'Đây cũng là nơi Cung Thân đang cư nên tác động thực tế thường lộ rõ hơn.' : '',
    star?.sihua ? `Trên lá số hiện tại, sao còn mang Tứ Hóa ${star.sihua}, nên biểu hiện sẽ được nhấn mạnh theo đúng hướng của hóa khí này.` : '',
    palace.trangSinh ? `Cung đang nhận trạng thái ${palace.trangSinh}, vì vậy khí của sao được triển khai trong nhịp ${TRANG_SINH_PHASE_SUMMARY[palace.trangSinh] ?? 'vận động riêng của cung này'}.` : '',
  ].filter(Boolean);

  return [
    {
      title: 'Khi xuất hiện trên lá số này',
      body: starSignals.join(' '),
    },
  ];
}

function buildStarFamilyInsight(chart: ZiweiChart, starName: string): {
  tags: string[];
  keywords: string[];
  sections: InsightSection[];
  relatedItems: InsightRelatedItem[];
} {
  const meta = STAR_FAMILY_METADATA[starName];
  if (!meta) {
    return {
      tags: [],
      keywords: [],
      sections: [],
      relatedItems: [],
    };
  }

  const peerOccurrences = findStarOccurrences(chart, meta.peers);
  const peerSummary = peerOccurrences.length > 0
    ? peerOccurrences.map((occurrence) => {
        const borrowedText = occurrence.isBorrowed ? ' (mượn chiếu)' : '';
        return `${occurrence.name} ở cung ${occurrence.palace.palaceName}${borrowedText}`;
      }).join('; ')
    : `Các sao còn lại trong nhóm gồm ${meta.peers.join(', ')}.`;

  return {
    tags: [meta.family],
    keywords: meta.keywords ?? [],
    sections: [
      {
        title: 'Bộ sao và mạch đi cùng',
        body: `${starName} thuộc nhóm ${meta.family}. ${meta.summary}`,
      },
      {
        title: 'Các sao cùng họ trên lá số này',
        body: peerSummary,
      },
    ],
    relatedItems: meta.peers.map((name) => ({ kind: 'star', name, label: name })),
  };
}

function buildPalaceItemsFromOccurrences(
  occurrences: Array<{ name: string; palace: Palace; isBorrowed: boolean }>,
): InsightRelatedItem[] {
  const grouped = new Map<string, { palace: Palace; starLabels: string[] }>();

  for (const occurrence of occurrences) {
    const key = occurrence.palace.palaceName;
    const existing = grouped.get(key);
    const starLabel = occurrence.isBorrowed ? `${occurrence.name} (mượn chiếu)` : occurrence.name;

    if (existing) {
      existing.starLabels.push(starLabel);
      continue;
    }

    grouped.set(key, {
      palace: occurrence.palace,
      starLabels: [starLabel],
    });
  }

  return Array.from(grouped.values()).map(({ palace, starLabels }) => ({
    kind: 'palace',
    name: palace.palaceName,
    label: `Cung ${palace.palaceName}`,
    hint: `Đang có: ${Array.from(new Set(starLabels)).join(', ')}`,
  }));
}

function buildStarInsightLink(name: string, chart: ZiweiChart): InsightRelatedItem {
  const occurrence = findStarOccurrences(chart, [name])[0];

  return {
    kind: 'star',
    name,
    label: name,
    hint: occurrence
      ? `Đang ở cung ${occurrence.palace.palaceName}${occurrence.isBorrowed ? ' (mượn chiếu)' : ''}`
      : undefined,
  };
}

function buildPalaceSnapshotSection(palace: Palace): InsightSection {
  const mainStarText = palace.mainStars.length > 0
    ? `Chính tinh hiện có: ${formatStarList(palace.mainStars)}.`
    : palace.borrowedStars.length > 0
      ? `Cung này Vô Chính Diệu và đang mượn chính tinh: ${formatStarList(palace.borrowedStars)}.`
      : 'Cung này hiện không có chính tinh tọa thủ và cũng chưa có mượn chính tinh để hiển thị.';

  const auxStarText = palace.auxStars.length > 0
    ? `Phụ tinh nổi bật đang thấy trên cung: ${formatStarList(palace.auxStars.slice(0, 6))}.`
    : 'Hiện không có phụ tinh nổi bật được ghi nhận trong cung này.';

  const stateText = [
    palace.isThanPalace ? 'Cung này đồng thời là nơi an Thân.' : '',
    palace.hasTuanKhong ? 'Cung đang bị Tuần án ngữ.' : '',
    palace.hasTrietKhong ? 'Cung đang bị Triệt án ngữ.' : '',,
    palace.trangSinh ? `Tràng Sinh tại cung là ${palace.trangSinh}.` : '',
    `Đại Hạn khởi từ ${palace.daiHan}.`,
  ].filter(Boolean).join(' ');

  return {
    title: 'Bố cục của cung trên lá số này',
    body: `${mainStarText} ${auxStarText} ${stateText}`.trim(),
  };
}

function buildPalaceCrossReadSection(palace: Palace): InsightSection {
  const references = PALACE_CROSS_READ_MAP[palace.palaceName];

  return {
    title: 'Nên đối chiếu thêm',
    body: `Khi đọc cung ${palace.palaceName}, nên nhìn thêm ${references.join(', ')} để tránh kết luận một chiều. Với Tử Vi Đẩu Số, cung đẹp nhưng tam phương yếu thì lực khó bền; ngược lại cung có vấn đề nhưng được tam phương nâng tốt vẫn có cửa xoay chuyển.`,
  };
}

function buildGlossaryDynamicSections(chart: ZiweiChart, normalizedName: string, kind: InsightKind, palace?: Palace): InsightSection[] {
  const sections: InsightSection[] = [];

  if (kind === 'palace' && palace) {
    sections.push(buildPalaceSnapshotSection(palace));
    sections.push(buildPalaceCrossReadSection(palace));
  }

  if (normalizedName === 'Cung Thân' && palace) {
    sections.push({
      title: 'Ứng ngay trên lá số này',
      body: `Cung Thân của lá số hiện đang cư tại ${palace.palaceName} (${palace.can}.${palace.chi}). Điều này cho thấy khi trưởng thành, đương số thường dồn nhiều sức cho chủ đề của cung này hơn là chỉ sống theo khí chất bẩm sinh của Mệnh.`,
    });
  }

  if (normalizedName === 'Mệnh Chủ') {
    sections.push({
      title: 'Ứng ngay trên lá số này',
      body: `Mệnh Chủ hiện là ${chart.menhChu}. Nên đọc sao này như lớp tông khí bẩm sinh, rồi đối chiếu tiếp với chính tinh thủ Mệnh và Cung Thân để biết bản chất gốc có đi cùng cách hành động ngoài đời hay không.`,
    });
  }

  if (normalizedName === 'Thân Chủ') {
    sections.push({
      title: 'Ứng ngay trên lá số này',
      body: `Thân Chủ hiện là ${chart.thanChu}. Đây là tín hiệu hữu ích để hiểu cách đương số nhập đời và biểu lộ bản thân khi đã bước sâu vào công việc, quan hệ và trách nhiệm thực tế.`,
    });
  }

  if (normalizedName === 'Đại Hạn' && palace) {
    sections.push({
      title: 'Ứng ngay trên lá số này',
      body: `Con số Đại Hạn hiện đang hiển thị ở cung ${palace.palaceName} là ${palace.daiHan}. Điều đó cho biết mỗi chu kỳ 10 năm đi qua cung này sẽ khuếch đại các vấn đề của cung, sao thủ cung và mạng lưới tam phương tứ chính liên quan.`,
    });
  }

  if (normalizedName === 'Vô Chính Diệu' && palace) {
    sections.push({
      title: 'Ứng ngay trên lá số này',
      body: palace.borrowedStars.length > 0
        ? `Trên lá số hiện tại, cung ${palace.palaceName} là Vô Chính Diệu và đang mượn lực từ ${formatStarList(palace.borrowedStars)}. Đây là tình huống cần đọc mạnh qua đối cung, phụ tinh và toàn bộ thế đứng thay vì chỉ nhìn riêng bản cung.`
        : `Cung ${palace.palaceName} hiện là Vô Chính Diệu. Vì không có chính tinh tọa thủ, phần luận đoán phải dựa nhiều vào phụ tinh, tam phương tứ chính và các chỉ dấu trạng thái của cung.`,
    });
  }

  if (normalizedName === 'Mượn Chính Tinh' && palace && palace.borrowedStars.length > 0) {
    sections.push({
      title: 'Ứng ngay trên lá số này',
      body: `Cung ${palace.palaceName} hiện đang mượn ${formatStarList(palace.borrowedStars)} từ đối cung để làm điểm tựa luận giải. Điều này cho thấy biểu hiện của cung không yếu hẳn, mà thiên về phản ứng theo lực dẫn từ phía xung chiếu.`,
    });
  }

  if ((normalizedName === 'Tuần' || normalizedName === 'Tuần Không') && palace) {
    sections.push({
      title: 'Ứng ngay trên lá số này',
      body: `Tuần đang án tại cung ${palace.palaceName}. Trên lá số này, nó thiên về làm chậm, làm hụt và giảm biên độ phát tác của các sao trong cung, khiến chuyện của cung thường phải qua một lớp thử trước khi thành hình rõ.`,
    });
  }

  if ((normalizedName === 'Triệt' || normalizedName === 'Triệt Không') && palace) {
    sections.push({
      title: 'Ứng ngay trên lá số này',
      body: `Triệt đang án tại cung ${palace.palaceName}. Trên lá số này, nó là lực cắt và bẻ hướng mạnh hơn Tuần, nên những việc của cung dễ gặp đoạn gãy, chặn đường hoặc buộc phải đổi cách triển khai sớm.`,
    });
  }

  if (TRANG_SINH_SEQUENCE.includes(normalizedName as typeof TRANG_SINH_SEQUENCE[number])) {
    const currentIndex = TRANG_SINH_SEQUENCE.indexOf(normalizedName as typeof TRANG_SINH_SEQUENCE[number]);
    const previousStage = TRANG_SINH_SEQUENCE[(currentIndex + TRANG_SINH_SEQUENCE.length - 1) % TRANG_SINH_SEQUENCE.length];
    const nextStage = TRANG_SINH_SEQUENCE[(currentIndex + 1) % TRANG_SINH_SEQUENCE.length];

    sections.push({
      title: 'Vị trí trong vòng khí',
      body: `${normalizedName} là một mắt xích trong chu kỳ 12 giai đoạn của vòng Tràng Sinh. Nó đứng sau ${previousStage} và trước ${nextStage}, nên nên được hiểu như pha ${TRANG_SINH_PHASE_SUMMARY[normalizedName] ?? 'chuyển hóa khí'} chứ không phải là phán quyết cát hung độc lập.`,
    });
  }

  return sections;
}

function buildStarExploreGroups(
  chart: ZiweiChart,
  starName: string,
  star: Star | undefined,
  palace: Palace | undefined,
  relatedItems: InsightRelatedItem[],
): InsightExploreGroup[] {
  const meta = STAR_FAMILY_METADATA[starName];
  const groups: InsightExploreGroup[] = [];

  if (meta) {
    const peerOccurrences = findStarOccurrences(chart, meta.peers);
    groups.push({
      id: 'family',
      title: `Bộ ${meta.family}`,
      description: `Đi theo bộ sao để hiểu ${starName} không đứng một mình mà đang cộng hưởng với nhóm nào.`,
      category: 'family',
      items: [
        {
          kind: 'glossary',
          name: meta.family,
          label: `Xem bộ ${meta.family}`,
          hint: meta.summary,
        },
        ...meta.peers.map((name) => {
          const occurrence = peerOccurrences.find((item) => item.name === name);
          return {
            kind: 'star' as const,
            name,
            label: name,
            hint: occurrence
              ? `Đang ở cung ${occurrence.palace.palaceName}${occurrence.isBorrowed ? ' (mượn chiếu)' : ''}`
              : 'Chưa hiện rõ trên lá số này',
          };
        }),
      ],
    });

    groups.push({
      id: 'counterpart',
      title: 'Sao đối cặp và bạn cùng bộ',
      description: 'Dùng cụm này để so cách biểu hiện của sao đang chọn với nửa còn lại trong cùng họ.',
      category: 'counterpart',
      items: meta.peers.map((name) => {
        const occurrence = peerOccurrences.find((item) => item.name === name);
        return {
          kind: 'star' as const,
          name,
          label: name,
          hint: occurrence
            ? `Đang ở cung ${occurrence.palace.palaceName}${occurrence.isBorrowed ? ' (mượn chiếu)' : ''}`
            : 'Chưa hiện rõ trên lá số này',
        };
      }),
    });

    const familyOccurrences = findStarOccurrences(chart, [starName, ...meta.peers]);
    groups.push({
      id: 'palace-impact',
      title: 'Các cung đang chịu bộ sao này',
      description: 'Nhìn các cung có cùng họ sao để thấy bộ sao đang nghiêng lực vào khu vực nào của lá số.',
      category: 'palace-impact',
      items: buildPalaceItemsFromOccurrences(familyOccurrences),
    });
  }

  const themeItems = dedupeRelated([
    ...(meta ? [{
      kind: 'glossary' as const,
      name: meta.family,
      label: `Bộ ${meta.family}`,
      hint: 'Xem cả nhóm sao thay vì từng sao đơn lẻ',
    }] : []),
    ...((star ? STAR_TOPIC_TERMS_BY_CATEGORY[star.category] ?? [] : []).map((name) => ({
      kind: 'glossary' as const,
      name,
      label: name,
    }))),
    ...(palace?.isThanPalace ? [{ kind: 'state-marker' as const, name: 'Cung Thân', label: 'Cung Thân' }] : []),
    ...(palace?.trangSinh ? [{ kind: 'state-marker' as const, name: palace.trangSinh, label: palace.trangSinh }] : []),
    ...(palace && palace.mainStars.length === 0 ? [{ kind: 'state-marker' as const, name: 'Vô Chính Diệu', label: 'Vô Chính Diệu' }] : []),
    ...(star?.sihua ? [{ kind: 'state-marker' as const, name: `Hóa ${star.sihua}`, label: `Hóa ${star.sihua}` }] : []),
  ]);

  groups.push({
    id: 'theme',
    title: 'Học tiếp theo chủ đề',
    description: 'Các lối đọc nhanh để đào sâu sao này theo mạch kiến thức thay vì đi ngẫu nhiên.',
    category: 'theme',
    items: themeItems,
  });

  groups.push({
    id: 'related',
    title: 'Mạch đang xem',
    description: 'Các mục gần nhất với sao hiện tại trên chính cung hoặc trên cùng nhánh đọc.',
    category: 'related',
    items: relatedItems,
  });

  return dedupeExploreGroups(groups);
}

function buildConceptExploreGroups(
  chart: ZiweiChart,
  conceptName: string,
): InsightExploreGroup[] {
  const members = getFamilyMembers(conceptName);
  if (members.length === 0) {
    return [];
  }

  const occurrences = findStarOccurrences(chart, members);
  const memberItems = members.map((name) => {
    const occurrence = occurrences.find((item) => item.name === name);
    return {
      kind: 'star' as const,
      name,
      label: name,
      hint: occurrence
        ? `Đang ở cung ${occurrence.palace.palaceName}${occurrence.isBorrowed ? ' (mượn chiếu)' : ''}`
        : 'Chưa hiện rõ trên lá số này',
    };
  });

  return dedupeExploreGroups([
    {
      id: 'family',
      title: `Các sao thuộc ${conceptName}`,
      description: 'Đi từ khái niệm nhóm sang từng sao cụ thể để xem bộ này đang được kích hoạt ra sao.',
      category: 'family',
      items: memberItems,
    },
    {
      id: 'palace-impact',
      title: 'Các cung đang chịu nhóm sao này',
      description: 'Những cung dưới đây hiện đang hội hoặc nhận lực từ nhóm sao của chủ đề đang chọn.',
      category: 'palace-impact',
      items: buildPalaceItemsFromOccurrences(occurrences),
    },
  ]);
}

function buildPalaceExploreGroups(chart: ZiweiChart, palace: Palace, relatedItems: InsightRelatedItem[]): InsightExploreGroup[] {
  const oppositePalace = getOppositePalace(chart, palace);
  const palaceStarItems: InsightRelatedItem[] = [
    ...palace.mainStars.map((star) => ({ kind: 'star' as const, name: star.name, label: star.name, hint: 'Chính tinh trong cung này' })),
    ...palace.auxStars.slice(0, 6).map((star) => ({ kind: 'star' as const, name: star.name, label: star.name, hint: 'Phụ tinh trong cung này' })),
    ...palace.borrowedStars.map((star) => ({ kind: 'star' as const, name: star.name, label: star.name, hint: 'Chính tinh mượn chiếu' })),
  ];

  const crossReadItems: InsightRelatedItem[] = [
    ...(oppositePalace ? [{
      kind: 'palace' as const,
      name: oppositePalace.palaceName,
      label: `Xung chiếu: ${oppositePalace.palaceName}`,
      hint: `Cung đối diện tại ${oppositePalace.can}.${oppositePalace.chi}`,
    }] : []),
    ...PALACE_CROSS_READ_MAP[palace.palaceName].map((name) => ({
      kind: 'palace' as const,
      name,
      label: `Đối chiếu ${name}`,
    })),
  ];

  const themeItems = dedupeRelated([
    { kind: 'glossary', name: 'Tam Phương Tứ Chính', label: 'Tam Phương Tứ Chính' },
    { kind: 'state-marker', name: 'Đại Hạn', label: 'Đại Hạn', hint: `Cung này khởi hạn từ ${palace.daiHan}` },
    ...(palace.trangSinh ? [{ kind: 'state-marker' as const, name: palace.trangSinh, label: palace.trangSinh }] : []),
    ...(palace.isThanPalace ? [{ kind: 'state-marker' as const, name: 'Cung Thân', label: 'Cung Thân' }] : []),
    ...(palace.mainStars.length === 0 ? [{ kind: 'state-marker' as const, name: 'Vô Chính Diệu', label: 'Vô Chính Diệu' }] : []),
  ]);

  return dedupeExploreGroups([
    {
      id: 'counterpart',
      title: 'Cung đối cặp và trục đối chiếu',
      description: 'Dùng cụm này để nhảy sang cung đối diện hoặc các cung nên đọc cùng theo trục nghiệp lực.',
      category: 'counterpart',
      items: crossReadItems,
    },
    {
      id: 'palace-impact',
      title: 'Các sao đang chi phối cung này',
      description: 'Nhảy thẳng sang các sao chính, phụ và sao mượn đang tạo khí cho cung đang xem.',
      category: 'palace-impact',
      items: palaceStarItems,
    },
    {
      id: 'theme',
      title: 'Học cung này theo chủ đề',
      description: 'Các lối đọc bao quát để đi từ cung hiện tại sang hệ thống luận giải rộng hơn.',
      category: 'theme',
      items: themeItems,
    },
    {
      id: 'related',
      title: 'Mạch đang xem',
      description: 'Các mục gần nhất với cung hiện tại trên nhánh đọc đang mở.',
      category: 'related',
      items: relatedItems,
    },
  ]);
}

function buildStateMarkerExploreGroups(
  chart: ZiweiChart,
  normalizedName: string,
  palace: Palace | undefined,
  relatedItems: InsightRelatedItem[],
): InsightExploreGroup[] {
  const groups: InsightExploreGroup[] = [];

  if (normalizedName === 'Cung Thân' && palace) {
    groups.push({
      id: 'palace-impact',
      title: 'Cung đang mang Thân',
      description: 'Đi thẳng vào nơi lá số đang dồn lực hậu thiên và hành vi thực chiến.',
      category: 'palace-impact',
      items: [
        {
          kind: 'palace',
          name: palace.palaceName,
          label: `Cung ${palace.palaceName}`,
          hint: `Thân cư tại ${palace.can}.${palace.chi}`,
        },
      ],
    });
  }

  if (normalizedName === 'Mệnh Chủ') {
    groups.push({
      id: 'counterpart',
      title: 'Sao đang giữ vai trò Mệnh Chủ',
      description: 'Nhảy sang chính sao Mệnh Chủ để xem tầng khí bẩm sinh đang phát ra như thế nào.',
      category: 'counterpart',
      items: [buildStarInsightLink(chart.menhChu, chart)],
    });
  }

  if (normalizedName === 'Thân Chủ') {
    groups.push({
      id: 'counterpart',
      title: 'Sao đang giữ vai trò Thân Chủ',
      description: 'Nhảy sang sao Thân Chủ để xem lối hành động và biểu hiện hậu thiên trên lá số.',
      category: 'counterpart',
      items: [buildStarInsightLink(chart.thanChu, chart)],
    });
  }

  if (normalizedName === 'Đại Hạn') {
    groups.push({
      id: 'palace-impact',
      title: 'Các cung theo vòng Đại Hạn',
      description: 'Đi theo từng cung để xem mỗi chặng 10 năm sẽ đổ trọng tâm vào đâu.',
      category: 'palace-impact',
      items: chart.palaces
        .slice()
        .sort((left, right) => left.daiHan - right.daiHan)
        .map((item) => ({
          kind: 'palace' as const,
          name: item.palaceName,
          label: `Cung ${item.palaceName}`,
          hint: `Khởi hạn ${item.daiHan}`,
        })),
    });
  }

  if (normalizedName === 'Vô Chính Diệu') {
    groups.push({
      id: 'palace-impact',
      title: 'Các cung Vô Chính Diệu',
      description: 'Nhảy tới những cung không có chính tinh để xem lá số đang phải đọc mạnh qua thế đứng ở đâu.',
      category: 'palace-impact',
      items: chart.palaces
        .filter((item) => item.mainStars.length === 0)
        .map((item) => ({
          kind: 'palace' as const,
          name: item.palaceName,
          label: `Cung ${item.palaceName}`,
          hint: item.borrowedStars.length > 0
            ? `Mượn ${formatStarList(item.borrowedStars)}`
            : 'Chưa có chính tinh tọa thủ',
        })),
    });
  }

  if (normalizedName === 'Mượn Chính Tinh') {
    groups.push({
      id: 'palace-impact',
      title: 'Các cung đang mượn chính tinh',
      description: 'Những cung này cần được đọc theo lực dẫn từ đối cung và mạng tam phương nhiều hơn bình thường.',
      category: 'palace-impact',
      items: chart.palaces
        .filter((item) => item.borrowedStars.length > 0)
        .map((item) => ({
          kind: 'palace' as const,
          name: item.palaceName,
          label: `Cung ${item.palaceName}`,
          hint: `Mượn ${formatStarList(item.borrowedStars)}`,
        })),
    });
  }

  if (normalizedName === 'Tuần' || normalizedName === 'Tuần Không') {
    groups.push({
      id: 'palace-impact',
      title: 'Các cung đang chịu Tuần',
      description: 'Nhảy sang những cung bị Tuần án để xem nơi nào của lá số đang bị làm chậm hoặc làm hụt lực.',
      category: 'palace-impact',
      items: chart.palaces
        .filter((item) => item.hasTuanKhong)
        .map((item) => ({
          kind: 'palace' as const,
          name: item.palaceName,
          label: `Cung ${item.palaceName}`,
          hint: `${item.can}.${item.chi}`,
        })),
    });
  }

  if (normalizedName === 'Triệt' || normalizedName === 'Triệt Không') {
    groups.push({
      id: 'palace-impact',
      title: 'Các cung đang chịu Triệt',
      description: 'Nhảy sang những cung bị Triệt án để xem nơi nào đang bị cắt đường hoặc buộc đổi hướng.',
      category: 'palace-impact',
      items: chart.palaces
        .filter((item) => item.hasTrietKhong)
        .map((item) => ({
          kind: 'palace' as const,
          name: item.palaceName,
          label: `Cung ${item.palaceName}`,
          hint: `${item.can}.${item.chi}`,
        })),
    });
  }

  if (normalizedName === 'Tràng Sinh') {
    groups.push({
      id: 'palace-impact',
      title: 'Vòng Tràng Sinh trên 12 cung',
      description: 'Xem toàn bộ 12 cung đang mang từng pha khí nào để hiểu nhịp vận hành của lá số.',
      category: 'palace-impact',
      items: chart.palaces.map((item) => ({
        kind: 'palace' as const,
        name: item.palaceName,
        label: `Cung ${item.palaceName}`,
        hint: item.trangSinh,
      })),
    });
  }

  if (TRANG_SINH_SEQUENCE.includes(normalizedName as typeof TRANG_SINH_SEQUENCE[number])) {
    groups.push({
      id: 'palace-impact',
      title: `Các cung đang ở pha ${normalizedName}`,
      description: 'Đi thẳng tới các cung đang mang đúng pha khí này để đọc sự cộng hưởng trên toàn lá số.',
      category: 'palace-impact',
      items: chart.palaces
        .filter((item) => item.trangSinh === normalizedName)
        .map((item) => ({
          kind: 'palace' as const,
          name: item.palaceName,
          label: `Cung ${item.palaceName}`,
          hint: `${item.can}.${item.chi}`,
        })),
    });
  }

  groups.push({
    id: 'related',
    title: 'Mạch đang xem',
    description: 'Các mục gần nhất với chỉ dấu hiện tại trên cùng nhánh luận giải.',
    category: 'related',
    items: relatedItems,
  });

  return dedupeExploreGroups(groups);
}

function buildTermExploreGroups(
  chart: ZiweiChart,
  normalizedName: string,
  kind: InsightKind,
  palace: Palace | undefined,
  relatedItems: InsightRelatedItem[],
): InsightExploreGroup[] {
  const conceptGroups = buildConceptExploreGroups(chart, normalizedName);
  if (conceptGroups.length > 0) {
    return dedupeExploreGroups([
      ...conceptGroups,
      {
        id: 'related',
        title: 'Mạch đang xem',
        description: 'Các mục gần nhất với chủ đề hiện tại.',
        category: 'related',
        items: relatedItems,
      },
    ]);
  }

  if (kind === 'palace' && palace) {
    return buildPalaceExploreGroups(chart, palace, relatedItems);
  }

  return buildStateMarkerExploreGroups(chart, normalizedName, palace, relatedItems);
}

function classifyGlossaryKind(name: string): InsightKind {
  if (PALACE_NAMES_ORDER.includes(name as PalaceName)) {
    return 'palace';
  }

  if (STATE_MARKER_TERMS.has(name)) {
    return 'state-marker';
  }

  return 'glossary';
}

function buildStarSubtitle(palace?: Palace, isMainStar?: boolean, isBorrowed?: boolean): string {
  if (!palace) {
    return 'Ngôi sao đang hiện trên lá số hiện tại.';
  }

  if (isBorrowed) {
    return `Chính tinh mượn chiếu tại cung ${palace.palaceName}.`;
  }

  if (isMainStar) {
    return `Chính tinh tọa thủ tại cung ${palace.palaceName}.`;
  }

  return `Phụ tinh hội tụ tại cung ${palace.palaceName}.`;
}

export function buildStarInsightPayload(chart: ZiweiChart, selection: InsightStarSelection): InsightPayload {
  const resolved = findStarContext(chart, selection);
  const star = resolved.star;
  const palace = resolved.palace;
  const cleanStarName = cleanName(selection.name);
  const profile = getStarInsightProfile(cleanStarName);
  const familyInsight = buildStarFamilyInsight(chart, cleanStarName);

  const tags = dedupeTags([
    resolved.isBorrowed ? 'Mượn chiếu' : '',
    resolved.isMainStar ? 'Chính tinh' : 'Phụ tinh',
    star ? STAR_CATEGORY_LABELS[star.category] : '',
    star?.nguHanh ? `Ngũ hành ${star.nguHanh}` : '',
    star?.brightness ? `Độ sáng ${star.brightness}` : '',
    star?.sihua ? `Tứ Hóa ${star.sihua}` : '',
    palace?.isThanPalace ? 'Thân cư cung này' : '',
    ...familyInsight.tags,
  ]);

  const relatedItems = dedupeRelated([
    ...buildPalaceRelatedItems(palace, cleanStarName),
    ...familyInsight.relatedItems,
    ...(star?.sihua ? [{ kind: 'state-marker' as const, name: `Hóa ${star.sihua}`, label: `Hóa ${star.sihua}` }] : []),
  ]);

  return {
    kind: 'star',
    title: cleanStarName,
    subtitle: buildStarSubtitle(palace, resolved.isMainStar, resolved.isBorrowed),
    description: profile.description ?? getStarDescription(cleanStarName),
    keywords: dedupeKeywords([...profile.keywords, ...familyInsight.keywords]),
    sections: dedupeSections([
      ...profile.sections,
      ...(star ? [STAR_CATEGORY_SECTIONS[star.category]] : []),
      ...familyInsight.sections,
      ...buildStarDynamicSections(palace, star, resolved.isMainStar, resolved.isBorrowed),
    ]),
    tags,
    context: {
      palaceName: palace?.palaceName,
      chi: palace?.chi,
      isMainStar: resolved.isMainStar,
      isBorrowed: resolved.isBorrowed,
      isThanPalace: palace?.isThanPalace,
      nguHanh: star?.nguHanh,
      brightness: star?.brightness,
      sihua: star?.sihua,
      trangSinh: palace?.trangSinh,
      daiHan: palace?.daiHan,
    },
    relatedItems,
    exploreGroups: buildStarExploreGroups(chart, cleanStarName, star, palace, relatedItems),
  };
}

export function buildTermInsightPayload(chart: ZiweiChart, selection: InsightTermSelection): InsightPayload {
  const normalizedName = resolveGlossaryTerm(selection.name);
  const inferredPalaceName = PALACE_NAMES_ORDER.includes(normalizedName as PalaceName)
    ? (normalizedName as PalaceName)
    : selection.palaceName;
  const palace = findPalaceByName(chart, inferredPalaceName)
    ?? chart.palaces.find((item) => item.isThanPalace && normalizedName === 'Cung Thân');
  const kind = classifyGlossaryKind(normalizedName);
  const profile = getGlossaryInsightProfile(normalizedName);
  const familyInsight = buildStarFamilyInsight(chart, normalizedName);

  const tags = dedupeTags([
    kind === 'palace' ? 'Cung chức' : '',
    kind === 'state-marker' ? 'Chỉ dấu lá số' : '',
    palace?.isThanPalace && kind === 'palace' ? 'Thân cư cung này' : '',
    palace?.hasTuanKhong && normalizedName === 'Tuần' ? `Tác động tại ${palace.palaceName}` : '',
    palace?.hasTrietKhong && normalizedName === 'Triệt' ? `Tác động tại ${palace.palaceName}` : '',,
    palace?.trangSinh === normalizedName ? `Hiện diện tại ${palace.palaceName}` : '',
    palace ? `${palace.can}.${palace.chi}` : '',
    ...familyInsight.tags,
  ]);

  const relatedItems = dedupeRelated([
    ...buildPalaceRelatedItems(palace, normalizedName),
    ...familyInsight.relatedItems,
    ...(normalizedName === 'Cung Thân' && palace
      ? palace.mainStars.slice(0, 2).map((star) => ({ kind: 'star' as const, name: star.name, label: star.name }))
      : []),
  ]);

  let subtitle = 'Khái niệm và chỉ dấu dùng để đọc lá số.';
  if (kind === 'palace' && palace) {
    subtitle = `Cung ${palace.palaceName} đang an tại ${palace.can}.${palace.chi} trên lá số này.`;
  } else if (kind === 'state-marker' && palace) {
    subtitle = `Chỉ dấu này đang gắn với cung ${palace.palaceName} trên lá số hiện tại.`;
  } else if (kind === 'state-marker') {
    subtitle = 'Chỉ dấu phụ trợ giúp đọc trạng thái và lực tác động của một cung.';
  }

  return {
    kind,
    title: normalizedName,
    subtitle,
    description: profile.description ?? getGlossaryDescription(normalizedName),
    keywords: dedupeKeywords([...profile.keywords, ...familyInsight.keywords]),
    sections: dedupeSections([
      ...profile.sections,
      ...familyInsight.sections,
      ...buildGlossaryDynamicSections(chart, normalizedName, kind, palace),
    ]),
    tags,
    context: {
      palaceName: palace?.palaceName,
      chi: palace?.chi,
      isThanPalace: palace?.isThanPalace,
      trangSinh: palace?.trangSinh,
      daiHan: palace?.daiHan,
    },
    relatedItems,
    exploreGroups: buildTermExploreGroups(chart, normalizedName, kind, palace, relatedItems),
  };
}
