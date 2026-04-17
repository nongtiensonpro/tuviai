import type { InsightProfile } from '../core/types/ZiweiTypes';
import { getGlossaryDescription, resolveGlossaryTerm } from './GlossaryDescriptions';
import { STAR_DESC, getStarDescription } from './StarDescriptions';

function cleanName(name: string): string {
  return name.replace(/\[.*?\]|\(.*?\)/g, '').trim();
}

const STAR_PROFILES: Record<string, InsightProfile> = {
  'Tử Vi': {
    keywords: ['Quyền uy', 'Lãnh đạo', 'Chế hóa'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Tử Vi là trung tâm quyền lực của nhóm chính tinh, thiên về trật tự, danh vị và khả năng đứng mũi chịu sào. Nhiều tài liệu cổ xem đây là khí tượng của người có tầm bao quát và muốn nắm thế chủ động.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi đi cùng cát tinh và được nâng đỡ đúng cách, sao này thường biểu lộ thành tác phong đĩnh đạc, biết gánh việc, có uy tín và giỏi ổn định cục diện. Đây cũng là mẫu sao hay phát huy tốt khi có cộng sự tin cậy và hệ thống rõ ràng.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Nếu thiếu quần thần hoặc bị nhiều lực cản, Tử Vi dễ thành cô quân: trọng sĩ diện, khó hạ cái tôi, muốn điều khiển nhiều hơn lắng nghe. Khi đó năng lực lãnh đạo vẫn có nhưng hiệu quả thực thi giảm do bị cô lập hoặc bị danh vị kéo đi quá mạnh.',
      },
    ],
  },
  'Thiên Cơ': {
    keywords: ['Mưu lược', 'Linh hoạt', 'Biến động'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Thiên Cơ thiên về trí óc chuyển động, kế hoạch, suy luận và khả năng xoay xở. Đây là sao thường gắn với tư duy chiến lược, sự linh hoạt và năng lực nhìn ra nhiều phương án trong cùng một tình huống.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi được cát tinh nâng đỡ, Thiên Cơ nổi bật ở óc học hỏi, sự nhanh trí, khả năng lập kế hoạch và xử lý bài toán phức tạp. Các tài liệu cũng thường liên hệ sao này với kỹ thuật, thiết kế, máy móc, nghiên cứu và các công việc cần đầu óc thích nghi.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Mặt trái của Thiên Cơ là nghĩ nhiều hơn làm, dễ lao tâm, đổi ý nhanh hoặc đứng núi này trông núi khác. Nếu bị hung sát kéo lệch, sự thông minh có thể biến thành lo âu, mưu mẹo hoặc thiếu sức bám để đi đường dài.',
      },
    ],
  },
  'Thái Dương': {
    keywords: ['Quang minh', 'Danh vị', 'Phụ trách'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Thái Dương là khí tượng của ánh sáng, sự công khai, danh tiếng và vai trò dẫn dắt ra bên ngoài. Nhiều trường phái xem đây là sao của trách nhiệm xã hội, uy tín và tinh thần giúp người.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi sáng sủa, sao này biểu hiện thành lòng hào hiệp, sự chính trực, khả năng gánh việc và nhu cầu tạo ảnh hưởng tích cực. Nó hợp với môi trường cần xuất hiện trước công chúng, truyền lửa, dẫn dắt tập thể hoặc gánh vai trò trụ cột.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Khi hãm hoặc bị bào mòn, Thái Dương dễ thành lao tâm, tự hao vì trách nhiệm, quá tin vào chính nghĩa của mình hoặc bị tổn thương vì không được ghi nhận. Người có khí Thái Dương mạnh cũng dễ nóng vì lý tưởng và khó chịu khi bị che khuất vai trò.',
      },
    ],
  },
  'Vũ Khúc': {
    keywords: ['Tài tinh', 'Kỷ luật', 'Thực chiến'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Vũ Khúc là sao thiên về hành động, tài chính, kỷ luật và năng lực chốt việc. Khí chất của sao này thường thực tế, thẳng, gọn và chú trọng hiệu suất hơn hình thức.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi đi đúng hướng, Vũ Khúc cho thấy sự bền gan, bản lĩnh chịu áp lực, khả năng quản tiền và tinh thần làm đến cùng. Đây là dạng sao hợp môi trường cần quyết định nhanh, làm thật và chịu trách nhiệm bằng kết quả.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Mặt trái thường nằm ở sự cứng, ít mềm hóa, khó biểu lộ cảm xúc và dễ cô độc vì tiêu chuẩn quá cao. Nếu đi cùng sát tinh nặng, năng lượng này có thể thành khắc nghiệt, thắng thua quá mạnh hoặc đặt hiệu quả lên trên sự tinh tế trong quan hệ.',
      },
    ],
  },
  'Thiên Đồng': {
    keywords: ['Phúc khí', 'An hòa', 'Dễ mến'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Thiên Đồng gắn với phúc, sự mềm mại, tinh thần hưởng thụ đời sống và khả năng giữ bầu không khí dễ chịu. Đây là sao thường mang nét trẻ trung, nhân hậu và thích sống trong cảm giác yên ổn.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi được kích hoạt đúng cách, Thiên Đồng cho sự lạc quan, nhân duyên tốt, biết cảm thông và giỏi làm dịu xung đột. Tài liệu cổ lẫn hiện đại đều nhấn mạnh đây là sao có phúc khí và dễ được yêu quý nhờ tính gần gũi.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Nếu thiếu lực thúc đẩy, Thiên Đồng dễ nghiêng sang né áp lực, chậm quyết, ngại việc nặng hoặc nói hay hơn làm. Vì vậy sao này thường cần môi trường hoặc sao đi kèm đủ lực để biến thiện ý thành hành động thật.',
      },
    ],
  },
  'Liêm Trinh': {
    keywords: ['Nguyên tắc', 'Phân tranh', 'Đào hoa sắc bén'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Liêm Trinh là sao mang đồng thời tính nguyên tắc, cảm xúc mạnh và sắc thái đào hoa. Nó thường tạo nên mẫu người có lập trường rõ, thích tự do và phản ứng khá mạnh khi chạm vào đúng sai hoặc ranh giới cá nhân.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi được cát tinh tiết chế, Liêm Trinh biểu hiện thành sự ngay thẳng, dám chịu trách nhiệm, giao tiếp sắc sảo và biết giữ chuẩn mực. Đây là năng lượng hợp với những vai trò cần bản lĩnh, khí chất và khả năng đấu tranh cho nguyên tắc.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Khi đi cùng sát khí hoặc Hóa Kỵ, sao này dễ trở nên cực đoan, nóng tranh chấp, dễ bị kéo vào rối ren pháp lý, cảm xúc hoặc quan hệ. Liêm Trinh mạnh mà thiếu độ mềm thường thành “quá cứng với thế giới” và tự làm căng chính mình.',
      },
    ],
  },
  'Thiên Phủ': {
    keywords: ['Kho tàng', 'Ổn định', 'Quản trị'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Thiên Phủ là khí tượng của kho chứa, nền tảng, sự đầy đặn và năng lực giữ hệ thống vận hành ổn. Sao này thiên về bảo toàn, tích lũy và xử lý nguồn lực một cách có lớp lang.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi tốt, Thiên Phủ cho cảm giác đáng tin, bao dung, biết quản trị tiền bạc và giữ nhịp ổn định cho tập thể. Đây là một trong những sao dễ hợp vai trò quản lý hậu cần, tài chính, điều phối và xây nền dài hạn.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Nếu thiên quá về giữ mà không chịu mở, Thiên Phủ có thể thành bảo thủ, ngại đổi mới, thích yên vị và dễ chậm bứt phá. Người mang khí này mạnh đôi khi rất biết giữ của nhưng lại khó bước qua vùng an toàn.',
      },
    ],
  },
  'Thái Âm': {
    keywords: ['Nội tâm', 'Tích lũy', 'Mỹ cảm'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Thái Âm thuộc về phần âm nhu, chiều sâu nội tâm, cảm giác an cư và năng lực nuôi dưỡng giá trị bền. Đây là sao gắn với tài khí tích tụ, đời sống cảm xúc và sự tinh tế trong cách cảm nhận thế giới.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi đi đúng cách, Thái Âm cho sự nhã nhặn, óc thẩm mỹ, tính kín đáo, năng lực giữ tiền và phát triển qua tích lũy đều đặn. Nó cũng hay gắn với học vấn, văn nghệ, tâm lý, thiết kế hoặc các lĩnh vực cần cảm nhận tinh vi.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Mặt trái thường là đa cảm, quá thiên về tưởng tượng, dễ vướng đào hoa hoặc chần chừ vì cảm xúc thay đổi. Nếu ánh sáng của sao yếu, nội tâm phong phú có thể biến thành lo nghĩ ngầm, sống nặng cảm nhận mà khó quyết đoán.',
      },
    ],
  },
  'Tham Lang': {
    keywords: ['Dục vọng', 'Giao tiếp', 'Đột phá'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Tham Lang là sao của ham muốn, sự sống mạnh, sức hút xã giao và khát vọng nếm trải. Nó không chỉ nói về đào hoa, mà còn nói về khả năng mở quan hệ, làm mới trải nghiệm và xoay chuyển thế cờ bằng bản lĩnh nhập cuộc.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi dùng đúng, Tham Lang cho khả năng kết nối, bán ý tưởng, làm truyền thông, nghệ thuật, kinh doanh và tạo cơ hội nhờ quan hệ. Nhiều tài liệu cũng ghi nhận mặt tốt của sao này ở chỗ linh hoạt, ham học cái mới và dám đổi nhịp sống.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Khi mất cân bằng, sao này dễ nghiêng sang ham vui, quá cảm tính, mau chán, đầu cơ hoặc chạy theo khoái cảm ngắn hạn. Tham Lang mạnh mà thiếu kỷ luật thì rất dễ tỏa sáng nhanh rồi tự làm tiêu hao chính mình.',
      },
    ],
  },
  'Cự Môn': {
    keywords: ['Khẩu tài', 'Phân tích', 'Thị phi'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Cự Môn gắn với lời nói, khả năng mổ xẻ vấn đề, chất vấn và nhìn ra phần khuất. Đây là sao của biện luận, phản biện, nhưng cũng là cửa ngõ của nghi ngờ và thị phi.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi gặp cát tinh, Cự Môn rất mạnh ở năng lực nói, dạy, đàm phán, điều tra và phân tích sâu. Sao này hợp người cần đào vấn đề đến gốc, dám chỉ ra mâu thuẫn và không dễ tin vào bề mặt.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Nếu bị hung lực kích thích, Cự Môn dễ thành đa nghi, soi lỗi, gây hiểu lầm hoặc tự đẩy mình vào tranh cãi kéo dài. Điểm khó nhất của sao này là dùng được cái sắc mà không để cái sắc cắt vào quan hệ.',
      },
    ],
  },
  'Thiên Tướng': {
    keywords: ['Ấn tín', 'Phò trợ', 'Công bằng'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Thiên Tướng là khí tượng của ấn tín, trật tự, tính phò trợ và tinh thần đứng về lẽ phải. Sao này mạnh ở vai trò hỗ trợ có trách nhiệm hơn là kiểu lãnh đạo áp đảo từ đầu đến cuối.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi đi với cát tinh, Thiên Tướng cho sự chân thành, biết bảo vệ người khác, làm việc cẩn thận và có năng lực điều phối nghiệp vụ. Nó thường hợp các vai trò trung gian, hậu trường, quản trị vận hành hoặc giữ chuẩn mực cho tổ chức.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Mặt trái là quá cẩn trọng, dễ chậm quyết, ngại va chạm và bỏ lỡ thời cơ vì nghĩ cho toàn cục quá nhiều. Khi thiếu lực đẩy, Thiên Tướng dễ tốt bụng nhưng thiếu đột phá, thành người giữ nếp hơn là người mở đường.',
      },
    ],
  },
  'Thiên Lương': {
    keywords: ['Che chở', 'Đạo lý', 'Thọ tinh'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Thiên Lương là sao của sự che chở, tiêu chuẩn đạo lý và tinh thần cứu giải. Nhiều tài liệu cổ gắn sao này với tuổi thọ, đức tính bảo hộ và khuynh hướng đứng ở vị trí người lớn để gánh phần khó cho người khác.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi mạnh, Thiên Lương cho sự chính trực, biết bênh người yếu, có tư chất cố vấn, y học, giáo dưỡng hoặc các vai trò bảo trợ. Đây là dạng sao thường hợp với những ai muốn sống có chuẩn, có ích và giữ cho việc khó không vỡ trận.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Khi lệch, Thiên Lương dễ thành tự cho mình đúng, khó nhận sai, thích làm người phân xử và dễ mệt vì “gánh thay” quá nhiều. Chính khí mạnh là ưu điểm, nhưng nếu cứng quá thì thành bảo thủ và khó hòa vào những môi trường linh hoạt.',
      },
    ],
  },
  'Thất Sát': {
    keywords: ['Sát phạt', 'Quyết đoán', 'Khai phá'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Thất Sát là sao của khí tướng, ý chí tiến công, sức chịu đựng và tinh thần tự thân mở đường. Đây là dạng năng lượng không sợ khó, không thích bị cột chặt và thường trưởng thành qua va đập thực tế.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi được đặt đúng trận địa, Thất Sát rất mạnh ở bản lĩnh hành động, tốc độ quyết định và khả năng dẫn đội trong hoàn cảnh áp lực cao. Nó hợp với môi trường cạnh tranh, cải tổ, xử lý khủng hoảng hoặc nhiệm vụ khó mà người khác ngại làm.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Nếu thiếu tiết chế, Thất Sát dễ thành nóng, cứng, phản ứng quá nhanh hoặc xem rào cản nào cũng là thứ phải phá. Cuộc đời mang khí này thường không đi đường bằng phẳng, mà phải qua thử thách rồi mới lộ đúng sức nặng của bản thân.',
      },
    ],
  },
  'Phá Quân': {
    keywords: ['Phá cũ lập mới', 'Biến động', 'Mạo hiểm'],
    sections: [
      {
        title: 'Khí chất cốt lõi',
        body: 'Phá Quân tượng trưng cho lực phá khuôn, dỡ cấu trúc cũ và mở con đường mới dù phải trả giá bằng biến động. Đây là sao của cải cách, tính thí nghiệm và tâm thế không chịu ở yên trong khuôn sẵn.',
      },
      {
        title: 'Mặt sáng dễ thấy',
        body: 'Khi vận hành tốt, Phá Quân cho tinh thần tiên phong, dám cắt bỏ thứ không còn phù hợp và bước vào vùng chưa ai dám thử. Nó thường hợp với giai đoạn tái cấu trúc, khởi nghiệp, đổi nghề, đổi mô hình hoặc cắt lối sống cũ để tái sinh.',
      },
      {
        title: 'Điểm dễ lệch',
        body: 'Khi mất điểm tựa, sao này dễ thành phá vì thích phá, chán nhanh, bốc đồng, đối kháng và khó giữ quan hệ lâu bền. Phá Quân không xấu ở bản chất, nhưng rất cần mục tiêu đủ rõ để cái phá trở thành tái tạo chứ không biến thành tự hao.',
      },
    ],
  },
  'Tả Phù': {
    keywords: ['Phò tá', 'Tổ chức', 'Hậu thuẫn'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Tả Phù thuộc nhóm Lục Cát và thiên về trợ lực trực tiếp bằng hành động, tổ chức và khả năng đứng cạnh người cầm quyền để gánh việc. Nhiều tài liệu xem đây là mẫu quý nhân “làm thật”, giúp bằng tay chân, hệ thống và sức triển khai.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Đi cùng cát tinh, Tả Phù làm mạnh năng lực điều phối, khả năng tập hợp cộng sự và sức gánh vác thực tế. Khi thiếu chính tinh đủ tầm hoặc gặp nhiều sát khí, lực trợ giúp vẫn còn nhưng dễ hóa thành ôm việc, mang gánh nặng tập thể hoặc bị kéo vào vai phụ quá lâu.',
      },
    ],
  },
  'Hữu Bật': {
    keywords: ['Phò tá', 'Mưu trí', 'Hòa giải'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Hữu Bật cũng thuộc Lục Cát nhưng thiên về trợ lực qua trí tuệ, cảm tình, chiến lược mềm và khả năng hóa giải va chạm. Nếu Tả Phù giống cánh tay thực thi thì Hữu Bật giống người đứng phía sau chỉnh nhịp và nối quan hệ.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi gặp bộ sao sáng, Hữu Bật tăng nhân duyên, giúp người mang số dễ có người đỡ lời, chỉ đường hoặc đứng sau tiếp sức. Khi lệch cách, sự khéo léo này dễ thành quá vòng vo, ưu tiên hòa khí hơn quyết đoán hoặc phụ thuộc quá nhiều vào mạng lưới nâng đỡ.',
      },
    ],
  },
  'Thiên Khôi': {
    keywords: ['Quý nhân', 'Bật lên', 'Đầu tàu'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Thiên Khôi là quý nhân tinh mang sắc thái “mở cửa”, thường liên hệ với cơ hội từ người trên, môi trường lớn hoặc thời điểm thuận lợi bất ngờ. Học viện Lý số cũng nhấn mạnh tính đầu não, thông minh nổi bật và khả năng được giao việc trọng yếu của bộ sao này.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi gặp Xương Khúc, Lộc hoặc chính tinh mạnh, Thiên Khôi rất dễ đẩy người mang số lên vai trò được nhìn thấy và tin cậy. Nếu đi với nhiều hung sát, cơ hội vẫn đến nhưng áp lực trách nhiệm cũng nặng, thậm chí dễ thành kiểu người được kỳ vọng cao rồi phải gánh phần khó hơn người khác.',
      },
    ],
  },
  'Thiên Việt': {
    keywords: ['Quý nhân', 'Che chở ngầm', 'Duyên quý'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Thiên Việt là cặp của Thiên Khôi, mang sắc thái quý nhân âm, trợ lực kín, mềm và có duyên hơn là hiển lộ. Bộ sao Khôi Việt thường báo tín hiệu được người tốt để mắt, dẫn đường hoặc cứu đúng lúc.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi phối cùng cát tinh, Thiên Việt giúp mở những cánh cửa ít ồn ào nhưng rất giá trị: được nâng, được chọn, được quý mến hoặc gặp người tinh tế. Khi lệch, người mang số có thể sống dựa khá nhiều vào vận gặp người, nên lúc thiếu điểm tựa sẽ thấy hụt và dễ mất thế chủ động.',
      },
    ],
  },
  'Văn Xương': {
    keywords: ['Học vấn', 'Logic', 'Danh văn'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Văn Xương là văn tinh nghiêng về học thuật, cấu trúc, lý tính và khả năng diễn đạt mạch lạc. Nguồn Học viện Lý số mô tả sao này liên hệ mạnh với khoa giáp, học hành, thi cử và nền tảng kiến thức bài bản.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi gặp bộ sao sáng, Văn Xương giúp tư duy rõ, viết nói tốt, học nhanh và làm việc có bố cục. Khi lệch, chất văn này có thể thành cầu toàn, lý thuyết nhiều hơn thực chiến hoặc quá bận chứng minh mình đúng về mặt lý lẽ.',
      },
    ],
  },
  'Văn Khúc': {
    keywords: ['Nghệ cảm', 'Biểu đạt', 'Tài hoa'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Văn Khúc là cặp của Văn Xương nhưng nghiêng về cảm xúc, thẩm mỹ, âm điệu và cách biểu đạt giàu sức hút hơn. Nếu Xương là văn có cấu trúc thì Khúc là văn có hồn, dễ đi vào nghệ thuật, cảm quan và hùng biện duyên dáng.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi sáng, Văn Khúc giúp nói có duyên, cảm được người khác, làm đẹp ý tưởng và biến tri thức thành thứ dễ chạm vào cảm xúc. Khi lệch, nó dễ thành lãng mạn hóa vấn đề, thiên cảm tính hoặc dùng tài ăn nói để lướt qua phần khó của thực tế.',
      },
    ],
  },
  'Kình Dương': {
    keywords: ['Xung lực', 'Va chạm', 'Quyết liệt'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Kình Dương là một trong Lục Sát, tượng trưng cho lực xung thẳng, quyết liệt, hình thương và đối đầu trực diện. Các nguồn luận giải thường xem đây là kiểu năng lượng “lưỡi dao”: cắt nhanh, đi mạnh và ít kiên nhẫn với vòng vo.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Ở cách cục mạnh, Kình Dương cho can đảm, khí phách, dám nói dám làm và sức mở đường trong hoàn cảnh cứng. Khi lệch, nó thành hiếu thắng, vội va chạm, làm việc quá tay hoặc gây thương tổn cho mình và người khác vì phản ứng quá mạnh.',
      },
    ],
  },
  'Đà La': {
    keywords: ['Dây dưa', 'Trì kéo', 'Áp lực ngầm'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Đà La là mặt còn lại của Kình Đà, không chém thẳng như Kình Dương mà thiên về kéo dài, cản trở ngầm, chậm mà sâu. Đây là kiểu sát khí làm người ta mệt vì không bùng nổ một lần mà cứ trì níu và bào lực dần.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Nếu được chính tinh mạnh điều tiết, Đà La có thể biến thành sức chịu đựng, độ lì và khả năng bám việc dài hơi. Khi lệch, nó thành ám ảnh, dây dưa, bị kẹt trong nút thắt cũ hoặc sống với áp lực không gọi thành tên.',
      },
    ],
  },
  'Hỏa Tinh': {
    keywords: ['Bộc phát', 'Nóng', 'Tăng tốc'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Hỏa Tinh thuộc bộ Hỏa Linh và Lục Sát, biểu hiện thành bộc phát, sốc nhiệt, phản ứng nhanh và khuynh hướng đẩy mọi thứ lên rất gấp. Học viện Lý số nhấn mạnh cả mặt liều lĩnh lẫn khả năng bật rất mạnh khi gặp đúng cách cục.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi gặp sao sáng, Hỏa Tinh có thể thành khí xung kích, dám làm việc khó, chụp thời cơ nhanh và phá trì trệ. Khi lệch, nó thành nóng nảy, thiếu kiên nhẫn, tai nạn bất ngờ hoặc kiểu thành-bại đều đến rất gấp.',
      },
    ],
  },
  'Linh Tinh': {
    keywords: ['Uẩn khúc', 'Sát ngầm', 'Thâm trầm'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Linh Tinh cùng họ với Hỏa Tinh nhưng sắc thái âm hơn, ngầm hơn và dai hơn. Nếu Hỏa là ngọn lửa bùng ngay trước mắt, Linh là phần nhiệt âm ỉ, dồn nén, chớp lóe và có thể phát tác ở chiều sâu tâm lý.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi được dùng đúng, Linh Tinh cho độ sắc, nhạy, khả năng cảm ra nguy cơ sớm và sức phản ứng rất lẹ. Khi lệch, nó dễ thành hậm hực, âm ỉ, khó xả áp lực và có xu hướng giữ trong người những xung động phá hủy.',
      },
    ],
  },
  'Địa Không': {
    keywords: ['Khoảng rỗng', 'Phá chấp', 'Đứt nền'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Địa Không là một trong cặp Không Kiếp, biểu trưng cho khoảng rỗng, đứt nền, hư vô và mặt không nắm giữ được của sự vật. Hung ở chỗ tạo cảm giác mất lực, trống tay hoặc đang có mà hóa không.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Ở tầng cao, Địa Không có thể cho tư duy triết học, phá khuôn và sức buông những thứ không còn thật. Ở tầng thấp, nó dễ thành ảo tưởng, hụt nền, toan tính thiếu thực tế hoặc tự tay làm rỗng thành quả của mình.',
      },
    ],
  },
  'Địa Kiếp': {
    keywords: ['Đoạt mất', 'Biến cố', 'Đảo chiều mạnh'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Địa Kiếp là mặt “mất hữu hình” của cặp Không Kiếp, thiên về biến cố đoạt mất, phá tài, sự cố mạnh và cảm giác bị lấy đi quá nhanh. Đây là hung tinh khó chịu vì thường đến theo kiểu xoay cục diện bằng cú giật mạnh.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi được cách cục mạnh nâng, Địa Kiếp có thể cho bản lĩnh sống sót sau khủng hoảng, đầu óc phi truyền thống và khả năng tái cấu trúc nhanh. Khi lệch, nó biểu lộ thành mất mát, tranh đoạt, đứt dòng tài lực hoặc nếm trải biến cố khó lường.',
      },
    ],
  },
  'Lộc Tồn': {
    keywords: ['Tài lộc bền', 'Giữ của', 'Thiên lộc'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Lộc Tồn là quý tinh thiên về lộc thật, tiền bạc, phúc thọ và năng lực giữ nguồn lực. Tư liệu Học viện Lý số nhấn mạnh đây là sao phú, hợp với tích lũy bền, hưởng lộc tổ tiên hoặc gặp đúng nguồn nâng đỡ vật chất.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi đi với bộ tài tinh và quý tinh, Lộc Tồn giúp tài khí dày, giữ của chắc, sống thận trọng và biết bảo toàn thành quả. Khi bị Không Kiếp, Tuần Triệt hoặc sát khí nặng kéo lệch, sao này dễ biến thành giữ chặt, sợ mất, chậm xoay xở hoặc có lộc rồi lại hao vì chính chuyện tiền.',
      },
    ],
  },
  'Hóa Lộc': {
    keywords: ['Khai lộc', 'Mở nguồn lực', 'Khuếch đại hấp lực'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Hóa Lộc thuộc bộ Tứ Hóa và là tín hiệu mở nguồn lực, gia tăng sức hút, tài lộc và nhu cầu phát triển. Nhiều sách xem đây là hóa khí làm sao gốc trở nên hấp dẫn hơn, dễ sinh thêm cơ hội và nhân duyên.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi nhập đúng sao và đúng cung, Hóa Lộc giúp đẩy cơ hội, tiền bạc hoặc cảm tình lên rõ. Khi lệch, nó vẫn làm mạnh ham muốn, nên người mang số dễ bị lôi bởi hưởng thụ, tham nhiều đầu hoặc vì thích quá mà thành khó giữ cân bằng.',
      },
    ],
  },
  'Hóa Quyền': {
    keywords: ['Thực quyền', 'Chủ động', 'Điều phối'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Hóa Quyền là hóa khí của quyền thế, sức nắm thế chủ động và khả năng điều phối cục diện. Các tư liệu Tứ Hóa xem đây là tín hiệu làm sao gốc trở nên mạnh về thực thi, tiếng nói và ảnh hưởng thực tế.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi sáng, Hóa Quyền tăng bản lĩnh, uy tín, sức điều khiển và năng lực ra quyết định. Khi lệch, nó rất dễ biến thành tự cao, muốn kiểm soát, thích áp lực quyền lực hoặc luôn thấy mình phải nắm tay lái mới yên.',
      },
    ],
  },
  'Hóa Khoa': {
    keywords: ['Thanh danh', 'Chuẩn mực', 'Giải ách'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Hóa Khoa là một trong những hóa khí đẹp nhất của Tứ Hóa, chủ về thanh danh, học thức, chuẩn mực và khả năng cứu giải. Học viện Lý số cũng xem đây là phúc tinh mạnh về danh tín, văn minh và năng lực giảm bớt tai ách.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi nhập đúng cách, Hóa Khoa giúp người ta được tin, được nể, dễ giữ hình ảnh sạch và vượt qua rắc rối bằng tri thức hoặc chính danh. Khi lệch, nó có thể thành quá giữ thể diện, nặng danh dự hoặc thích “đúng chuẩn” đến mức khó sống mềm với hoàn cảnh.',
      },
    ],
  },
  'Hóa Kỵ': {
    keywords: ['Ràng buộc', 'Phiền não', 'Điểm nghẽn'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Hóa Kỵ là hóa khí của trở lực, uất kết, thị phi và những phần khó nói thành lời. Trong bộ Tứ Hóa, đây là sao thường làm sao gốc lộ ra bài toán sâu nhất: chấp niệm, vướng mắc, nợ cảm xúc hoặc sự cố phải học qua va chạm.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi được cách cục đủ tốt nâng, Hóa Kỵ không chỉ gây khó mà còn tạo chiều sâu, sức chịu đựng và năng lực nhìn ra chỗ bất toàn. Khi lệch, nó thành bức bối, ghen, hiểu nhầm, tự mắc kẹt trong suy nghĩ hoặc để một nút thắt nhỏ kéo dài rất lâu.',
      },
    ],
  },
  'Thiên Mã': {
    keywords: ['Dịch chuyển', 'Thay đổi', 'Bật tiến'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Thiên Mã chủ về chuyển động, phương tiện, thay đổi chỗ đứng và nhịp đi xa để mở vận. Học viện Lý số còn nhấn mạnh mặt tháo vát, đa tài và khả năng tăng cơ hội khi con người chịu dịch chuyển ra khỏi thế đứng cũ.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi gặp bộ sao thuận, Thiên Mã cho năng lượng dấn thân, đi xa, đổi môi trường và thăng tiến nhờ di chuyển. Khi bị sát tinh kéo lệch, cùng lực dịch chuyển đó lại dễ thành tai nạn, bôn ba quá mức, bất an hoặc phải chạy vì hoàn cảnh thay vì chủ động tiến lên.',
      },
    ],
  },
  'Đào Hoa': {
    keywords: ['Hấp lực', 'Duyên tình', 'Tam Minh'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Đào Hoa là cát tinh thuộc nhóm Tam Minh, chủ về sức hút, duyên dáng và khả năng tạo kết nối cảm xúc giữa người với người. Nguồn Học viện Lý số phân biệt rõ đây không chỉ là tình ái mà còn là độ có duyên, được chú ý và dễ được mến mộ.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi đi với cát tinh, Đào Hoa giúp nhân duyên, hình ảnh, nghệ cảm và cơ hội từ các quan hệ. Khi lệch hoặc bị nhiều sát khí hội, nó thành ham vui, dễ bị chuyện tình cảm kéo lệch công việc, hoặc sống quá nhiều bằng lực hấp dẫn mà thiếu trọng tâm.',
      },
    ],
  },
  'Hồng Loan': {
    keywords: ['Duyên sắc', 'Hỷ sự', 'Tình cảm được hướng vào'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Hồng Loan cùng Đào Hoa và Thiên Hỷ tạo thành nhóm Tam Minh, nhưng thiên về sắc thái được yêu mến, được hướng tình cảm về mình và dễ có tin vui liên quan đến duyên phận. Học viện Lý số mô tả sao này khá mạnh về duyên sắc và sự thu hút từ hình tướng lẫn tâm tướng.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi sáng, Hồng Loan làm tăng duyên, khéo léo, cảm tình và may mắn từ đối tác hoặc người khác phái. Khi lệch, sức hút đó lại kéo theo liên lụy cảm xúc, rắc rối chuyện tình hoặc cảm giác đời sống bị chi phối quá nhiều bởi chuyện được-ghét.',
      },
    ],
  },
  'Thiên Hỷ': {
    keywords: ['Hỷ khí', 'Tin vui', 'Tươi sáng'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Thiên Hỷ là thiện tinh của niềm vui, đám cưới, tin mừng, tiếng cười và bầu không khí dễ chịu. Đây là sao làm nhẹ lòng người, giúp cuộc sống có chỗ bật sáng và thường đem cảm giác “có hỷ khí” khi xuất hiện đúng chỗ.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi hội cát tinh, Thiên Hỷ tăng sự dễ mến, duyên giao tiếp và khả năng đưa chuyện nặng về trạng thái nhẹ hơn. Khi lệch, nó có thể thành thích vui quá mức, mê không khí lễ hội hoặc giữ thái độ bông đùa ở những lúc lẽ ra cần đi sâu và nghiêm túc hơn.',
      },
    ],
  },
  'Long Trì': {
    keywords: ['Thanh quý', 'Phong thái', 'Long Phượng'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Long Trì là một mắt xích quan trọng của bộ Long Phượng và Tứ Linh, thiên về phong thái thanh quý, hỷ sự và cảm giác được nâng thành “danh phận”. Các tư liệu Học viện Lý số cũng xem sao này liên quan đến may mắn, quyền quý và vẻ đẹp có khí chất.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi đi với Khôi Việt, Xương Khúc hoặc chính tinh sáng, Long Trì giúp hình thành tiếng tăm, phong độ và quý khí. Khi không có lực nâng đi kèm, nó vẫn cho nét thanh nhã nhưng dễ dừng ở vẻ ngoài, có danh mà tiền chưa theo kịp hoặc cảm giác đẹp khuôn hơn là thực quyền.',
      },
    ],
  },
  'Phượng Các': {
    keywords: ['Thanh quý', 'Nhã sắc', 'Long Phượng'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Phượng Các là nửa còn lại của bộ Long Phượng, thiên về vẻ đẹp có khuôn phép, văn khí, sự trau chuốt và danh dự kéo dài. Đây là kiểu sao làm người ta “đẹp theo nghĩa có khí chất”, không ồn mà có độ sang riêng.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi phối cùng Xương Khúc, Khôi Việt hoặc cát tinh, Phượng Các tăng danh nhờ tài nghệ, học vấn và phong thái. Khi lệch, nó có thể làm người mang số quá chăm vào hình tượng, giữ vẻ ngoài kỹ nhưng bên trong dễ mệt vì phải sống đúng với hình ảnh thanh quý ấy.',
      },
    ],
  },
  'Ân Quang': {
    keywords: ['Ân sủng', 'Tưởng thưởng', 'Quang Quý'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Ân Quang thuộc bộ Quang Quý, thiên về tưởng thưởng, sự đặc ân, danh dự được ban và phước may đến như có người soi đường. Học viện Lý số phân biệt bộ này với Tả Hữu ở chỗ đây là lực nâng mang màu “ân huệ” hơn là trợ giúp trực tiếp từ người đời.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi gặp cát tinh, Ân Quang giúp người mang số hay được khen, được nâng danh, được cứu đúng lúc hoặc được nhận phần thưởng xứng đáng. Khi yếu cách, hiệu ứng này vẫn có nhưng dễ thành may mắn rời rạc, thoáng đến rồi qua nếu bản thân không đủ nền để giữ.',
      },
    ],
  },
  'Thiên Quý': {
    keywords: ['Quý khí', 'Ơn nâng', 'Quang Quý'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Thiên Quý là cặp của Ân Quang, nhấn mạnh quý khí, sự trọng vọng và chiều sâu ân nghĩa. Bộ Quang Quý khi sáng thường cho cảm giác được nâng bởi phúc duyên, người tốt, hoặc những cơ hội có tính “được chọn”.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi đi cùng cát tinh, Thiên Quý giúp tăng may lành, danh dự và cả khả năng được linh cảm hoặc trợ lực đúng lúc. Khi lệch, quý khí dễ nằm ở kỳ vọng hơn là thành tựu thật, khiến người mang số cảm thấy mình có tiềm năng nhưng chưa dễ chuyển hóa thành vị thế bền.',
      },
    ],
  },
  'Thiên Đức': {
    keywords: ['Đức tinh', 'Giảm gay gắt', 'Tứ Đức'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Thiên Đức thuộc nhóm Tứ Đức, thiên về lòng thiện, sự đoan chính và khả năng làm mềm bớt phần gay gắt của cục diện. Nguồn Học viện Lý số nhấn mạnh tác dụng đạo đức, nhân hậu và việc sao này có thể chế bớt sắc đào hoa quá mạnh.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi hội cùng giải tinh, Thiên Đức tăng cơ hội được giúp, giữ nếp thiện và đi đường chính đáng. Đây không phải kiểu cứu giải thần kỳ mọi tai nạn, nhưng là lớp đức khí giúp con người bớt cực đoan và đỡ tự đẩy mình vào chỗ xấu.',
      },
    ],
  },
  'Nguyệt Đức': {
    keywords: ['Đức tinh âm nhu', 'Nhân hậu', 'Tứ Đức'],
    sections: [
      {
        title: 'Vai trò cốt lõi',
        body: 'Nguyệt Đức cũng thuộc Tứ Đức nhưng mang sắc thái âm nhu, kín đáo và dễ cảm hơn Thiên Đức. Các tài liệu Học viện Lý số đều xem đây là thiện tinh chủ nhân hậu, từ bi, giúp người và có khả năng giảm bớt tai ách nhỏ.',
      },
      {
        title: 'Khi đi đúng và khi lệch',
        body: 'Khi sáng, Nguyệt Đức làm dày phúc khí, tăng lòng trắc ẩn và khiến người mang số gặp may nhẹ nhàng hơn là bùng nổ. Đi cùng Đào Hồng, sao này thường chuyển sức hút từ lả lơi sang có duyên có nết, tức được mến vì phẩm hạnh nhiều hơn chỉ vì hấp lực bề ngoài.',
      },
    ],
  },
};

const TERM_PROFILES: Record<string, InsightProfile> = {
  'Cung Thân': {
    keywords: ['Hậu thiên', 'Hành vi thực chiến', 'Hậu vận'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Cung Thân thường được dùng để nhìn phần “người đang sống ngoài đời”: hành vi, lựa chọn, phản xạ khi bước vào thực tế và trọng tâm mà đương số dồn tâm lực khi trưởng thành. So với Cung Mệnh, Thân nghiêng nhiều hơn về biểu hiện hậu thiên và nhịp vận hành sau tuổi trẻ.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Tư liệu Học viện Lý số nhấn mạnh Cung Thân luôn đồng cung với một trong sáu vị trí: Mệnh, Phúc Đức, Quan Lộc, Thiên Di, Tài Bạch hoặc Phu Thê. Vì vậy khi đọc Thân, nên xem nó đang “bám” vào lĩnh vực nào của đời sống để biết đương số sẽ sống mạnh ở đâu ngoài thực tế.',
      },
    ],
  },
  'Mệnh Chủ': {
    keywords: ['Tiên thiên', 'Tông khí', 'Bản chất gốc'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Mệnh Chủ không thay thế chính tinh thủ Mệnh, mà giống như tông khí nền của bản thân: lối phản ứng gốc, màu khí bẩm sinh và kiểu động lực thường xuyên lặp lại khi đương số đối diện đời sống.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Nên đọc Mệnh Chủ như một “tầng nền” rồi mới phối với chính tinh tại Mệnh, tam phương và Cung Thân. Khi nền với sao thủ Mệnh tương hợp, khí chất thường liền mạch; khi nghịch nhau, người đó dễ phải sống qua một quá trình tự điều chỉnh rất rõ.',
      },
    ],
  },
  'Thân Chủ': {
    keywords: ['Hậu thiên', 'Biểu hiện', 'Cách hành động'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Thân Chủ gợi ra kiểu vận động ngoài đời, tức cách đương số biểu lộ năng lượng khi đã nhập cuộc với công việc, quan hệ và hoàn cảnh thật. Đây là lớp tín hiệu rất hữu ích để hiểu vì sao một người “bản chất nghĩ một kiểu nhưng ra đời lại hành động kiểu khác”.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Muốn dùng Thân Chủ tốt, nên phối cùng Cung Thân, chính tinh tại cung Thân cư và các sao tác động mạnh vào hậu vận. Nó đặc biệt hữu ích khi cần đọc phong cách xử lý việc, sức gánh và kiểu bộc lộ bản thân trước đời.',
      },
    ],
  },
  'Đại Hạn': {
    keywords: ['Chu kỳ 10 năm', 'Trọng tâm thời kỳ', 'Bối cảnh vận'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Đại Hạn cho biết mỗi giai đoạn 10 năm của cuộc đời nghiêng nặng về cung nào và loại bài toán nào nổi bật hơn. Nó không phủ định lá số gốc, mà là lớp bối cảnh thời kỳ làm một số tín hiệu mạnh lên rõ rệt.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Khi xem Đại Hạn, đừng chỉ nhìn con số tuổi. Cần nhìn cung đang nhận hạn, sao thủ cung, tam phương tứ chính, Tuần/Triệt và sự hợp-khắc với mệnh cục để biết giai đoạn đó là mở đường, tích lũy hay trả bài học.',
      },
    ],
  },
  'Tiểu Hạn': {
    keywords: ['Dòng năm', 'Kích hoạt ngắn hạn', 'Điểm nổi lên'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Tiểu Hạn soi từng năm cụ thể và cho biết năm đó điều gì trồi lên rõ hơn trong bức tranh đang có của Đại Hạn. Nó giống lớp nhấn nhá giúp xác định thời điểm cơ hội, va chạm hoặc thay đổi được kích hoạt.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Nên dùng Tiểu Hạn để xác định nhịp năm, chứ không tách rời khỏi lá số gốc và Đại Hạn. Một tín hiệu mạnh trong Tiểu Hạn sẽ dễ ứng nếu nó đồng pha với giai đoạn lớn mà đương số đang đi qua.',
      },
    ],
  },
  'Tràng Sinh': {
    keywords: ['Chu kỳ khí', 'Sinh vượng suy tuyệt', 'Nhịp năng lượng'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Vòng Tràng Sinh mô tả chu kỳ sinh trưởng của khí, từ lúc phát sinh đến lúc cực thịnh rồi suy, tuyệt và tái dưỡng. Nhiều tài liệu coi đây là một trong ba vòng quan trọng vì nó cho biết cung ấy đang nhận nguồn sinh lực mạnh hay yếu.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Tràng Sinh không nên bị đọc như phán quyết độc lập. Nó hiệu quả nhất khi dùng như lớp “nhiệt độ năng lượng” của cung: có nâng đỡ sao đang tọa thủ hay làm lộ ra trạng thái tiêu hao, đình trệ và cần thời gian tích dưỡng.',
      },
    ],
  },
  'Vô Chính Diệu': {
    keywords: ['Không chính tinh', 'Lệ thuộc phối cung', 'Đọc qua thế đứng'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Vô Chính Diệu không có nghĩa là cung rỗng và vô nghĩa. Nó chỉ nói rằng bản cung không có chính tinh tọa thủ, nên lực luận đoán phải chuyển mạnh sang phụ tinh, tam phương tứ chính, đối cung và cách mượn chính tinh.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Muốn đọc đúng Vô Chính Diệu phải bỏ thói quen nhìn một cung như một điểm đứng độc lập. Cung này thường phản ứng rất nhạy với bối cảnh chung của toàn lá số, nên càng cần xem thế phối hợp hơn là đọc từng sao đơn lẻ.',
      },
    ],
  },
  'Mượn Chính Tinh': {
    keywords: ['Mượn lực đối cung', 'Điểm tựa luận đoán', 'Không đồng nhất'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Mượn Chính Tinh là kỹ thuật lấy chính tinh từ cung xung chiếu làm điểm tựa để luận cung Vô Chính Diệu. Điều này cho thấy bản cung đang nhận lực giải thích mạnh từ đối cung chứ không tự đứng bằng chính tinh của nó.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Điểm quan trọng là “mượn” không đồng nghĩa “biến thành”. Cung Vô Chính Diệu vẫn là chính nó, chỉ là cách biểu hiện bị dẫn mạnh bởi đối cung, nên luôn cần xem thêm phụ tinh và toàn bộ mạch tam phương để tránh luận quá tay.',
      },
    ],
  },
  'Tuần': {
    keywords: ['Làm chậm', 'Làm hụt', 'Giảm biên độ'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Các tài liệu Học viện Lý số mô tả Tuần như trạng thái “hư vô”, làm cung bị án ngữ trở nên mờ, giảm lực phát tác của sao trong cung. Vì vậy Tuần thường khiến việc đến chậm, qua một lớp thử thách hoặc không bộc lộ thẳng ngay từ đầu.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Tuần không cắt mạnh như Triệt, nên cấu trúc tam hợp và xung chiếu vẫn còn khả năng hình thành cách cục. Tuy vậy, bản cung có Tuần thường bị giảm biên độ: cát không bùng sớm, hung cũng bớt đánh trực diện nhưng kéo cảm giác lửng, thiếu trọn vẹn.',
      },
    ],
  },
  'Triệt': {
    keywords: ['Cắt ngang', 'Bế tắc', 'Đổi hướng'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Triệt mang tính chặn đứng, cắt gãy và buộc sự việc phải đổi quỹ đạo. So với Tuần, nhiều trường phái xem Triệt mạnh và dứt hơn, nên khi án vào cung nào thì lực tác động lên cung đó thường thấy rõ, nhất là ở giai đoạn đầu đời hoặc lúc bắt đầu một chặng mới.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Triệt có thể chặn cả cát lẫn hung, vì vậy không nên mặc định là xấu tuyệt đối. Nó thường hiệu quả như một lực “bẻ lái”: đang tốt thì bị chặn, đang hung thì bị cắt bớt, nhưng cái giá là mọi việc khó đi theo đường thẳng như dự tính ban đầu.',
      },
    ],
  },
  'Tam Phương Tứ Chính': {
    keywords: ['Đọc liên cung', 'Không luận riêng lẻ', 'Mạch hỗ trợ và đối trọng'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Tam Phương Tứ Chính là khung đọc xương sống của Tử Vi Đẩu Số: bản cung, hai cung tam hợp và cung xung chiếu. Nó giúp người luận biết cung đang xem được ai nâng, bị ai ép, và chuyện của cung đó đang nằm trong một mạng lưới nghiệp lực như thế nào.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Nếu chỉ nhìn một cung riêng lẻ, kết luận rất dễ lệch. Cung yếu nhưng tam phương mạnh vẫn có cửa nâng, còn cung đẹp mà toàn bộ mạng hỗ trợ xấu thì kết quả thực tế thường không bền như vẻ ngoài ban đầu.',
      },
    ],
  },
  'Tam Hợp': {
    keywords: ['Cộng hưởng', 'Ba cung cùng khí', 'Hỗ trợ nền'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Tam Hợp là mối liên kết giữa ba địa chi cùng một khí cục. Trong lá số, đây là lớp nền cộng hưởng rất mạnh vì các cung thuộc cùng tam hợp thường cùng nâng, cùng kéo hoặc cùng phản ánh một bài toán lớn của đời sống.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Khi một cung có tín hiệu mâu thuẫn, tam hợp thường là nơi giúp giải nghĩa: nó nói cho ta biết cung đó đang được hậu thuẫn hay đang mắc nợ một vấn đề ở hai cung còn lại trong nhóm.',
      },
    ],
  },
  'Xung Chiếu': {
    keywords: ['Đối cung', 'Áp lực soi gương', 'Điểm mượn lực'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Xung Chiếu là cung đối diện trực tiếp với bản cung, vừa gây áp lực vừa phản chiếu dữ kiện mà bản cung không tự nói hết. Đây là nơi đặc biệt quan trọng khi bản cung Vô Chính Diệu hoặc khi các tín hiệu trong cung đang quá trái chiều.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Đối cung không phải là “kẻ đối đầu” đơn thuần, mà giống một chiếc gương ép ta phải nhìn nửa còn lại của vấn đề. Nhiều trường hợp bản cung chỉ đọc trọn khi đặt cạnh đối cung của nó.',
      },
    ],
  },
  'Âm Dương': {
    keywords: ['Khí nền', 'Chiều vận hành', 'Thuận nghịch'],
    sections: [
      {
        title: 'Vai trò trong lá số',
        body: 'Âm Dương trong ngữ cảnh lá số không chỉ là một cặp khái niệm triết học, mà là nền khí quyết định cách một người vận động: thiên về bộc lộ hay thu tàng, trực tiến hay vòng lượn, thuận đà hay phải đi qua lực cản.',
      },
      {
        title: 'Cách đọc nhanh',
        body: 'Khi Âm Dương thuận lý, khí nền và chỗ đứng của Mệnh ăn khớp hơn nên đời sống thường liền mạch hơn. Khi nghịch lý, đương số không nhất thiết xấu số, nhưng thường phải qua giai đoạn tự sửa nhịp sống để tìm được cách vận hành phù hợp với mình.',
      },
    ],
  },
  'Lục Cát': {
    description: 'Lục Cát là nhóm sáu phụ tinh tốt trong Tử Vi gồm Tả Phù, Hữu Bật, Thiên Khôi, Thiên Việt, Văn Xương và Văn Khúc. Nhóm này thường làm nhiệm vụ phò tá, mở cơ hội, tăng học vấn, quý nhân và độ sáng của cách cục.',
    keywords: ['Phò tá', 'Quý nhân', 'Học vấn'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Lục Cát không thay chính tinh, nhưng khi đứng đúng chỗ sẽ làm cho chính tinh bớt cô, bớt thô và có thêm đầu ra đẹp hơn. Muốn đọc nhóm này đúng, nên xem chúng đang phò tá cho cung nào và cho chính tinh nào.',
      },
    ],
  },
  'Lục Sát': {
    description: 'Lục Sát là nhóm sáu hung tinh mạnh gồm Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, Địa Không và Địa Kiếp. Đây là nhóm sao tạo va chạm, biến cố, cản trở và sức ép rất lớn lên cung bị hội tụ.',
    keywords: ['Hung sát', 'Va chạm', 'Phá cục'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Lục Sát không phải lúc nào cũng chỉ mang nghĩa phá. Trong lá số cứng cáp, chúng còn cho gan lực, sức chịu áp lực và khả năng bứt khỏi trì trệ. Vấn đề là phải xem chúng đang bị chính tinh điều khiển hay đang lấn chính tinh.',
      },
    ],
  },
  'Tứ Hóa': {
    description: 'Tứ Hóa gồm Hóa Lộc, Hóa Quyền, Hóa Khoa và Hóa Kỵ. Đây là nhóm hóa khí làm sao gốc lộ ra rõ hơn ở bốn mặt: phát triển nguồn lực, quyền thế, thanh danh và bài học vướng mắc.',
    keywords: ['Hóa khí', 'Kích hoạt', 'Biểu hiện mạnh'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Tứ Hóa không đọc tách khỏi sao gốc. Điều quan trọng là xem sao nào nhận hóa, đang nằm ở cung nào và được toàn cục nâng hay phá ra sao; khi đó mới biết hóa khí biến thành cơ hội hay thành bài toán.',
      },
    ],
  },
  'Tả Hữu': {
    description: 'Tả Hữu là bộ sao phò tá gồm Tả Phù và Hữu Bật. Bộ này nói về cộng sự, hậu thuẫn, người trợ lực và khả năng giúp chính tinh bớt cô độc khi hành sự.',
    keywords: ['Phò tá', 'Cộng sự', 'Hậu thuẫn'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Tả Hữu đẹp nhất khi đi với chính tinh có vai trò lãnh đạo, quản trị hoặc cần mạng lưới hỗ trợ. Tả thiên về hành động trực tiếp, Hữu thiên về mưu trí và sự nâng đỡ mềm.',
      },
    ],
  },
  'Khôi Việt': {
    description: 'Khôi Việt là bộ quý nhân tinh gồm Thiên Khôi và Thiên Việt. Bộ này hay báo tín hiệu được nâng đỡ, được trao cơ hội, gặp người tốt hoặc được dẫn tới môi trường sáng.',
    keywords: ['Quý nhân', 'Cơ hội', 'Bật lên'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Khôi Việt mạnh nhất khi đi cùng Xương Khúc, Lộc hoặc chính tinh sáng. Khi đó cơ hội không chỉ đến mà còn chuyển được thành vị thế thật; nếu không, nó dễ chỉ dừng ở mức “được mở cửa” chứ chưa chắc giữ được chỗ đứng.',
      },
    ],
  },
  'Xương Khúc': {
    description: 'Xương Khúc là bộ văn tinh gồm Văn Xương và Văn Khúc, thiên về học thức, biểu đạt, thi cử, nghệ cảm và danh tiếng do tài năng. Đây là một trong những bộ sao hay làm sáng mặt văn minh của lá số.',
    keywords: ['Văn tinh', 'Tri thức', 'Tài hoa'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Xương Khúc đi đẹp thì không chỉ thông minh mà còn “có cách để người khác nhận ra mình thông minh”. Vì vậy bộ này nên đọc cùng chính tinh, Khôi Việt, Long Phượng và các cung Quan, Tài, Di để thấy lối phát thành danh.',
      },
    ],
  },
  'Kình Đà': {
    description: 'Kình Đà là cặp hung tinh gồm Kình Dương và Đà La. Một bên thiên về va chạm thẳng, một bên thiên về cản trở ngầm và kéo dài, nên bộ này thường làm cục diện căng theo cả chiều nổi lẫn chiều chìm.',
    keywords: ['Huyết sát', 'Cản trở', 'Va chạm'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Kình Đà rất nên được đọc cùng thể chất của chính tinh. Chính tinh cứng mà gặp Kình Đà có thể thành bản lĩnh chiến đấu; chính tinh vốn đã gắt mà lại thêm Kình Đà thường dễ thành quá tay, quá cố chấp hoặc hao người vì đối đầu kéo dài.',
      },
    ],
  },
  'Hỏa Linh': {
    description: 'Hỏa Linh là bộ sát tinh gồm Hỏa Tinh và Linh Tinh, thiên về bộc phát, tăng nhiệt, làm sự việc chuyển rất nhanh và dễ vượt ngưỡng. Bộ này có thể là động cơ bứt phá hoặc nguồn tai họa chớp nhoáng tùy cách cục.',
    keywords: ['Bộc phát', 'Tăng nhiệt', 'Sát khí nhanh'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Hỏa Linh gặp chính tinh có nền ổn và được nhiều giải tinh nâng thì có thể biến thành xung lực rất mạnh. Ngược lại nếu nền yếu, bộ này hay làm chuyện gì cũng “quá nhanh, quá nóng, quá khó giữ”.',
      },
    ],
  },
  'Không Kiếp': {
    description: 'Không Kiếp là cặp hung tinh mạnh gồm Địa Không và Địa Kiếp, chủ khoảng rỗng, mất nền, đứt gãy và biến cố đảo chiều. Đây là bộ sao cần đọc bằng toàn cục nhiều hơn từng chữ hung cát riêng lẻ.',
    keywords: ['Phá cục', 'Mất nền', 'Đảo chiều'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Không Kiếp mạnh nhất ở chỗ phá trụ cột cũ. Nếu lá số có lực hồi phục tốt, bộ này còn cho tư duy phá khuôn và sức tái cấu trúc; nếu không, nó dễ để lại cảm giác mất trắng hoặc hụt nền rất rõ.',
      },
    ],
  },
  'Tam Minh': {
    description: 'Tam Minh là nhóm Đào Hoa, Hồng Loan và Thiên Hỷ, thiên về duyên, hỷ khí, sức hút và khả năng được chú ý trong quan hệ người-người. Đây là nhóm sao làm lá số có độ sáng về cảm tình và tương tác xã hội.',
    keywords: ['Duyên', 'Hỷ khí', 'Sức hút'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Tam Minh đẹp thì tăng duyên và cơ hội nhờ người, nhưng không phải cứ nhiều là tốt. Nếu đi với sát khí hoặc vào cung nhạy cảm, nhóm này cũng có thể làm chuyện tình cảm và hình ảnh cá nhân trở thành chỗ vướng lớn.',
      },
    ],
  },
  'Long Phượng': {
    description: 'Long Phượng là bộ sao thanh quý gồm Long Trì và Phượng Các. Bộ này hay làm tăng phong thái, nhan sắc, tài nghệ, danh dự và cảm giác “sang vì khí chất”.',
    keywords: ['Thanh quý', 'Khí chất', 'Danh đến từ tài'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Long Phượng rất nên đọc cùng Xương Khúc và Khôi Việt. Khi các bộ này cùng sáng, tiếng tăm dễ đến từ tài nghệ, học thức và phong thái hơn là chỉ từ may mắn vật chất.',
      },
    ],
  },
  'Quang Quý': {
    description: 'Quang Quý là bộ sao gồm Ân Quang và Thiên Quý, thiên về ân sủng, được tưởng thưởng, được nâng danh và được trợ lực theo cách tinh tế. Đây là phúc quý mang màu “được chiếu cố” hơn là được phò tá trực tiếp.',
    keywords: ['Ân sủng', 'Danh dự', 'Phúc quý'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Quang Quý thường đẹp khi đứng cạnh các cung cần danh, học hay sự công nhận. Bộ này cho cảm giác có người nhìn thấy mình đúng lúc, nhưng nếu bản thân thiếu nền giữ thành quả thì hiệu ứng cũng dễ đến rồi qua.',
      },
    ],
  },
  'Tứ Đức': {
    description: 'Tứ Đức là nhóm Thiên Đức, Nguyệt Đức, Long Đức và Phúc Đức, tượng trưng cho lòng thiện, đức hạnh, phúc khí và khả năng làm mềm bớt sắc gắt của lá số. Đây là nhóm sao cứu giải theo kiểu tích đức và đoan chính.',
    keywords: ['Đức khí', 'Phúc hậu', 'Giảm gay gắt'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Tứ Đức không phải lá bùa xóa hết hung họa, nhưng là lớp đệm rất quý khi lá số có đào hoa mạnh hoặc sát khí nặng. Nó giúp lực xấu bớt bạo và khiến người mang số có xu hướng chọn đường chính hơn.',
      },
    ],
  },
  'Lộc Mã': {
    description: 'Lộc Mã là mạch phối giữa Lộc Tồn và Thiên Mã, thường gợi ra tài lộc đi cùng dịch chuyển, xoay việc, cơ hội ngoài môi trường cũ và sức bật thực tế. Đây là kiểu “đi mới có lộc” khá điển hình trong nhiều lá số.',
    keywords: ['Tài lộc động', 'Đi để mở vận', 'Bật tiến'],
    sections: [
      {
        title: 'Cách đọc nhanh',
        body: 'Lộc Mã hợp với người biết ra khỏi chỗ đứng cũ để mở đường. Nếu bị nhiều sát khí phá, mạch này vẫn động nhưng thành bôn ba hoặc kiếm được rồi phải chạy theo việc để giữ.',
      },
    ],
  },
};

export function getStarInsightProfile(name: string): InsightProfile {
  const normalized = cleanName(name);
  const profile = STAR_PROFILES[normalized];

  return {
    description: profile?.description ?? getStarDescription(normalized),
    keywords: profile?.keywords ?? [],
    sections: profile?.sections ?? [],
  };
}

export function getGlossaryInsightProfile(name: string): InsightProfile {
  const normalized = resolveGlossaryTerm(name);
  const profile = TERM_PROFILES[normalized];

  if (!profile && STAR_DESC[normalized]) {
    return getStarInsightProfile(normalized);
  }

  return {
    description: profile?.description ?? getGlossaryDescription(normalized),
    keywords: profile?.keywords ?? [],
    sections: profile?.sections ?? [],
  };
}
