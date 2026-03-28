# **Thiết Kế Kiến Trúc Và Kế Hoạch Triển Khai Ứng Dụng Tử Vi Đẩu Số Tĩnh Dựa Trên AI (Vibe Coding Với Google Antigravity)**

## **1\. Nền Tảng Lý Thuyết Và Mô Hình Hóa Dữ Liệu Tử Vi Đẩu Số Trong Khoa Học Máy Tính**

Việc xây dựng một ứng dụng Tử Vi Đẩu Số (Zi Wei Dou Shu) đòi hỏi sự am hiểu sâu sắc về các thuật toán thiên văn học cổ đại và khả năng chuyển đổi chúng thành các cấu trúc dữ liệu lập trình hiện đại. Hệ thống này không chỉ đơn thuần là một phương pháp bói toán, mà là một hệ thống phân tích vòng đời phức tạp dựa trên các biến số thời gian và không gian. Quá trình số hóa một hệ thống triết học cổ đại thành một cấu trúc dữ liệu logic đòi hỏi việc phân tách các quy tắc thành những thuật toán xác định.

### **1.1. Lịch Sử Phát Triển Và Nền Tảng Triết Học Thiên Văn**

Tử Vi Đẩu Số, hay "Purple Star Astrology", là một trong những trường phái nghiên cứu vận mệnh hàng đầu trong văn hóa Á Đông, được sử dụng để lập bản đồ các khía cạnh khác nhau của cuộc sống cá nhân nhằm dự báo và cung cấp những hiểu biết sâu sắc về tính cách cũng như quỹ đạo cuộc đời.1 Nguồn gốc của hệ thống này cung cấp một cái nhìn hấp dẫn về sự tiến hóa lịch sử của nó. Theo các văn bản Đạo giáo thời nhà Đường (618 đến 907 SCN), sự ra đời của Tử Vi Đẩu Số thường được cho là do Lữ Động Tân (Lü Dongbin), một học giả và nhà thơ huyền thoại của Trung Quốc sáng tạo ra.1 Hệ thống này ban đầu được sử dụng độc quyền bởi các nhà thiên văn học hoàng gia để tạo ra những bản luận giải vô cùng chi tiết dành riêng cho Hoàng đế Trung Hoa, bởi vận mệnh của Hoàng đế được coi là gắn liền với vận mệnh của cả một quốc gia.2

Đến thời Bắc Tống (960 đến 1127 SCN), Trần Đoàn (Chen Tuan) nổi lên như là học giả đầu tiên được ghi nhận đã hệ thống hóa Tử Vi Đẩu Số.1 Theo thời gian, các học giả và người thực hành bắt đầu tinh chỉnh hệ thống này, rút ra những hiểu biết từ các nghiên cứu về hệ thống chiêm tinh và quan sát thiên thể, bao gồm vị trí của các vì sao và hành tinh. Thời kỳ nhà Minh (1368 đến 1644 SCN) đánh dấu một giai đoạn phát triển rực rỡ, đưa hệ thống này đến hình thái tinh xảo như hiện tại.1

Sự khác biệt cốt lõi giữa Tử Vi Đẩu Số và Tứ Trụ (Bazi \- Four Pillars of Destiny) nằm ở hệ quy chiếu thiên văn. Trong khi hệ thống Bazi dựa trên vị trí của Mặt Trời so với Trái Đất (Dương lịch), thì Tử Vi Đẩu Số là một hệ thống được vẽ ra dựa trên vị trí của Mặt Trăng so với Trái Đất (Âm lịch).1 Các nhà thiên văn học cổ đại đã nhận thấy rằng trong số vô vàn các vì sao, chỉ có một ngôi sao dường như đứng yên và sáng nhất, với các vì sao khác quay xung quanh nó. Ngôi sao này chính là sao Bắc Đẩu (Polaris), được mệnh danh là sao "Đế Vương" (Tử Vi), đóng vai trò là mỏ neo thiên thể cho toàn bộ hệ thống tính toán.2 Sự bất động của nó cung cấp cho các học giả cổ đại một điểm tham chiếu để tìm ra các ranh giới trên bầu trời và vị trí của các vì sao khác.4

Khi tiếp cận dưới góc độ công nghệ Web3 và dữ liệu hiện đại, Tử Vi Đẩu Số hoạt động giống như một "thuật toán cuộc đời" cá nhân.5 Nó có thể được coi là một hệ điều hành với kiến trúc tĩnh (giao thức Tam Hợp \- San He) xác định tiềm năng cốt lõi của một người, và một API động (giao thức Tứ Hóa \- Si Hua) hiển thị các sự kiện cuộc sống theo thời gian thực.5 Trường phái Nam Tông (Southern School) sử dụng phương pháp Tam Hợp với 18 chính tinh và 90 phụ tinh, trong khi trường phái Bắc Tông (Northern School) tập trung vào Tứ Hóa Phi Tinh với 18 chính tinh và 4 sao biến hóa để phân biệt các sự kiện giữa các cung.6 Việc lập trình hệ thống này đòi hỏi phải mô hình hóa cả hai giao thức tĩnh và động này.

### **1.2. Thuật Toán Chuyển Đổi Lịch Và Mô Hình Hóa Dữ Liệu Thời Gian**

Bước đầu tiên trong hệ thống tính toán là xác định chính xác ngày tháng năm sinh theo Âm lịch (Lunar Calendar). Việc này yêu cầu các thuật toán chuyển đổi phức tạp từ Dương lịch sang Âm lịch, bao gồm việc tính toán tháng nhuận và xác định chỉ số Julian Day.7 Đối với môi trường JavaScript/TypeScript tĩnh, các thư viện mã nguồn mở như @dqcai/vn-lunar hoặc lunar-calendar-ts-vi cung cấp nền tảng vững chắc.7 Các thư viện này được xây dựng dựa trên các thuật toán nền tảng của nhà nghiên cứu Hồ Ngọc Đức, cho phép xử lý tính toán Thiên Can và Địa Chi một cách chính xác tuyệt đối.10

Quá trình chuyển đổi đòi hỏi việc sử dụng các lớp đối tượng (Classes) như LunarDate để trích xuất các thuộc tính cốt lõi bao gồm ngày, tháng, năm, trạng thái năm nhuận (leap year), và số ngày Julian (Julian Day Number).7 Thuật toán phải chuyển đổi cấu trúc thời gian này thành hệ thống Can Chi (Stems and Branches). Mười Thiên Can (Giáp, Ất, Bính, Đinh, Mậu, Kỷ, Canh, Tân, Nhâm, Quý) và Mười Hai Địa Chi (Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi) tạo thành một chu kỳ 60 năm (Lục thập hoa giáp) chi phối toàn bộ hệ thống tính toán.3

| Thuộc Tính Lịch Pháp | Mô Tả Vai Trò Trong Thuật Toán Tử Vi | Phương Pháp Lập Trình (TypeScript) |
| :---- | :---- | :---- |
| **Năm Âm Lịch (Thiên Can / Địa Chi)** | Quyết định Vị trí của các sao lưu niên, Vòng Lộc Tồn, Vòng Khôi Việt, và hệ thống Tứ Hóa cốt lõi của bản mệnh. | Sử dụng hàm getYearCanChi(year) từ thư viện @forvn/vn-lunar-calendar để lấy chuỗi Can Chi, sau đó ánh xạ vào các mảng hằng số (Constants).11 |
| **Tháng Âm Lịch** | Kết hợp với giờ sinh để nội suy vị trí của Cung Mệnh (Life Palace) và Cung Thân (Body Palace), đồng thời an định các sao như Tả Phù, Hữu Bật. | Trích xuất thuộc tính lunarDate.month. Áp dụng thuật toán: Từ cung Dần, đếm thuận theo chiều kim đồng hồ đến tháng sinh, sau đó đếm ngược theo chiều kim đồng hồ đến giờ sinh để tìm Cung Mệnh.7 |
| **Ngày Âm Lịch** | Biến số quan trọng nhất cùng với Ngũ Hành Nạp Âm Cục để xác định vị trí của sao Tử Vi (Zi Wei Star) \- trung tâm của mệnh bàn. | Trích xuất thuộc tính lunarDate.day. Đưa vào phương trình chia lấy dư với tham số Cục Ngũ Hành.7 |
| **Giờ Sinh (12 Địa Chi)** | Quyết định vị trí Cung Mệnh (kết hợp với tháng sinh), an định các sao như Văn Xương, Văn Khúc, Địa Không, Địa Kiếp. | Chuyển đổi thời gian hệ 24 giờ sang 12 múi giờ Địa Chi (ví dụ: 23:00 \- 01:00 là giờ Tý). Bản đồ hóa giờ sinh thành chỉ số mảng từ 0 đến 11\. |

### **1.3. Định Vị Thập Nhị Cung (12 Palaces) Và Lưới Không Gian**

Bản đồ Tử Vi bao gồm 12 cung được sắp xếp theo một vòng khép kín. Lớp cơ sở của bản đồ này bao gồm 12 "Địa Chi", không thay đổi, không di chuyển và không xoay vòng.6 Mười hai cung Địa Chi này đại diện cho thời gian và đứng yên như mặt số của một chiếc đồng hồ.6 Mười hai cung chức năng sẽ được xếp chồng lên 12 Địa Chi này tùy thuộc vào thời điểm sinh của mỗi người.12

Mỗi cung trong số 12 cung đại diện cho một khu vực 30 độ của toàn bộ vũ trụ, được nhìn từ vị trí của chúng ta tại thời điểm sinh.6 Các cung này đại diện cho con người và những sự vật mà mệnh tạo trân trọng, xoay vòng qua từng năm.6 Bảy cung mạnh (Strong Palaces) đối với nam giới bao gồm: Mệnh (Destiny \- toàn bộ cuộc đời), Thân (Body \- sau 30 tuổi), Tài Bạch (Wealth), Quan Lộc (Career), Phúc Đức (Fortune/Mental), Thiên Di (Travel), và Phu Thê (Spouse).6 Năm cung yếu (Weak Palaces) bao gồm: Phụ Mẫu (Parents), Giao Hữu/Nô Bộc (Friends/Subordinates), Điền Trạch (Property), Tử Tức (Children), Huynh Đệ (Siblings), và Tật Ách (Health).6 Việc tính toán vị trí của Cung Mệnh là nền tảng. Khi Cung Mệnh đã được xác định, 11 cung còn lại sẽ được điền tự động theo thứ tự ngược chiều kim đồng hồ.15

Sau khi an định các cung, thuật toán phải tính toán "Ngũ Hành Nạp Âm Cục" (Five Elements Bureau).12 Cục này được nội suy từ sự kết hợp giữa Thiên Can và Địa Chi của vị trí Cung Mệnh. Tồn tại năm loại Cục: Thủy Nhị Cục (số 2), Mộc Tam Cục (số 3), Kim Tứ Cục (số 4), Thổ Ngũ Cục (số 5), và Hỏa Lục Cục (số 6).16 Chỉ số của Cục đóng vai trò là một hằng số toán học quan trọng trong phương trình tìm vị trí sao Tử Vi.

### **1.4. Thuật Toán Lập Trình Phân Bổ 108 Vì Sao**

Sự phức tạp của Tử Vi Đẩu Số nằm ở thuật toán tính toán sự tương tác giữa 108 vì sao (hay còn gọi là các dạng năng lượng).2 Mỗi vì sao mang những đặc điểm, tính cách riêng \- cả tích cực lẫn tiêu cực \- và mức độ sáng/tối (Miếu, Vượng, Đắc, Hãm) của chúng quyết định những đặc điểm nào được bộc lộ.2 Sự tương tác của các vì sao này diễn ra trong khía cạnh cụ thể của cuộc đời cá nhân thông qua cung mà chúng tọa lạc.2

Cốt lõi của hệ thống là việc tìm ra vị trí của sao Tử Vi. Đây là ngôi sao Hoàng đế, đại diện cho uy quyền và sự cao quý, là cốt lõi của mọi phép tính Tinh Bàn.2 Thuật toán xác định vị trí của sao Tử Vi phụ thuộc vào hai biến số: Ngày sinh Âm lịch (![][image1]) và Chỉ số Ngũ Hành Cục (![][image2]).2 Trong hệ thống lập trình, quá trình này được xử lý thông qua một phương trình module toán học.

Khi sao Tử Vi đã được an định (trở thành trung tâm tọa độ), 13 chính tinh còn lại trong hệ thống 14 chính tinh sẽ được thiết lập theo các quy tắc hình học không gian cố định.17 Quá trình này được chia thành hai chòm sao chính:

1. **Chòm Tử Vi:** Chòm sao này bao gồm Thiên Cơ, Thái Dương, Vũ Khúc, Thiên Đồng, và Liêm Trinh.18 Các sao này được sắp xếp theo các khoảng cách cung cố định lùi dần từ sao Tử Vi. Nếu Tử Vi ở vị trí X, Thiên Cơ luôn ở vị trí X-1, Thái Dương ở X-3, Vũ Khúc ở X-4, Thiên Đồng ở X-5, và Liêm Trinh ở X-8 (với các phép tính module 12 để đảm bảo không vượt quá giới hạn mảng).  
2. **Chòm Thiên Phủ:** Sao Thiên Phủ luôn đối xứng với sao Tử Vi qua trục Dần \- Thân.17 Nếu Tử Vi nằm ở Dần hoặc Thân, Thiên Phủ sẽ đồng cung với Tử Vi.19 Từ vị trí của Thiên Phủ, các sao Thái Âm, Tham Lang, Cự Môn, Thiên Tướng, Thiên Lương, Thất Sát, và Phá Quân sẽ được an theo một chuỗi quy luật tiến và lùi cố định.19

Hệ thống tiếp tục với việc an định các phụ tinh, bao gồm Lục Sát Tinh (Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, Địa Không, Địa Kiếp) và Lục Cát Tinh (Tả Phù, Hữu Bật, Thiên Khôi, Thiên Việt, Văn Xương, Văn Khúc).14 Ví dụ, Thiên Thương cố định tại cung Nô Bộc, Thiên Sứ cố định tại cung Tật Ách, Thiên La tại Thìn và Địa Võng tại Tuất.14 Thuật toán cũng phải xử lý các sao Tuần Không và Triệt Không, những yếu tố làm suy giảm hoặc đảo ngược bản chất của các sao trong cung.14 Cuối cùng, hệ thống tính toán Tứ Hóa (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ) dựa trên Thiên Can của năm sinh để tạo ra các điểm kích hoạt năng lượng động.14

## **2\. Kiến Trúc Frontend Và Giải Pháp Tạo Web Tĩnh**

Với yêu cầu ứng dụng không lưu trữ trên máy chủ (Serverless), hoạt động hoàn toàn như một trang web tĩnh (Static Web App) và có khả năng triển khai trực tiếp thông qua cơ sở hạ tầng của GitHub Pages, việc lựa chọn framework frontend đóng vai trò quyết định đến trải nghiệm người dùng, khả năng bảo trì mã nguồn và hiệu suất của ứng dụng.20

### **2.1. Phân Tích Kỹ Thuật Framework: Astro, SvelteKit Và React**

Thế giới các trình tạo trang web tĩnh (Static Site Generators \- SSG) và các framework hiển thị phía máy chủ (SSR) hiện đại cung cấp nhiều lựa chọn, nhưng không phải lựa chọn nào cũng tối ưu cho việc tạo ra một biểu đồ Tử Vi phức tạp mà không có sự phụ thuộc vào máy chủ. Trong bối cảnh này, SvelteKit, React (thông qua Next.js), và Astro là ba ứng cử viên sáng giá nhất.20

Mặc dù SvelteKit là một framework giải quyết rất tốt sự cân bằng giữa một trang tài liệu web đơn giản và một ứng dụng một trang (SPA), nó thường mặc định hoạt động như một SPA với SSR.20 SvelteKit tích hợp tính năng chia nhỏ mã tự động (code splitting), nhưng nó thiếu một chế độ Đa trang (MPA \- Multi-Page Application) thực thụ trừ khi tải toàn bộ client router hoặc tắt hoàn toàn tính năng hydration.21 Điều này có thể dẫn đến chi phí băng thông lớn và quản lý yêu cầu HTTP phức tạp trên các nền tảng lưu trữ tĩnh như Vercel hoặc GitHub Pages, nơi một số nhà phát triển đã báo cáo sự cố về số lượng yêu cầu HTTP (lên tới 100 yêu cầu mỗi trang) dẫn đến chi phí vượt mức.24

Astro, ngược lại, là một ứng dụng đa trang (MPA) thực thụ và được thiết kế theo tư duy "Nội dung là trên hết" (Content-driven).20 Điểm độc đáo của Astro là Kiến trúc Đảo (Islands Architecture), cho phép các nhà phát triển tạo ra các trang HTML tĩnh thuần túy theo mặc định và chỉ "kích hoạt" tính tương tác của JavaScript tại những khu vực cụ thể cần thiết.20 Hơn nữa, Astro hoạt động như một hệ sinh thái bất khả tri (framework-agnostic), nghĩa là nó có thể sử dụng các linh kiện (components) từ Svelte, React, Vue.js, và SolidJS trong cùng một dự án.20

Đối với việc thiết kế bảng Tử Vi Đẩu Số \- nơi hiển thị dữ liệu khổng lồ nhưng tính tương tác chủ yếu giới hạn ở việc người dùng chọn cung để xem luận giải (Island) \- Astro kết hợp với React là một sự lựa chọn lý tưởng. React mang lại lợi thế lớn nhờ vào hệ sinh thái thư viện giao diện phong phú. Các thành phần UI có thể tận dụng Tailwind CSS và các thư viện mã nguồn mở như ZenUI (cung cấp hơn 800 linh kiện tùy chỉnh) để xây dựng các bảng điều khiển một cách nhanh chóng.27 Kiến trúc này đảm bảo ứng dụng đạt điểm hiệu năng tối đa khi tải lần đầu trên GitHub Pages, trong khi phần tính toán mệnh bàn vẫn duy trì được sức mạnh phản hồi tức thì.20

| Tính Năng Kiến Trúc | SvelteKit (Trình tạo tĩnh) | Astro (Mặc định tĩnh) | Lựa Chọn Đề Xuất Cho Web Tử Vi |
| :---- | :---- | :---- | :---- |
| **Mô hình Khởi tạo** | Đơn trang (SPA) hoặc MPAs kết hợp.20 Tải bộ định tuyến (router) client-side mặc định.23 | Đa trang (MPA). Xuất ra HTML thuần, không chứa mã JavaScript theo mặc định.20 | **Astro**: Tối ưu hóa kích thước tệp tải xuống, hoàn hảo cho việc phân phối nội dung bói toán tĩnh trên GitHub Pages.20 |
| **Quản lý Tính tương tác** | Gắn kết (Hydration) toàn bộ ứng dụng, dễ gặp vấn đề về yêu cầu mạng nếu không tối ưu tốt.24 | Kiến trúc Đảo (Islands). Chỉ tải JavaScript cho các khối logic cụ thể (như bảng điều khiển API).25 | **Astro**: Đảm bảo khu vực tính toán lịch Âm và Mệnh Bàn hoạt động nhanh chóng mà không chặn luồng giao diện.25 |
| **Tính linh hoạt thư viện UI** | Bị giới hạn trong hệ sinh thái của Svelte.20 | Hỗ trợ đa framework (React, Vue, Svelte) thông qua hệ thống tích hợp chính thức.20 | **Astro \+ React**: Có thể tận dụng ngay các linh kiện React UI có sẵn như ZenUI hay bảng dữ liệu phức tạp.27 |

### **2.2. Thiết Kế Mạng Lưới Layout Bằng CSS Grid Cho 12 Cung**

Thách thức lớn nhất trong việc thiết kế giao diện Tử Vi là tái tạo lại Mệnh Bàn truyền thống. Bản đồ Tử Vi không phải là một danh sách phẳng mà là một lưới ma trận trong đó 12 cung được sắp xếp theo một vòng khép kín dọc theo chu vi, bao quanh một khoảng không gian ở giữa gọi là "Thiên Bàn".13 Để thực hiện điều này trên web, CSS Grid Layout \- một hệ thống bố cục lưới hai chiều \- là giải pháp duy nhất mang lại sự chính xác về mặt hình học và tính linh hoạt cho thiết kế đáp ứng (Responsive Design).31

Mệnh bàn sẽ được xây dựng trên một Grid Container (phần tử cha chứa display: grid). Khung lưới được định nghĩa là một ma trận ![][image3] với các thuộc tính grid-template-columns: repeat(4, 1fr) và grid-template-rows: repeat(4, 1fr).32

1. **Mười Hai Cung Địa Bàn:** Các cung được bố trí dọc theo các cạnh của lưới ma trận. Ví dụ: Cung Tỵ (Góc trên cùng bên trái) sẽ được định vị bằng grid-column: 1; grid-row: 1\. Cung Ngọ tiếp theo là grid-column: 2; grid-row: 1\. Các cung tiếp tục được đặt tuần tự vòng quanh lưới.15 Mỗi cung (Grid Item) là một thẻ chứa danh sách các chính tinh, phụ tinh, và trạng thái Miếu/Hãm.30  
2. **Khu Vực Trung Tâm (Thiên Bàn):** Phần lõi rộng lớn ở giữa (kích thước ![][image4]) được tạo ra bằng cách sử dụng các thuộc tính gộp cột và hàng: grid-column: 2 / span 2; grid-row: 2 / span 2;.32 Khu vực này được sử dụng để hiển thị các thông tin gốc của mệnh tạo: Năm sinh, Giờ sinh, Cục Ngũ Hành, Mệnh chủ, Thân chủ, và giao diện điều khiển đại vận.13  
3. **Khả năng Đáp ứng (Responsive Behavior):** CSS Grid cho phép dễ dàng tái cấu trúc lưới thông qua Media Queries. Trên màn hình điện thoại di động (chiều rộng nhỏ hơn 868px), bố cục ![][image3] có thể biến đổi thành một dạng danh sách cuộn dọc hoặc một dạng carousel thẻ linh hoạt, trong đó cung Mệnh luôn được hiển thị đầu tiên, tiếp theo là khu vực Thiên Bàn.32

## **3\. Thiết Kế Mô Hình Bring Your Own Key (BYOK) Và Giải Quyết Bài Toán CORS**

Hệ thống tính toán sao chỉ cung cấp cấu trúc xương sống của Mệnh Bàn. Để cung cấp các luận giải chuyên sâu về mối quan hệ giữa các vì sao, Tứ Hóa phi tinh, và dự báo lưu niên, ứng dụng phải dựa vào một Động cơ Suy luận (Reasoning Engine) mạnh mẽ, cụ thể là các mô hình AI sinh tạo như Gemini 3.1 Pro Preview hoặc Gemini 3 Flash.35 Do tính chất của một trang web tĩnh không có máy chủ phụ trợ (Backend proxy) để che giấu các khóa API bí mật, một kiến trúc tương tác trực tiếp từ trình duyệt (Client-to-API) phải được thiết lập một cách cẩn trọng để bảo vệ bảo mật.22

### **3.1. Rủi Ro Bảo Mật Môi Trường Máy Khách**

Việc nhúng (hardcode) mã API bí mật của nhà phát triển vào mã nguồn frontend là một lỗi bảo mật nghiêm trọng.41 Ngay cả khi mã nguồn được thu gọn (minified) và biên dịch, khóa API vẫn có thể dễ dàng bị trích xuất bằng cách kiểm tra tệp JavaScript trong tab "Network" của công cụ dành cho nhà phát triển trên trình duyệt.41 Những lỗ hổng như vậy đã từng dẫn đến việc rò rỉ hơn 2.800 khóa API Google công khai, cho phép các tác nhân độc hại khai thác hạn mức, tốn kém hàng ngàn đô la mỗi ngày do việc tiêu thụ token trái phép.41

Trong môi trường doanh nghiệp hoặc các dự án có máy chủ, yêu cầu các cuộc gọi phải được định tuyến qua một máy chủ proxy an toàn hoặc tích hợp với các dịch vụ như Firebase AI Logic và Firebase App Check để đảm bảo khóa API không bao giờ nằm trong cơ sở mã của ứng dụng.35 Phương thức này cho phép tiêm khóa từ biến môi trường máy chủ một cách bảo mật và hoạt động như một "proxy trong suốt" (Transparent Proxy).41 Tuy nhiên, ứng dụng Tử Vi này hoàn toàn loại bỏ máy chủ để có thể lưu trữ miễn phí trên GitHub Pages, khiến việc tạo backend proxy là không thể.22

### **3.2. Cấu Trúc Bảo Mật BYOK (Bring Your Own Key)**

Giải pháp kiến trúc duy nhất để duy trì hệ thống web tĩnh hoàn toàn (serverless) đồng thời sử dụng trí tuệ nhân tạo là áp dụng mô hình "Mang Khóa Của Bạn" (Bring Your Own Key \- BYOK).48 Trong mô hình này, người dùng sẽ tự truy cập Google AI Studio, thiết lập dự án Google Cloud, tạo khóa API miễn phí của riêng họ và dán vào phần cài đặt của ứng dụng Tử Vi.45 Khóa này sau đó được lưu trữ và sử dụng trực tiếp tại máy khách (Client-side).52 Trách nhiệm quản lý và hạn mức sử dụng (Quotas) lúc này hoàn toàn thuộc về cá nhân người dùng, loại bỏ rủi ro tài chính cho nhà phát triển hệ thống.52

Mặc dù khóa API thuộc về người dùng, việc lưu trữ nó một cách an toàn trên trình duyệt vẫn là ưu tiên hàng đầu. Lưu trữ khóa API trực tiếp dưới dạng văn bản gốc (plain-text) trong localStorage hoặc IndexedDB là một thực hành tồi. Nếu trang web gặp sự cố Cross-Site Scripting (XSS) hoặc người dùng cài đặt một tiện ích mở rộng trình duyệt (Browser Extension) độc hại, các tập lệnh này có thể đọc nội dung của bộ nhớ cục bộ và gửi khóa cho tin tặc.42

Kiến trúc phòng thủ trong giao diện yêu cầu hai lớp bảo vệ chính:

1. **Mã Hóa Cục Bộ Với Web Crypto API:** Khóa API của người dùng không bao giờ được lưu trữ ở dạng văn bản gốc.48 Thay vào đó, ngay khi người dùng nhập khóa, ứng dụng sẽ yêu cầu người dùng cung cấp một mã PIN ngắn hoặc một mật khẩu phiên bản (Session Password). Sử dụng API Web Crypto bản địa của trình duyệt, hệ thống sẽ sử dụng thuật toán PBKDF2 (với hàng ngàn vòng lặp và một chuỗi muối \- salt ngẫu nhiên) để dẫn xuất một khóa mật mã từ mã PIN.60 Khóa này sau đó được sử dụng để mã hóa API Key thông qua thuật toán mã hóa đối xứng AES-GCM hoặc AES-CBC.60 Chuỗi văn bản mật mã (Ciphertext) cuối cùng mới là thứ được lưu vào localStorage. Mỗi khi cần gọi API, người dùng nhập lại mã PIN để giải mã trên bộ nhớ tạm (RAM). Khóa gốc sẽ bị xóa khỏi bộ nhớ ngay khi quá trình gọi hoàn tất.48  
2. **Chính Sách Bảo Mật Nội Dung (Content Security Policy \- CSP):** Mã HTML của ứng dụng Astro trên GitHub Pages phải được thiết lập với các thẻ \<meta\> CSP nghiêm ngặt, chỉ cho phép thực thi các tập lệnh từ chính tên miền đó (self-origin) và chỉ cho phép giao tiếp mạng (Connect-src) đến miền generativelanguage.googleapis.com của Google, chặn mọi nỗ lực rò rỉ dữ liệu ra bên ngoài.42

### **3.3. Vượt Qua Rào Cản CORS Khi Gọi Trực Tiếp Từ Trình Duyệt**

Một thách thức kỹ thuật rất lớn đối với kiến trúc BYOK là chính sách Same-Origin Policy của trình duyệt, dẫn đến lỗi CORS (Cross-Origin Resource Sharing).61 Các trình duyệt web hiện đại thực thi CORS để ngăn chặn một tập lệnh trên một trang web tương tác với tài nguyên trên một tên miền khác mà không có sự cho phép.61 Khi một ứng dụng React chạy trên localhost hoặc github.io cố gắng tạo một yêu cầu HTTP đến Google API, trình duyệt sẽ gửi một yêu cầu sơ bộ (Preflight Request).61 Nếu máy chủ Google không phản hồi với tiêu đề Access-Control-Allow-Origin phù hợp, trình duyệt sẽ chặn hoàn toàn yêu cầu này.62

Các báo cáo phát triển gần đây chỉ ra rằng việc sử dụng lớp tương thích OpenAI của Google (thư viện openai JavaScript với điểm cuối https://generativelanguage.googleapis.com/v1beta/openai) thường xuyên gặp lỗi CORS do thiếu header cho phép nguồn gốc chéo, khiến việc phát triển trực tiếp trên trình duyệt bị vô hiệu hóa.64 Cách giải quyết thông thường là tạo một máy chủ Express.js để làm trung gian (Proxy), vì các máy chủ backend không chịu sự điều chỉnh của CORS từ trình duyệt.62

Tuy nhiên, với ứng dụng Web Tĩnh của chúng ta, proxy là bất khả thi. Để xử lý CORS thành công, ứng dụng phải từ bỏ lớp tương thích OpenAI và tích hợp trực tiếp SDK chính thức của Google: @google/genai.37 Mặc dù Google cảnh báo việc khởi tạo SDK phía máy khách với khóa API là nguy hiểm đối với ứng dụng sản xuất thông thường, cấu hình SDK vẫn cung cấp các cờ tùy chọn hoặc kỹ thuật khởi tạo cho các môi trường kiểm thử/nội bộ.54 Trong trường hợp SDK TypeScript tiêu chuẩn vẫn bị hạn chế, ứng dụng có thể sử dụng trực tiếp các cuộc gọi REST API tiêu chuẩn bằng lệnh fetch hoặc Axios, gửi payload JSON chứa cấu trúc phân tích đến endpoint của Gemini 3.1 Pro.36 Bằng cách này, ứng dụng có thể trao đổi với mô hình mà không cần backend proxy, đảm bảo triết lý serverless 100%.

## **4\. Kiến Trúc Lời Nhắc (Prompt Engineering) Chuyên Sâu Giải Mã Tử Vi**

Mô hình Ngôn ngữ Lớn (LLM) như Gemini 3.1 Pro sở hữu lượng kiến thức sâu rộng và khả năng suy luận logic xuất sắc.36 Tuy nhiên, ngôn ngữ của Tử Vi Đẩu Số chứa đầy tính ẩn dụ, các nguyên tắc Đạo giáo cổ xưa và logic ràng buộc chặt chẽ. Nếu thiếu một hệ thống Kỹ thuật Kời nhắc (Prompt Engineering) bài bản, mô hình AI dễ dàng rơi vào trạng thái "ảo giác" (Hallucination), đưa ra các luận giải chung chung mang tính chất "bói toán đường phố", hoặc tồi tệ hơn là tính toán sai vị trí các vì sao do bản chất ngẫu nhiên (stochastic nature) của hệ thống.67

### **4.1. Hạn Chế Của LLM Và Tách Biệt Mối Quan Tâm (Separation of Concerns)**

Như đã đề cập trong lý thuyết điều khiển tự động hóa, LLM giống như một đám mây điểm mờ (fuzzy point cloud) trong không gian vector.69 Bắt một mô hình sinh tạo phải tính toán chính xác toán học module 12 cho 108 vì sao dựa trên lịch âm là một thảm họa hệ thống. Để giải quyết vấn đề này, kiến trúc phải tuân thủ nguyên tắc Tách Biệt Mối Quan Tâm (Separation of Concerns).

Toàn bộ thuật toán an sao phải được thực thi hoàn toàn trong mã nguồn JavaScript/TypeScript trên máy khách (như đã thiết kế ở phần 1).2 Mệnh bàn sau khi được tính toán xong sẽ được ứng dụng đóng gói thành một đối tượng JSON cấu trúc hóa, chứa toàn bộ trạng thái của 12 cung, các chính tinh, phụ tinh, độ miếu vượng và Tứ Hóa.70 Khối dữ liệu tĩnh này sau đó mới được bơm vào ngữ cảnh của lời nhắc (Context window) để Gemini chỉ thực hiện công việc mà nó giỏi nhất: Phân tích, suy luận và diễn giải ngôn ngữ tự nhiên.70

### **4.2. Khung Lời Nhắc Đa Chiều (Mega-Prompt Framework)**

Để kiểm soát kết quả đầu ra, phương pháp Prompt Engineering yêu cầu việc thiết kế lời nhắc theo mô hình bốn trụ cột cốt lõi: Vai Trò (Persona), Nhiệm Vụ (Task), Ngữ Cảnh (Context), và Định Dạng (Format).73 Kiến trúc Mega-prompt này phải bao gồm các nguyên tắc của Chain-of-Thought (chuỗi tư duy từng bước) và ReAct (Lý luận và Hành động) nhằm buộc mô hình phải giải thích lý do trước khi đưa ra kết luận.73

| Thành Phần Prompt | Chức Năng Và Cấu Trúc Ứng Dụng Trong Tử Vi Đẩu Số |
| :---- | :---- |
| **Vai Trò (Persona)** | Xác định mô hình là một học giả Tử Vi kỳ cựu: *"Bạn là một Đại sư Tử Vi Đẩu Số thông tuệ cả hai phái Nam Tông (Tam Hợp) và Bắc Tông (Tứ Hóa Phi Tinh). Phong cách của bạn là hàn lâm, khách quan, loại bỏ mê tín dị đoan, tập trung vào tâm lý học và phân tích dữ liệu thiên văn"*.6 |
| **Ngữ Cảnh (Context)** | Tiêm dữ liệu JSON của Mệnh Bàn (đã được tính toán bằng TypeScript). *"Đây là bản đồ sao của đương số:. Đương số là Dương Nam, Thủy Nhị Cục."*.73 |
| **Nhiệm Vụ (Task)** | Ra lệnh phân tích cụ thể với các giới hạn (Constraints). *"Hãy phân tích chuyên sâu Cung Tài Bạch và Cung Quan Lộc. Xác định tác động của Vũ Khúc gặp Thất Sát. Phân tích sự hội chiếu của Lục Cát Tinh và Lục Sát Tinh từ tam phương tứ chính. Áp dụng kỹ thuật Tứ Hóa để xem xét đại vận hiện tại"*.6 |
| **Tư Duy (Chain of Thought)** | Buộc mô hình vạch ra các bước logic: *"Trước khi đưa ra kết luận, hãy suy nghĩ từng bước: 1\. Đánh giá cường độ chính tinh. 2\. Đánh giá sự tương tác của phụ tinh. 3\. Phân tích Tứ Hóa kích hoạt"*.73 |
| **Định Dạng (Format)** | Buộc đầu ra phải tương thích với giao diện UI.71 Không cho phép xuất văn bản tự do. |

### **4.3. Xuất Liệu Cấu Trúc (Structured Output) Thông Qua JSON Schema**

Khi người dùng nhấp vào Cung Phu Thê trên giao diện CSS Grid của Astro/React, ứng dụng cần một luồng dữ liệu rõ ràng để cập nhật các thẻ hiển thị đồ họa (UI Cards) thay vì chỉ nhổ ra một cục văn bản Markdown dài dòng.70 Việc yêu cầu xuất liệu dạng JSON trong lời nhắc (Ví dụ: "Act as an expert... Output in JSON format") là hiệu quả, nhưng các mô hình sinh tạo vẫn có thể phá vỡ cấu trúc.71

Để đảm bảo tính toàn vẹn tuyệt đối 100%, tích hợp Gemini API cần sử dụng tính năng Xuất Liệu Có Kiểm Soát (Controlled Generation / Structured Output).72 API của Google cho phép truyền một đối tượng responseSchema được xác định theo chuẩn OpenAPI 3.0, hoặc sử dụng Pydantic/Zod để định nghĩa giản đồ.72

Ví dụ về cấu trúc Schema ép buộc Gemini trả về dữ liệu phân tích Tử Vi:

JSON

{  
  "type": "object",  
  "properties": {  
    "palace\_analysis": {  
      "type": "string",  
      "description": "Phân tích tổng quan về ý nghĩa của các chính tinh tại cung này."  
    },  
    "karmic\_interactions": {  
      "type": "array",  
      "items": { "type": "string" },  
      "description": "Danh sách các tác động từ Tam Phương Tứ Chính (các cung hội chiếu)."  
    },  
    "sihua\_triggers": {  
      "type": "string",  
      "description": "Sự kích hoạt của Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ lên cung."  
    },  
    "modern\_advice": {  
      "type": "string",  
      "description": "Lời khuyên ứng dụng vào cuộc sống hiện đại (đầu tư, sự nghiệp, tình cảm)."  
    }  
  },  
  "required": \["palace\_analysis", "karmic\_interactions", "sihua\_triggers", "modern\_advice"\]  
}

Thông qua việc kết hợp Mega-Prompt với Structured Output, ứng dụng sẽ đạt được các bài luận giải sắc bén, có lớp lang và được trình bày một cách hoàn mỹ trên giao diện người dùng.70

## **5\. Kỷ Nguyên "Vibe Coding" Cùng Google Antigravity: Thiết Lập Nhận Thức Không Gian Làm Việc**

Toàn bộ kiến trúc vĩ mô từ thuật toán lịch âm, giao diện Astro/React, bảo mật WebCrypto BYOK, đến thiết kế Mega-prompt JSON cho Gemini đều vô cùng phức tạp để lập trình thủ công. Sự ra đời của Google Antigravity đánh dấu một kỷ nguyên mới của lập trình phần mềm: Agent-First IDE (Môi trường phát triển đặt Tác tử AI lên hàng đầu).82

Không giống như các trợ lý AI truyền thống chỉ cung cấp gợi ý mã tự động (autocomplete) theo từng dòng, Antigravity đóng vai trò như một Trung tâm Chỉ huy (Mission Control).82 Nó cho phép "Vibe Coding" \- quy trình mà trong đó nhà phát triển sử dụng ngôn ngữ tự nhiên để chỉ đạo cấp cao (high-level objective), trong khi đa tác tử AI (Multi-Agent) tự động phân tích yêu cầu, lập kế hoạch cấu trúc, tự động viết mã qua nhiều tệp, chạy terminal để cài đặt thư viện (npm install), và thậm chí mở một trình duyệt ảo nội bộ để tự kiểm thử lỗi ứng dụng (Verify with artifacts and browser agents).82

Tuy nhiên, nếu để Antigravity tự do lập trình mà không có ranh giới, mô hình có thể tự động tạo ra một hệ thống backend Node.js vi phạm quy tắc "Web Tĩnh" của dự án.69 Để khai thác tối đa sức mạnh của công cụ này, nhà phát triển phải thiết lập một "Kiến Trúc Nhận Thức" (Cognitive Architecture) chặt chẽ trong không gian làm việc (Workspace).90

### **5.1. Tổ Chức Thư Mục Nhận Thức (.agents)**

Sự kiểm soát hành vi của Antigravity được quản lý thông qua định dạng chuẩn xuyên công cụ AGENTS.md ở thư mục gốc, và hệ thống "Quy Định" (Rules), "Quy Trình" (Workflows), và "Kỹ Năng" (Skills) được lưu trữ trong thư mục .agents/.85

| Yếu Tố Nhận Thức (Cognitive Element) | Đường Dẫn Lưu Trữ | Vai Trò Trong Dự Án Tử Vi Đẩu Số |
| :---- | :---- | :---- |
| **Dữ Liệu Nhận Thức Khởi Đầu** | Gốc dự án (AGENTS.md) | Tệp cốt lõi thiết lập ngữ cảnh cho toàn bộ tác tử: "Dự án này là Web Tĩnh SSG sử dụng Astro và React. TUYỆT ĐỐI KHÔNG SỬ DỤNG MÁY CHỦ. Tương tác với Gemini API phải đi qua kiến trúc BYOK".87 |
| **Quy Định (Rules)** | .agents/rules/ | Các ràng buộc thụ động luôn được kích hoạt. Ví dụ: rule-typescript-astrology.md yêu cầu mọi đối tượng Tử Vi (Cung, Sao) phải tuân thủ nghiêm ngặt các Interfaces TypeScript. rule-no-backend.md chặn việc tạo các tệp logic máy chủ.83 |
| **Quy Trình (Workflows)** | .agents/workflows/ | Các chuỗi lệnh chủ động do người dùng gọi. Ví dụ: Lệnh /generate-ziwei-ui sẽ ra lệnh cho tác tử xây dựng giao diện CSS Grid ![][image3] theo quy chuẩn thiết kế Responsive, và tự động gọi trình duyệt ảo để kiểm tra sự hiển thị của các ô cung.85 |
| **Kỹ Năng (Agent Skills)** | .agents/skills/ | Đóng gói tri thức chuyên ngành để LLM tham chiếu khi viết code.92 Đây là nơi lưu trữ thuật toán chiêm tinh phức tạp để tránh AI sinh tạo sai lệch. |

### **5.2. Chế Tạo Kỹ Năng "Agent Skills" Cho Thuật Toán Chiêm Tinh**

Tính năng "Skills" của Antigravity tuân theo mô hình phân phối lũy tiến (progressive disclosure), nghĩa là tác tử chỉ đọc nội dung kỹ năng khi cần thiết, giúp tiết kiệm dung lượng token của cửa sổ ngữ cảnh.92 Đối với dự án này, nhà phát triển cần tạo một kỹ năng đặc biệt trong .agents/skills/ziwei-algorithm/SKILL.md.92

Tệp kỹ năng này chứa YAML Frontmatter để định danh (ví dụ: name: ziwei-algorithm, description: Thuật toán định vị 14 chính tinh...) và phần thân Markdown chứa toán học cụ thể.92 Nội dung kỹ năng sẽ hướng dẫn chi tiết cách chia lấy dư ngày sinh cho Ngũ Hành Cục để tìm sao Tử Vi, và chỉ ra vị trí tương quan của Thiên Cơ, Thái Dương, Vũ Khúc, v.v., so với Tử Vi.2 Khi tác tử được yêu cầu viết ZiweiEngine.ts, nó sẽ tìm thấy kỹ năng này, nạp kiến thức vào trí nhớ ngắn hạn và xuất ra mã nguồn chuẩn xác 100% mà không tự ý ảo giác các công thức chiêm tinh học.83

## **6\. Kế Hoạch Triển Khai Vibe Coding Thực Tế (Bản Thiết Kế Master)**

Khi kiến trúc nhận thức (AGENTS.md, Rules, Skills) đã được thiết lập, quy trình Vibe Coding sẽ bước vào giai đoạn thực thi. Nhà phát triển lúc này trở thành một Kiến trúc sư Hệ thống, thao tác trong thanh điều khiển "Agent Manager" để điều phối dự án.84 Antigravity xử lý giao tiếp thông qua các Tạo tác (Artifacts) \- các cấu trúc như task\_list.md (danh sách công việc), implementation\_plan.md (kế hoạch kiến trúc), và walkthrough.md (hướng dẫn vận hành sau khi hoàn thành) để đảm bảo tính minh bạch và có thể kiểm chứng.82

Dưới đây là kế hoạch 5 giai đoạn, được mô tả như các chỉ thị nhập vào Mission Control của Antigravity để điều phối các AI Agent xây dựng dự án.

| Giai Đoạn Dự Án | Mục Tiêu Tác Vụ (Agent Mission) | Các Artifact Và Quy Trình Vibe Coding Đi Kèm |
| :---- | :---- | :---- |
| **Giai Đoạn 1: Khởi tạo Bộ khung Web Tĩnh** | Khởi tạo dự án Astro tĩnh (npm create astro@latest), tích hợp React UI, Tailwind CSS, và xác lập cấu hình bảo mật nội dung (CSP). | Agent tạo implementation\_plan.md phác thảo cấu trúc thư mục. Sau khi Review Policy được xác nhận 88, Agent dùng terminal chạy lệnh cài đặt, tạo các rules cơ bản trong .agents/rules/ và đảm bảo máy chủ cục bộ hoạt động hoàn hảo mà không có bất kỳ tệp backend nào. |
| **Giai Đoạn 2: Engine Toán Học Và Lịch Âm** | Tích hợp thư viện vn-lunar.7 Đọc kỹ năng ziwei-algorithm trong .agents/skills/ 92 để viết bộ tính toán Can Chi, Cục Ngũ Hành, 14 chính tinh, Tứ Hóa. Đóng gói đầu ra dưới dạng JSON AST. | Tác tử Agent 1 viết thuật toán.7 Đồng thời, Antigravity phân nhánh (Subagents) cho Agent 2 tự động sinh các tệp kiểm thử Unit Test (Jest) để đảm bảo sao Tử Vi và Thiên Phủ được an định chính xác theo chu kỳ lịch.87 |
| **Giai Đoạn 3: Thiết Kế Layout Mệnh Bàn CSS Grid** | Tạo linh kiện ZiWeiBoard.tsx sử dụng React và Tailwind. Xây dựng CSS Grid ![][image3] hiển thị 12 cung vòng quanh và vùng Thiên Bàn trung tâm ![][image4].13 | Lặp lại Vibe Coding: Agent chạy lệnh render UI. Cung cấp phản hồi ngữ nghĩa (Feedback) nếu lưới bị vỡ hoặc lệch vị trí cung Tý, Sửu.82 Agent điều chỉnh thuộc tính grid-column và grid-row ngay lập tức, tự động chụp ảnh màn hình giao diện báo cáo (Screenshots artifact).82 |
| **Giai Đoạn 4: Tích Hợp BYOK Và Gemini Reasoning** | Viết module Web Crypto API cho BYOK. Nhận khóa API Studio từ người dùng, yêu cầu mã PIN PBKDF2, mã hóa AES-GCM vào localStorage.48 Kết nối @google/genai hoặc fetch REST qua trình duyệt.62 | Agent xây dựng giao diện cấu hình API an toàn. Thiết kế Mega-prompt cho Tử Vi với cấu trúc ReAct.74 Agent tích hợp JSON Schema cho *Structured Output* để phân tích mệnh bàn, kích hoạt hiệu ứng hiển thị chi tiết (ví dụ: giải mã Tứ Hóa trên giao diện Astro).70 |
| **Giai Đoạn 5: Đóng gói Triển Khai GitHub Pages** | Viết chuỗi CI/CD trong .github/workflows/deploy.yml. Cấu hình tác vụ GitHub Actions để tự động chạy npm run build và đưa tệp tĩnh lên nhánh gh-pages.20 | Hoàn tất dự án. Agent tự động chạy ag refresh để dọn dẹp dự án, viết tệp tài liệu walkthrough.md tổng kết toàn bộ kiến trúc và thay đổi.82 Ứng dụng xuất xưởng với chi phí vận hành backend bằng 0\. |

Thông qua sự hội tụ của ba trụ cột công nghệ: Kiến trúc Web tĩnh siêu tốc độ với Astro và React 20, Tư duy phân tích sâu sắc của Gemini LLM với Mega-prompts 36, và Khả năng điều phối tự động hóa thông minh của Google Antigravity Agent 82, kế hoạch này cung cấp một bản thiết kế hoàn chỉnh để hiện thực hóa hệ thống phân tích Tử Vi Đẩu Số hiện đại. Dự án không chỉ tôn trọng tính nguyên bản phức tạp của các thuật toán cổ đại 2 mà còn giải quyết triệt để các rào cản bảo mật API trực tiếp thông qua mô hình mã hóa BYOK máy khách 48, mang đến một ứng dụng hoàn toàn không tốn chi phí máy chủ bảo trì. Bằng cách thiết lập Kiến trúc Nhận thức không gian làm việc vững chắc cho công cụ Vibe Coding 90, quá trình lập trình phần mềm được nâng tầm từ viết mã cơ học trở thành việc hoạch định chiến lược và chỉ huy đa tác tử AI.

#### **Nguồn trích dẫn**

1. Introduction to Zi Wei Dou Shu (紫微斗数) \- Imperial Harvest, truy cập vào tháng 3 28, 2026, [https://imperialharvest.com/blog/introduction-to-zi-wei-dou-shu/](https://imperialharvest.com/blog/introduction-to-zi-wei-dou-shu/)  
2. An 'Empirical' Method of Divination, Zi Wei Dou Shu \- Steemit, truy cập vào tháng 3 28, 2026, [https://steemit.com/life/@anye283/an-empirical-method-of-divination-zi-wei-dou-shu](https://steemit.com/life/@anye283/an-empirical-method-of-divination-zi-wei-dou-shu)  
3. Chinese\_Calendar\_and\_Astrology, truy cập vào tháng 3 28, 2026, [http://www.fengshuimestari.fi/Chinese\_Calendar\_and\_Astrology.html](http://www.fengshuimestari.fi/Chinese_Calendar_and_Astrology.html)  
4. Zi Wei Dou Shu Case Study: The Zi Wei Star (紫微) \- Master Sean Chan, truy cập vào tháng 3 28, 2026, [https://www.masterseanchan.com/case-studies/ziweidoushu/introducing-the-zi-wei-star/](https://www.masterseanchan.com/case-studies/ziweidoushu/introducing-the-zi-wei-star/)  
5. An Introduction to Zi Wei Dou Shu for the Web3 Generation | by lifelogcanvas \- Medium, truy cập vào tháng 3 28, 2026, [https://medium.com/@support\_6776/an-introduction-to-zi-wei-dou-shu-for-the-web3-generation-a98786b6e8d4](https://medium.com/@support_6776/an-introduction-to-zi-wei-dou-shu-for-the-web3-generation-a98786b6e8d4)  
6. Understanding the 12 Zi Wei Dou Shu Chart Palaces \- Gagan Sarkaria, truy cập vào tháng 3 28, 2026, [https://gagansarkaria.com/zi-wei-dou-shu-palaces/](https://gagansarkaria.com/zi-wei-dou-shu-palaces/)  
7. dqcai/vn-lunar \- NPM, truy cập vào tháng 3 28, 2026, [https://www.npmjs.com/package/@dqcai/vn-lunar](https://www.npmjs.com/package/@dqcai/vn-lunar)  
8. tiendat77/vietnamese-lunar-calendar \- GitHub, truy cập vào tháng 3 28, 2026, [https://github.com/tiendat77/vietnamese-lunar-calendar](https://github.com/tiendat77/vietnamese-lunar-calendar)  
9. lunar-calendar-ts-vi CDN by jsDelivr \- A CDN for npm and GitHub, truy cập vào tháng 3 28, 2026, [https://www.jsdelivr.com/package/npm/lunar-calendar-ts-vi](https://www.jsdelivr.com/package/npm/lunar-calendar-ts-vi)  
10. tuanquynh0508/lunar-calendar-ts-vi: Lunar Calendar ... \- GitHub, truy cập vào tháng 3 28, 2026, [https://github.com/tuanquynh0508/lunar-calendar-ts-vi](https://github.com/tuanquynh0508/lunar-calendar-ts-vi)  
11. forvn/vn-lunar-calendar \- NPM, truy cập vào tháng 3 28, 2026, [https://www.npmjs.com/package/@forvn/vn-lunar-calendar](https://www.npmjs.com/package/@forvn/vn-lunar-calendar)  
12. Zi Wei Dou Shu Consultation (紫微斗數) | Chinese Astrology, truy cập vào tháng 3 28, 2026, [https://www.masterseanchan.com/zi-wei-dou-shu-consultation/](https://www.masterseanchan.com/zi-wei-dou-shu-consultation/)  
13. US20090162815A1 \- Zi wei dou shu analyzing system and method thereof \- Google Patents, truy cập vào tháng 3 28, 2026, [https://patents.google.com/patent/US20090162815A1/en](https://patents.google.com/patent/US20090162815A1/en)  
14. Quy tắc An Sao | PDF \- Scribd, truy cập vào tháng 3 28, 2026, [https://www.scribd.com/document/949068178/Quy-t%E1%BA%AFc-An-Sao](https://www.scribd.com/document/949068178/Quy-t%E1%BA%AFc-An-Sao)  
15. The Mysterious Zi Wei Dou Shu, the Purple Star Calculations \- Kayo Chang Black, truy cập vào tháng 3 28, 2026, [https://kayochangblack.com/2018/06/08/the-mysterious-zi-wei-dou-shu-the-purple-star-calculations/](https://kayochangblack.com/2018/06/08/the-mysterious-zi-wei-dou-shu-the-purple-star-calculations/)  
16. Zi Wei Dou Shu Natal Chart Analysis | PDF \- Scribd, truy cập vào tháng 3 28, 2026, [https://www.scribd.com/document/833856423/Zi-Wei-Dou-Shu-Chinese-Astrology-Analysis-Ngoc-Nga-Z-Library](https://www.scribd.com/document/833856423/Zi-Wei-Dou-Shu-Chinese-Astrology-Analysis-Ngoc-Nga-Z-Library)  
17. Understanding the Power and Placement of the Zi Wei Star in Zi Wei Dou Shu \- Lemon8, truy cập vào tháng 3 28, 2026, [https://www.lemon8-app.com/celestialsage/7419537167682322945?region=sg](https://www.lemon8-app.com/celestialsage/7419537167682322945?region=sg)  
18. Zi Wei Dou Shu: A Comprehensive Guide | PDF | Astrology \- Scribd, truy cập vào tháng 3 28, 2026, [https://www.scribd.com/document/333865116/ziweidoushu](https://www.scribd.com/document/333865116/ziweidoushu)  
19. AS201b –Zi Wei Dou Shu2, Beginning Class, Part 2 \- American Feng Shui Institute, truy cập vào tháng 3 28, 2026, [https://www.amfengshui.com/wp-content/uploads/2014/09/as201b.pdf](https://www.amfengshui.com/wp-content/uploads/2014/09/as201b.pdf)  
20. Migrating from SvelteKit \- Astro Docs, truy cập vào tháng 3 28, 2026, [https://docs.astro.build/en/guides/migrate-to-astro/from-sveltekit/](https://docs.astro.build/en/guides/migrate-to-astro/from-sveltekit/)  
21. The top five static site generators for 2025 (and when to use them\!) \- CloudCannon, truy cập vào tháng 3 28, 2026, [https://cloudcannon.com/blog/the-top-five-static-site-generators-for-2025-and-when-to-use-them/](https://cloudcannon.com/blog/the-top-five-static-site-generators-for-2025-and-when-to-use-them/)  
22. How can I securely host a website and ensure that the API key or access tokens aren't exposed? : r/webdev \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/webdev/comments/1hoppph/how\_can\_i\_securely\_host\_a\_website\_and\_ensure\_that/](https://www.reddit.com/r/webdev/comments/1hoppph/how_can_i_securely_host_a_website_and_ensure_that/)  
23. Sveltekit vs Astro : r/sveltejs \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/sveltejs/comments/1bzrdsp/sveltekit\_vs\_astro/](https://www.reddit.com/r/sveltejs/comments/1bzrdsp/sveltekit_vs_astro/)  
24. SvelteKit 5 static site makes 3x network requests compared to equivalent Astro 4 static site · sveltejs kit · Discussion \#13120 \- GitHub, truy cập vào tháng 3 28, 2026, [https://github.com/sveltejs/kit/discussions/13120](https://github.com/sveltejs/kit/discussions/13120)  
25. Svelte VS Astro for static sites : r/sveltejs \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/sveltejs/comments/1jr84b1/svelte\_vs\_astro\_for\_static\_sites/](https://www.reddit.com/r/sveltejs/comments/1jr84b1/svelte_vs_astro_for_static_sites/)  
26. Astro with react or svelte? : r/webdev \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/webdev/comments/1rhxng0/astro\_with\_react\_or\_svelte/](https://www.reddit.com/r/webdev/comments/1rhxng0/astro_with_react_or_svelte/)  
27. zenui-library-react \- GitHub, truy cập vào tháng 3 28, 2026, [https://github.com/zenui-labs/zenui-library-react](https://github.com/zenui-labs/zenui-library-react)  
28. react-ui-components · GitHub Topics, truy cập vào tháng 3 28, 2026, [https://github.com/topics/react-ui-components?l=javascript](https://github.com/topics/react-ui-components?l=javascript)  
29. TW200929053A \- Zi wei dou shu analyzing system and method thereof \- Google Patents, truy cập vào tháng 3 28, 2026, [https://patents.google.com/patent/TW200929053A/en](https://patents.google.com/patent/TW200929053A/en)  
30. 12宫This Session is Being Continued | PDF | Web Server \- Scribd, truy cập vào tháng 3 28, 2026, [https://www.scribd.com/document/958102787/12%E5%AE%ABThis-Session-is-Being-Continued](https://www.scribd.com/document/958102787/12%E5%AE%ABThis-Session-is-Being-Continued)  
31. CSS Masonry & CSS Grid | CSS-Tricks, truy cập vào tháng 3 28, 2026, [https://css-tricks.com/css-masonry-css-grid/](https://css-tricks.com/css-masonry-css-grid/)  
32. Creating a 12 Column CSS Grid: A Complete Tutorial | TestMu AI (Formerly LambdaTest), truy cập vào tháng 3 28, 2026, [https://www.testmuai.com/blog/12-column-css-grid/](https://www.testmuai.com/blog/12-column-css-grid/)  
33. A Complete Guide to CSS Grid Layout, truy cập vào tháng 3 28, 2026, [https://css-tricks.com/complete-guide-css-grid-layout/](https://css-tricks.com/complete-guide-css-grid-layout/)  
34. Build Layouts with CSS Grid \#8 \- 12 Column Grid \- YouTube, truy cập vào tháng 3 28, 2026, [https://www.youtube.com/watch?v=-IAypuhKgJs](https://www.youtube.com/watch?v=-IAypuhKgJs)  
35. Get started with the Gemini API using the Firebase AI Logic SDKs \- Google, truy cập vào tháng 3 28, 2026, [https://firebase.google.com/docs/ai-logic/get-started](https://firebase.google.com/docs/ai-logic/get-started)  
36. Gemini 3 Developer Guide | Gemini API \- Google AI for Developers, truy cập vào tháng 3 28, 2026, [https://ai.google.dev/gemini-api/docs/gemini-3](https://ai.google.dev/gemini-api/docs/gemini-3)  
37. Gemini API Integration Examples: Current Python & Node Guide, truy cập vào tháng 3 28, 2026, [https://www.aifreeapi.com/en/posts/gemini-api-integration-examples-tutorial](https://www.aifreeapi.com/en/posts/gemini-api-integration-examples-tutorial)  
38. Gemini API using Firebase AI Logic \- Google, truy cập vào tháng 3 28, 2026, [https://firebase.google.com/docs/ai-logic](https://firebase.google.com/docs/ai-logic)  
39. Use Gemini AI API without Backend Code \- Gemini for Web in HTML, Javascript and React JS \- YouTube, truy cập vào tháng 3 28, 2026, [https://www.youtube.com/watch?v=a-zakrDShRc](https://www.youtube.com/watch?v=a-zakrDShRc)  
40. How to securely store an API key in static website \- Stack Overflow, truy cập vào tháng 3 28, 2026, [https://stackoverflow.com/questions/60568389/how-to-securely-store-an-api-key-in-static-website](https://stackoverflow.com/questions/60568389/how-to-securely-store-an-api-key-in-static-website)  
41. Decoded: How Google AI Studio Securely Proxies Gemini API Requests, truy cập vào tháng 3 28, 2026, [https://glaforge.dev/posts/2026/02/09/decoded-how-google-ai-studio-securely-proxies-gemini-api-requests/](https://glaforge.dev/posts/2026/02/09/decoded-how-google-ai-studio-securely-proxies-gemini-api-requests/)  
42. Securing my website with API keys in Local Storage \- Stack Overflow, truy cập vào tháng 3 28, 2026, [https://stackoverflow.com/questions/51580800/securing-my-website-with-api-keys-in-local-storage](https://stackoverflow.com/questions/51580800/securing-my-website-with-api-keys-in-local-storage)  
43. Securing your Gemini API key is crucial \- Google AI Developers Forum, truy cập vào tháng 3 28, 2026, [https://discuss.ai.google.dev/t/securing-your-gemini-api-key-is-crucial/106912](https://discuss.ai.google.dev/t/securing-your-gemini-api-key-is-crucial/106912)  
44. Build apps in Google AI Studio | Gemini API, truy cập vào tháng 3 28, 2026, [https://ai.google.dev/gemini-api/docs/aistudio-build-mode](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)  
45. Using Gemini API keys | Google AI for Developers, truy cập vào tháng 3 28, 2026, [https://ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key)  
46. Previously harmless Google API keys now expose Gemini AI data \- Bleeping Computer, truy cập vào tháng 3 28, 2026, [https://www.bleepingcomputer.com/news/security/previously-harmless-google-api-keys-now-expose-gemini-ai-data/](https://www.bleepingcomputer.com/news/security/previously-harmless-google-api-keys-now-expose-gemini-ai-data/)  
47. "Protect Your API Keys: A Guide to Saving Them in a .env File" | Medium, truy cập vào tháng 3 28, 2026, [https://medium.com/@oadaramola/a-pitfall-i-almost-fell-into-d1d3461b2fb8](https://medium.com/@oadaramola/a-pitfall-i-almost-fell-into-d1d3461b2fb8)  
48. Best Practices for Using User-Provided Gemini API Keys When Backend LLM Calls Are Required \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/SaaS/comments/1p66y2v/best\_practices\_for\_using\_userprovided\_gemini\_api/](https://www.reddit.com/r/SaaS/comments/1p66y2v/best_practices_for_using_userprovided_gemini_api/)  
49. Google AI Studio 2.0 (Antigravity & Firebase Agent) \- YouTube, truy cập vào tháng 3 28, 2026, [https://www.youtube.com/watch?v=hBOvGGHcvoY](https://www.youtube.com/watch?v=hBOvGGHcvoY)  
50. Getting started with the Gemini API and Web apps | Solutions for Developers, truy cập vào tháng 3 28, 2026, [https://developers.google.com/learn/pathways/solution-ai-gemini-getting-started-web](https://developers.google.com/learn/pathways/solution-ai-gemini-getting-started-web)  
51. How do I keep my API keys secret on a static site without a backend? \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/statichosting/comments/1p647b7/how\_do\_i\_keep\_my\_api\_keys\_secret\_on\_a\_static\_site/](https://www.reddit.com/r/statichosting/comments/1p647b7/how_do_i_keep_my_api_keys_secret_on_a_static_site/)  
52. I must strongly advise against making direct API calls from a browser, as it e... | Hacker News, truy cập vào tháng 3 28, 2026, [https://news.ycombinator.com/item?id=41326533](https://news.ycombinator.com/item?id=41326533)  
53. Feature Request: Enable a "Bring Your Own Key" (BYOK) for Apps Built with Google AI Studio, truy cập vào tháng 3 28, 2026, [https://discuss.ai.google.dev/t/feature-request-enable-a-bring-your-own-key-byok-for-apps-built-with-google-ai-studio/109216](https://discuss.ai.google.dev/t/feature-request-enable-a-bring-your-own-key-byok-for-apps-built-with-google-ai-studio/109216)  
54. Claude's API now supports CORS requests, enabling client-side applications, truy cập vào tháng 3 28, 2026, [https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/](https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/)  
55. Support dangerouslyAllowBrowser for Anthropic · Issue \#3041 · vercel/ai \- GitHub, truy cập vào tháng 3 28, 2026, [https://github.com/vercel/ai/issues/3041](https://github.com/vercel/ai/issues/3041)  
56. Gemini API quickstart | Google AI for Developers, truy cập vào tháng 3 28, 2026, [https://ai.google.dev/gemini-api/docs/quickstart](https://ai.google.dev/gemini-api/docs/quickstart)  
57. How to Access and Use Google Gemini API Key (with Examples) \- GeeksforGeeks, truy cập vào tháng 3 28, 2026, [https://www.geeksforgeeks.org/artificial-intelligence/how-to-use-google-gemini-api-key/](https://www.geeksforgeeks.org/artificial-intelligence/how-to-use-google-gemini-api-key/)  
58. Best Practices for Storing Access Tokens in the Browser | by Curity \- Medium, truy cập vào tháng 3 28, 2026, [https://curity.medium.com/best-practices-for-storing-access-tokens-in-the-browser-6b3d515d9814](https://curity.medium.com/best-practices-for-storing-access-tokens-in-the-browser-6b3d515d9814)  
59. Client-side storage \- Learn web development | MDN, truy cập vào tháng 3 28, 2026, [https://developer.mozilla.org/en-US/docs/Learn\_web\_development/Extensions/Client-side\_APIs/Client-side\_storage](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage)  
60. Secure way to store sensitive API details of users (localStorage or database?), truy cập vào tháng 3 28, 2026, [https://security.stackexchange.com/questions/173584/secure-way-to-store-sensitive-api-details-of-users-localstorage-or-database](https://security.stackexchange.com/questions/173584/secure-way-to-store-sensitive-api-details-of-users-localstorage-or-database)  
61. Cross-origin resource sharing (CORS) | Cloud Storage \- Google Cloud Documentation, truy cập vào tháng 3 28, 2026, [https://docs.cloud.google.com/storage/docs/cross-origin](https://docs.cloud.google.com/storage/docs/cross-origin)  
62. Is your Gemini API not working when calling from React? Try this. | by Harsha Vardhan, truy cập vào tháng 3 28, 2026, [https://medium.com/@harshavardhan.workspace/is-your-gemini-api-not-working-when-calling-from-react-try-this-c3dde2324f60](https://medium.com/@harshavardhan.workspace/is-your-gemini-api-not-working-when-calling-from-react-try-this-c3dde2324f60)  
63. How to Fix CORS Issues \-- I Think \- DEV Community, truy cập vào tháng 3 28, 2026, [https://dev.to/bridget\_amana/how-to-fix-cors-issues-i-think-20j](https://dev.to/bridget_amana/how-to-fix-cors-issues-i-think-20j)  
64. Gemini API CORS Error with OpenAI Compatability \- Google AI Developers Forum, truy cập vào tháng 3 28, 2026, [https://discuss.ai.google.dev/t/gemini-api-cors-error-with-openai-compatability/58619](https://discuss.ai.google.dev/t/gemini-api-cors-error-with-openai-compatability/58619)  
65. How to solve CORS error while fetching an external API? \- Stack Overflow, truy cập vào tháng 3 28, 2026, [https://stackoverflow.com/questions/72084470/how-to-solve-cors-error-while-fetching-an-external-api](https://stackoverflow.com/questions/72084470/how-to-solve-cors-error-while-fetching-an-external-api)  
66. @google/genai, truy cập vào tháng 3 28, 2026, [https://googleapis.github.io/js-genai/](https://googleapis.github.io/js-genai/)  
67. Zi Wei Dou Shu Analysis \- AI Prompt \- DocsBot AI, truy cập vào tháng 3 28, 2026, [https://docsbot.ai/prompts/analysis/zi-wei-dou-shu-analysis](https://docsbot.ai/prompts/analysis/zi-wei-dou-shu-analysis)  
68. Gemini A.i successfully calculated a chart accurately : r/AstrologyCharts \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/AstrologyCharts/comments/1p8uk6h/gemini\_ai\_successfully\_calculated\_a\_chart/](https://www.reddit.com/r/AstrologyCharts/comments/1p8uk6h/gemini_ai_successfully_calculated_a_chart/)  
69. Google Antigravity IDE Skills & Workflows: Building an Enterprise-grade AI Squad with Finite State…, truy cập vào tháng 3 28, 2026, [https://medium.com/@eren.karatas/google-antigravity-ide-skills-workflows-building-an-enterprise-grade-ai-squad-with-finite-state-184ade6f7fa7](https://medium.com/@eren.karatas/google-antigravity-ide-skills-workflows-building-an-enterprise-grade-ai-squad-with-finite-state-184ade6f7fa7)  
70. Tips for engineering prompts to make Gemini output more thorough, detailed step-by-step instructions? \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/PromptEngineering/comments/1q86l3w/tips\_for\_engineering\_prompts\_to\_make\_gemini/](https://www.reddit.com/r/PromptEngineering/comments/1q86l3w/tips_for_engineering_prompts_to_make_gemini/)  
71. My favorite prompt engineering technique for getting structured output from Gemini \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/generativeAI/comments/1mkv44l/my\_favorite\_prompt\_engineering\_technique\_for/](https://www.reddit.com/r/generativeAI/comments/1mkv44l/my_favorite_prompt_engineering_technique_for/)  
72. How to consistently output JSON with the Gemini API using controlled generation \- Medium, truy cập vào tháng 3 28, 2026, [https://medium.com/google-cloud/how-to-consistently-output-json-with-the-gemini-api-using-controlled-generation-887220525ae0](https://medium.com/google-cloud/how-to-consistently-output-json-with-the-gemini-api-using-controlled-generation-887220525ae0)  
73. Part 1: Prompts Structure, Prompt Types & Best Practices | ChatGPT| Gemini \- YouTube, truy cập vào tháng 3 28, 2026, [https://www.youtube.com/watch?v=WHNgbuV-v0Q](https://www.youtube.com/watch?v=WHNgbuV-v0Q)  
74. Prompt design strategies | Gemini API | Google AI for Developers, truy cập vào tháng 3 28, 2026, [https://ai.google.dev/gemini-api/docs/prompting-strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)  
75. Mastering Deep Research with Gemini: A Practical Guide, truy cập vào tháng 3 28, 2026, [https://duizendstra.com/ai/guides/gemini-prompt-engineering-guide/](https://duizendstra.com/ai/guides/gemini-prompt-engineering-guide/)  
76. Overview of prompting strategies | Generative AI on Vertex AI, truy cập vào tháng 3 28, 2026, [https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/prompt-design-strategies](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/prompt-design-strategies)  
77. I analyzed Google's entire 70-page Gemini prompting guide so you don't have to. Here are the pro tips and secrets you need to get the best results from Google's Gemini AI : r/promptingmagic \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/promptingmagic/comments/1qo0boz/i\_analyzed\_googles\_entire\_70page\_gemini\_prompting/](https://www.reddit.com/r/promptingmagic/comments/1qo0boz/i_analyzed_googles_entire_70page_gemini_prompting/)  
78. Gemini 2.5 Pro Best Practice for Prompt Engineering | Google Cloud \- Community \- Medium, truy cập vào tháng 3 28, 2026, [https://medium.com/google-cloud/best-practices-for-prompt-engineering-with-gemini-2-5-pro-755cb473de70](https://medium.com/google-cloud/best-practices-for-prompt-engineering-with-gemini-2-5-pro-755cb473de70)  
79. ZiWei GPT \- Apps on Google Play, truy cập vào tháng 3 28, 2026, [https://play.google.com/store/apps/details?id=apps.zilyus.com.gpt\&hl=en\_US](https://play.google.com/store/apps/details?id=apps.zilyus.com.gpt&hl=en_US)  
80. Tử vi 2026 \- Tử vi trọn đời \- Ứng dụng trên Google Play, truy cập vào tháng 3 28, 2026, [https://play.google.com/store/apps/details?id=com.microbit.tuvi\&hl=vi](https://play.google.com/store/apps/details?id=com.microbit.tuvi&hl=vi)  
81. Structured outputs | Gemini API \- Google AI for Developers, truy cập vào tháng 3 28, 2026, [https://ai.google.dev/gemini-api/docs/structured-output](https://ai.google.dev/gemini-api/docs/structured-output)  
82. Vibe Coding Explained: Tools and Guides \- Google Cloud, truy cập vào tháng 3 28, 2026, [https://cloud.google.com/discover/what-is-vibe-coding](https://cloud.google.com/discover/what-is-vibe-coding)  
83. Tutorial : Getting Started with Google Antigravity Skills, truy cập vào tháng 3 28, 2026, [https://medium.com/google-cloud/tutorial-getting-started-with-antigravity-skills-864041811e0d](https://medium.com/google-cloud/tutorial-getting-started-with-antigravity-skills-864041811e0d)  
84. Google Antigravity: Beginner Guide to the New Agentic IDE (Step-by-Step \+ Real Use Case), truy cập vào tháng 3 28, 2026, [https://medium.com/google-developer-experts/google-antigravity-beginner-guide-to-the-new-agentic-ide-step-by-step-real-use-case-9585578e7308](https://medium.com/google-developer-experts/google-antigravity-beginner-guide-to-the-new-agentic-ide-step-by-step-real-use-case-9585578e7308)  
85. Getting Started with Google Antigravity, truy cập vào tháng 3 28, 2026, [https://codelabs.developers.google.com/getting-started-google-antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity)  
86. Introducing Google Antigravity, a New Era in AI-Assisted Software Development, truy cập vào tháng 3 28, 2026, [https://antigravity.google/blog/introducing-google-antigravity](https://antigravity.google/blog/introducing-google-antigravity)  
87. Complete Guide to Google Antigravity (2026) | Tutorial & Documentation, truy cập vào tháng 3 28, 2026, [https://antigravity.codes/tutorial](https://antigravity.codes/tutorial)  
88. Tutorial : Getting Started with Google Antigravity | by Romin Irani \- Medium, truy cập vào tháng 3 28, 2026, [https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2](https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2)  
89. Computer Use | Gemini API \- Google AI for Developers, truy cập vào tháng 3 28, 2026, [https://ai.google.dev/gemini-api/docs/computer-use](https://ai.google.dev/gemini-api/docs/computer-use)  
90. study8677/antigravity-workspace-template: The ultimate starter kit for AI IDEs, Claude code \- GitHub, truy cập vào tháng 3 28, 2026, [https://github.com/study8677/antigravity-workspace-template](https://github.com/study8677/antigravity-workspace-template)  
91. Documentation quality needs improvement \- Google AI Developers Forum, truy cập vào tháng 3 28, 2026, [https://discuss.ai.google.dev/t/documentation-quality-needs-improvement/128816](https://discuss.ai.google.dev/t/documentation-quality-needs-improvement/128816)  
92. Agent Skills \- Google Antigravity Documentation, truy cập vào tháng 3 28, 2026, [https://antigravity.google/docs/skills](https://antigravity.google/docs/skills)  
93. Authoring Google Antigravity Skills, truy cập vào tháng 3 28, 2026, [https://codelabs.developers.google.com/getting-started-with-antigravity-skills](https://codelabs.developers.google.com/getting-started-with-antigravity-skills)  
94. Rules / Workflows \- Google Antigravity Documentation, truy cập vào tháng 3 28, 2026, [https://antigravity.google/docs/rules-workflows](https://antigravity.google/docs/rules-workflows)  
95. Markdown files, rules and workflows??? : r/google\_antigravity \- Reddit, truy cập vào tháng 3 28, 2026, [https://www.reddit.com/r/google\_antigravity/comments/1rz5r8h/markdown\_files\_rules\_and\_workflows/](https://www.reddit.com/r/google_antigravity/comments/1rz5r8h/markdown_files_rules_and_workflows/)  
96. Customize Google Antigravity with rules and workflows \- Mete Atamel, truy cập vào tháng 3 28, 2026, [https://atamel.dev/posts/2025/11-25\_customize\_antigravity\_rules\_workflows/](https://atamel.dev/posts/2025/11-25_customize_antigravity_rules_workflows/)  
97. Antigraviy Rules and Workflows \- YouTube, truy cập vào tháng 3 28, 2026, [https://www.youtube.com/watch?v=7tzgiTAxjjI](https://www.youtube.com/watch?v=7tzgiTAxjjI)  
98. Skills Made Easy with Google Antigravity and Gemini CLI | by Karl Weinmeister | Google Cloud \- Community | Feb, 2026, truy cập vào tháng 3 28, 2026, [https://medium.com/google-cloud/skills-made-easy-with-google-antigravity-and-gemini-cli-5435139b0af8](https://medium.com/google-cloud/skills-made-easy-with-google-antigravity-and-gemini-cli-5435139b0af8)  
99. Antigravity: Build Your First AI Agent Skill in 7 Minutes \- YouTube, truy cập vào tháng 3 28, 2026, [https://www.youtube.com/watch?v=gRAndTHbHWo](https://www.youtube.com/watch?v=gRAndTHbHWo)  
100. Antigravity Skills Give You an Unfair Advantage, truy cập vào tháng 3 28, 2026, [https://www.youtube.com/watch?v=EIFrH0JDXnA](https://www.youtube.com/watch?v=EIFrH0JDXnA)  
101. Implementation Plan \- Google Antigravity Documentation, truy cập vào tháng 3 28, 2026, [https://antigravity.google/docs/implementation-plan](https://antigravity.google/docs/implementation-plan)  
102. Antigravity NEW Update is HUGE\! Agent Skills, Subagents, AI Automation, and More\!, truy cập vào tháng 3 28, 2026, [https://www.youtube.com/watch?v=oRAeNVx2kqM](https://www.youtube.com/watch?v=oRAeNVx2kqM)  
103. Parallel agents in Antigravity, truy cập vào tháng 3 28, 2026, [https://medium.com/google-cloud/parallel-agents-in-antigravity-64237120161d](https://medium.com/google-cloud/parallel-agents-in-antigravity-64237120161d)  
104. Vibe Coding Animated Websites with AI | Apple-Style Scroll Effects Using Google Antigravity, truy cập vào tháng 3 28, 2026, [https://www.youtube.com/watch?v=j4eebHz3yPM](https://www.youtube.com/watch?v=j4eebHz3yPM)  
105. Weightless Code: My 7-Day Experiment with Google Antigravity | by Naresh B A | Medium, truy cập vào tháng 3 28, 2026, [https://medium.com/@phoenixarjun007/weightless-code-my-7-day-experiment-with-google-antigravity-373a82af6639](https://medium.com/@phoenixarjun007/weightless-code-my-7-day-experiment-with-google-antigravity-373a82af6639)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAXCAYAAADtNKTnAAAA+ElEQVR4Xu3SP0tCYRTH8SMUJCUugkFNDULgIpIuOgjO0bvo/ThKi1tDi2Dg0BD1GsJVRRAEdTJIKfs+99xreri3254/+MDl/u4fnvM8IvvEpYYx1ltmmPjXS3SQC174LXdYoWLun6ONOUqm20kKr3hDxnQuWfTQRdJ0m1xiigccmC5IS/QZ92xorkXXf2uLrbiPvOPKFkEaEj6PIMd4wgJF03k5wbNEz8PlDH3RXbzYrTR/mUcdX3jEkem8xC2lILq9TRyazkvc1p7iRXQeadNtkhf9i12K++ON6BzuJeIDVQzk55h/YoSh6HH/ED3qZST8d/b5X/kGTpo1fO7baeEAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAYCAYAAAAlBadpAAABEElEQVR4Xu3TvUoDQRSG4RMkEDEQQkAUIlliGvUOhIBICktBe9u0sdIgksbSwspGRO1yASKkCgpaeAdaBULsRSwUou9xZ9dxsu6WAfGDB4ZzdhjmZ0X+ZLJYwSYWMGHqUyia8UgWcYcXtLGNC3SwhCvUwq9N0tjDG3Yw+bMtVTyjL87KOvEY79iwG1YyuDR0HKaOD+wiZTecnKNpFyoY4BFzdiMiJ+LstyX+qgd28ZfkxN/iV/Q6uhhKxAkmZRY9PKHs9BITTFY6jose6rJdyONekicXcIppt3Eo/p7X3IaJXp2+ssj7L+EB15hxevrK9tGQmPv3cItXnGELR7jBqsRMDKIfeFg35uX7T/rPWPMJCSkp/c7RsHEAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAUCAYAAADhj08IAAABG0lEQVR4Xu2Tu2oCURRFt4i2goWFTURMIUFQJLEW/APxH1IJChKSwsJOxMbSFPmEVBY2NoJ/YWNpYaV2QffhOjpeHziPMIKzYBXjmRkWc66Aj483ROgPzegDLwnQT7qieW3mKQW6wJ2FyQq/aR+3h0V3XiJI41CbsIU8WKdl+oHbw57pL33SByREm7QBB2FvtAv1MithQpYOcRznSpSsUNaX2F1bDRPMca5EyYM1WjH9ZidMkLgR1Dl1FCXkcFihgd0weUePTmlSm1nmnc40l3RD53RMY/u7LyNRHagv9UIHOP+HcITVL2aOMtaXxj/EfdE1fdUHZ5CoNtQ51c+Ua3ElqPXJGsU/OsH1VRZpFadRBinaomF94PMQbAFWmzRHbTdvzgAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAUCAYAAADhj08IAAABWElEQVR4Xu2VTytEURiHX/lTslCs2CiZhSwoxYZi4wP4BJqNnUISRbGTUqzE0laxsRD5AL7DLEjZWSh24nl77xln7pyZMXfGtXCfepq55z3n3t85c88ZkYyM9OjDLTzBHRwqLf8NE3iD0ziKV/iJq9ji9UuVTrzEPLZGbb14j284HrWljv6ED/gqtlqOTbFVW/HaQvREVkIn2y8JVr4dD/FaLKRjXSyYflYjhxc4EC+I3Xsb1yRBsBBteI4fOFNaCjImNjE/XNNDKZNi75fuUH3AT/DD/UqobrzFM+yK1Wqh4e7wVJocSmd6jAdiu7VedPwRFnAwVkuMC7Uh38fGMM4Ve1RHx++LrdSI2FkY2hB1oUuuh+ly9N2xiPPedSX8UG68TqqhcHqjBXzHJ3z0fMGpYs8wGmpPyielNBTOHbB6ZsV9ltrvyiwuSXkoh/7n7mJHvJDxL/gCino3kyBfNM4AAAAASUVORK5CYII=>