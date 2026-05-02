import { sql } from "drizzle-orm";
import {
  db,
  adminUsersTable,
  productsTable,
  productTranslationsTable,
  noticesTable,
  noticeTranslationsTable,
} from "@workspace/db";
import { hashPassword } from "./lib/auth";
import { logger } from "./lib/logger";

type Lang = "ko" | "en" | "ja" | "zh" | "vi";

interface ProductSeed {
  slug: string;
  category: string;
  sortOrder: number;
  imageUrl: string;
  translations: Record<Lang, { name: string; headline: string; body: string }>;
}

interface NoticeSeed {
  slug: string;
  category: string;
  region: string;
  thumbnailUrl: string;
  publishedAt: string;
  translations: Record<Lang, { title: string; excerpt: string; body: string }>;
}

const PRODUCTS: ProductSeed[] = [
  {
    slug: "carrot-toner-pad-base",
    category: "skincare",
    sortOrder: 1,
    imageUrl: "/images/dostac/product-01.png",
    translations: {
      ko: {
        name: "당근 비타 진정 토너 패드",
        headline: "민감 피부 진정 + 비타민 활력",
        body: "<p>당근 추출물과 나이아신아마이드가 피부를 진정시키고 윤기를 더합니다. 두꺼운 양면 엠보 패드로 닦아내고 결을 정돈하는 두 가지 단계를 한 번에 완성합니다.</p>",
      },
      en: {
        name: "Carrot Vita Calming Toner Pad",
        headline: "Calming for sensitive skin + vitamin glow",
        body: "<p>Carrot extract and niacinamide soothe and brighten. The thick double-sided embossed pad lets you cleanse and refine in one step.</p>",
      },
      ja: {
        name: "キャロット ビタ カーミング トナーパッド",
        headline: "敏感肌をやさしく整え、ビタミンの輝きをプラス",
        body: "<p>ニンジンエキスとナイアシンアミドが肌を落ち着かせ、明るさを与えます。厚手の両面エンボスパッドで拭き取りと整肌を一度に。</p>",
      },
      zh: {
        name: "胡萝卜维他舒缓爽肤棉片",
        headline: "敏感肌舒缓 + 维他焕亮",
        body: "<p>胡萝卜提取物与烟酰胺舒缓肌肤、焕发光泽。厚实双面压纹棉片，一步完成清洁与肌理调理。</p>",
      },
      vi: {
        name: "Bông Tẩy Trang Cà Rốt Vita Dịu Da",
        headline: "Làm dịu da nhạy cảm + bổ sung vitamin",
        body: "<p>Chiết xuất cà rốt và niacinamide làm dịu và làm sáng da. Bông dày hai mặt giúp lau sạch và làm mịn da trong một bước.</p>",
      },
    },
  },
  {
    slug: "centella-cica-cream",
    category: "skincare",
    sortOrder: 2,
    imageUrl: "/images/dostac/product-02.png",
    translations: {
      ko: {
        name: "센텔라 시카 리페어 크림",
        headline: "트러블 진정 + 장벽 강화 데일리 크림",
        body: "<p>센텔라 4종 복합체와 판테놀이 자극받은 피부를 진정시키고 보호 장벽을 강화합니다. 끈적임 없이 부드럽게 흡수되는 수분 크림.</p>",
      },
      en: {
        name: "Centella Cica Repair Cream",
        headline: "Trouble-care + barrier-strengthening daily cream",
        body: "<p>A complex of four centella actives plus panthenol calms reactive skin and reinforces the moisture barrier — non-sticky, fast-absorbing.</p>",
      },
      ja: {
        name: "ツボクサ シカ リペア クリーム",
        headline: "トラブルケア＋バリア強化のデイリークリーム",
        body: "<p>ツボクサ4種コンプレックスとパンテノールが敏感な肌を落ち着かせ、うるおいの壁を整えます。べたつかずさらりと馴染む保湿クリーム。</p>",
      },
      zh: {
        name: "积雪草 Cica 修护面霜",
        headline: "舒缓痘肌 + 强韧屏障的日常面霜",
        body: "<p>四种积雪草活性成分与泛醇舒缓敏感肌肤、强化保湿屏障，质地清爽不黏腻。</p>",
      },
      vi: {
        name: "Kem Phục Hồi Centella Cica",
        headline: "Làm dịu mụn + củng cố hàng rào da hằng ngày",
        body: "<p>Bộ phức hợp 4 hoạt chất rau má cùng panthenol làm dịu da nhạy cảm và củng cố hàng rào ẩm — thẩm thấu nhanh, không nhờn dính.</p>",
      },
    },
  },
  {
    slug: "vita-c-brightening-serum",
    category: "skincare",
    sortOrder: 3,
    imageUrl: "/images/dostac/product-03.png",
    translations: {
      ko: {
        name: "비타 C 브라이트닝 세럼",
        headline: "맑고 환한 톤업 비타민 세럼",
        body: "<p>안정화 비타민 C와 글루타치온이 칙칙함과 색소 침착을 케어합니다. 겔 타입 텍스처로 가볍게 발리며 메이크업 전 사용도 쾌적합니다.</p>",
      },
      en: {
        name: "Vita C Brightening Serum",
        headline: "Brightening vitamin serum for a clear glow",
        body: "<p>Stabilized vitamin C and glutathione target dullness and uneven tone. The lightweight gel layers easily and works under makeup.</p>",
      },
      ja: {
        name: "ビタC ブライトニング セラム",
        headline: "透明感とトーンアップのためのビタミン美容液",
        body: "<p>安定型ビタミンCとグルタチオンがくすみと色ムラをケア。ジェルテクスチャーで軽く伸び、メイク前の使用にも最適です。</p>",
      },
      zh: {
        name: "维他 C 亮采精华",
        headline: "提亮肤色、焕发清透光感",
        body: "<p>稳定型维生素 C 与谷胱甘肽改善暗沉与不均肤色，凝胶质地轻盈，妆前使用也清爽舒适。</p>",
      },
      vi: {
        name: "Tinh Chất Vita C Sáng Da",
        headline: "Tinh chất vitamin làm sáng và đều màu da",
        body: "<p>Vitamin C ổn định và glutathione cải thiện da xỉn màu và sắc tố không đều. Kết cấu gel nhẹ, dễ thẩm thấu, dùng tốt trước trang điểm.</p>",
      },
    },
  },
  {
    slug: "ph-balance-cleansing-foam",
    category: "cleanser",
    sortOrder: 4,
    imageUrl: "/images/dostac/product-04.png",
    translations: {
      ko: {
        name: "pH 밸런스 클렌징 폼",
        headline: "약산성 저자극 매일 세안",
        body: "<p>피부 본연의 약산성 pH에 맞춘 부드러운 세안제. 풍성한 거품이 노폐물을 깨끗이 헹궈내고 당김 없이 촉촉합니다.</p>",
      },
      en: {
        name: "pH Balance Cleansing Foam",
        headline: "Mildly acidic, low-irritation daily cleanser",
        body: "<p>A gentle cleanser tuned to skin's native mildly acidic pH. Rich foam removes impurities while leaving skin comfortably hydrated.</p>",
      },
      ja: {
        name: "pHバランス クレンジングフォーム",
        headline: "弱酸性・低刺激の毎日の洗顔",
        body: "<p>素肌の弱酸性に合わせたやさしい洗顔料。きめ細かな泡が汚れをすっきり落とし、洗い上がりはつっぱらずしっとり。</p>",
      },
      zh: {
        name: "pH 平衡洁面泡沫",
        headline: "弱酸性低刺激的日常洁面",
        body: "<p>贴合肌肤天然弱酸性 pH 的温和洁面，丰盈泡沫带走污垢，洗后不紧绷、滋润舒适。</p>",
      },
      vi: {
        name: "Sữa Rửa Mặt Cân Bằng pH",
        headline: "Làm sạch hằng ngày, dịu nhẹ, pH cân bằng",
        body: "<p>Sản phẩm rửa mặt dịu nhẹ tương thích với pH tự nhiên của da. Bọt mịn loại bỏ bụi bẩn, để lại làn da mềm mại không khô căng.</p>",
      },
    },
  },
  {
    slug: "collagen-boost-mask",
    category: "mask",
    sortOrder: 5,
    imageUrl: "/images/dostac/product-05.png",
    translations: {
      ko: {
        name: "콜라겐 부스트 마스크",
        headline: "탄력 케어 집중 시트 마스크",
        body: "<p>저분자 콜라겐과 펩타이드가 탄력과 결을 케어합니다. 밀착력 높은 인견 시트가 에센스를 피부 깊숙이 전달합니다.</p>",
      },
      en: {
        name: "Collagen Boost Mask",
        headline: "Intensive sheet mask for firmness",
        body: "<p>Low-molecular collagen and peptides target firmness and texture. The clingy rayon sheet delivers essence deep into the skin.</p>",
      },
      ja: {
        name: "コラーゲン ブースト マスク",
        headline: "ハリケアの集中シートマスク",
        body: "<p>低分子コラーゲンとペプチドが弾力とキメを整えます。密着力の高いレーヨンシートが美容液を肌の奥まで届けます。</p>",
      },
      zh: {
        name: "胶原弹力面膜",
        headline: "紧致集中护理面膜",
        body: "<p>小分子胶原与肽改善紧致与肌理。贴肤莱赛尔棉膜布将精华渗透至肌底。</p>",
      },
      vi: {
        name: "Mặt Nạ Collagen Boost",
        headline: "Mặt nạ chuyên sâu giúp săn chắc da",
        body: "<p>Collagen phân tử thấp và peptide cải thiện độ săn chắc và kết cấu da. Mặt nạ rayon ôm sát giúp tinh chất thẩm thấu sâu.</p>",
      },
    },
  },
  {
    slug: "rose-perfume-mist",
    category: "body",
    sortOrder: 6,
    imageUrl: "/images/dostac/product-06.png",
    translations: {
      ko: {
        name: "로즈 퍼퓸 바디 미스트",
        headline: "은은한 장미 향의 데일리 바디 미스트",
        body: "<p>잔향이 길게 머무는 다마스크 로즈 향과 함께 보습 성분이 피부 결을 부드럽게 정돈합니다.</p>",
      },
      en: {
        name: "Rose Perfume Body Mist",
        headline: "Daily body mist with a soft rose scent",
        body: "<p>Long-lasting Damask rose fragrance with hydrating actives that soften skin texture.</p>",
      },
      ja: {
        name: "ローズ パフューム ボディミスト",
        headline: "やさしいローズの香りのデイリーボディミスト",
        body: "<p>長く香るダマスクローズと、保湿成分が肌をやさしく整えるボディミスト。</p>",
      },
      zh: {
        name: "玫瑰香氛身体喷雾",
        headline: "日常使用的柔和玫瑰香氛喷雾",
        body: "<p>持久的大马士革玫瑰香氛搭配保湿成分，柔润肌肤纹理。</p>",
      },
      vi: {
        name: "Xịt Thơm Toàn Thân Hương Hồng",
        headline: "Xịt thơm toàn thân hương hồng dịu nhẹ hằng ngày",
        body: "<p>Hương hoa hồng Damask lưu lâu cùng dưỡng chất giúp làn da thêm mềm mịn.</p>",
      },
    },
  },
  {
    slug: "pore-clear-strips",
    category: "specialty",
    sortOrder: 7,
    imageUrl: "/images/dostac/product-pore-strips.png",
    translations: {
      ko: {
        name: "포어 클리어 코팩 스트립",
        headline: "쏙 빼주는 모공 케어 스트립",
        body: "<p>코끝의 블랙헤드와 노폐물을 부드럽게 제거하고 진정 성분이 피부를 케어합니다.</p>",
      },
      en: {
        name: "Pore Clear Nose Strips",
        headline: "Pore-clearing nose strips that lift impurities",
        body: "<p>Gently lifts blackheads and impurities while soothing actives keep skin calm.</p>",
      },
      ja: {
        name: "ポアクリア 鼻パック ストリップ",
        headline: "毛穴の汚れをすっきり引き上げる鼻パック",
        body: "<p>角栓や黒ずみをやさしく取り除き、整肌成分で肌を落ち着かせます。</p>",
      },
      zh: {
        name: "鼻部清透贴",
        headline: "深层清理鼻部毛孔污垢",
        body: "<p>温和拔除黑头与角栓，舒缓成分同时呵护肌肤。</p>",
      },
      vi: {
        name: "Miếng Lột Mụn Đầu Đen",
        headline: "Miếng lột vùng mũi loại bỏ mụn đầu đen",
        body: "<p>Nhẹ nhàng lấy đi mụn đầu đen và bã nhờn, đồng thời các hoạt chất làm dịu giữ da thoải mái.</p>",
      },
    },
  },
  {
    slug: "spot-care-patches",
    category: "specialty",
    sortOrder: 8,
    imageUrl: "/images/dostac/product-spot-patches.png",
    translations: {
      ko: {
        name: "스팟 케어 하이드로 패치",
        headline: "트러블 부위 집중 케어 패치",
        body: "<p>하이드로콜로이드 패치가 피부를 보호하고 진정 성분이 트러블 부위를 빠르게 케어합니다.</p>",
      },
      en: {
        name: "Spot Care Hydro Patches",
        headline: "Targeted patches for blemish care",
        body: "<p>Hydrocolloid patches shield the skin while soothing actives accelerate blemish care.</p>",
      },
      ja: {
        name: "スポットケア ハイドロパッチ",
        headline: "気になる部分を集中ケアするパッチ",
        body: "<p>ハイドロコロイドパッチが肌を保護し、整肌成分が素早くケアします。</p>",
      },
      zh: {
        name: "痘痘护理水胶贴",
        headline: "针对痘痘部位的集中护理贴",
        body: "<p>水胶体贴片保护肌肤，舒缓成分快速呵护痘痘部位。</p>",
      },
      vi: {
        name: "Miếng Dán Mụn Hydro",
        headline: "Miếng dán chuyên dùng cho vùng mụn",
        body: "<p>Miếng dán hydrocolloid bảo vệ da, các hoạt chất làm dịu giúp xử lý mụn nhanh hơn.</p>",
      },
    },
  },
  {
    slug: "baby-clean-wipes",
    category: "wipes",
    sortOrder: 9,
    imageUrl: "/images/dostac/product-baby-wipes.png",
    translations: {
      ko: {
        name: "베이비 클린 물티슈",
        headline: "민감한 아기 피부를 위한 청결 케어",
        body: "<p>저자극 처방으로 민감한 아기 피부를 부드럽게 닦아냅니다. 두꺼운 엠보 시트로 부드러운 사용감을 제공합니다.</p>",
      },
      en: {
        name: "Baby Clean Wipes",
        headline: "Gentle cleansing for delicate baby skin",
        body: "<p>Low-irritation formula gently wipes sensitive baby skin. The thick embossed sheet offers a soft, reliable feel.</p>",
      },
      ja: {
        name: "ベビー クリーン ウェットティッシュ",
        headline: "敏感な赤ちゃんの肌をやさしく清潔に",
        body: "<p>低刺激処方で敏感な赤ちゃんの肌をやさしくふき取り。厚手のエンボスシートが心地よい使用感を提供します。</p>",
      },
      zh: {
        name: "婴儿清洁湿巾",
        headline: "为娇嫩宝宝肌肤而设计的清洁",
        body: "<p>低刺激配方温柔擦拭敏感宝宝肌肤，厚实压纹片材带来柔软可靠的触感。</p>",
      },
      vi: {
        name: "Khăn Ướt Sạch Cho Bé",
        headline: "Làm sạch dịu nhẹ cho làn da bé nhạy cảm",
        body: "<p>Công thức ít kích ứng nhẹ nhàng làm sạch da bé nhạy cảm. Lớp khăn dày dập nổi mang lại cảm giác mềm mại, tin cậy.</p>",
      },
    },
  },
];

const NOTICES: NoticeSeed[] = [
  {
    slug: "indonesia-bpom-batch-2",
    category: "regulatory",
    region: "Indonesia",
    publishedAt: "2026-04-12T00:00:00Z",
    thumbnailUrl: "/images/dostac/product-01.png",
    translations: {
      ko: {
        title: "인도네시아 BPOM 2차 등록 7건 완료",
        excerpt: "토너 패드 및 스킨케어 7개 SKU의 BPOM 등록을 완료했습니다.",
        body: "<p>인도네시아 BPOM 2차 등록이 완료되어 자카르타 거점 유통 파트너에게 즉시 출고가 가능합니다. 본 등록에는 토너 패드 3종과 스킨케어 4종이 포함됩니다.</p>",
      },
      en: {
        title: "Indonesia BPOM 2nd-Round Registration Complete (7 SKUs)",
        excerpt: "We completed BPOM registration for 7 toner-pad and skincare SKUs.",
        body: "<p>The 2nd round of Indonesia BPOM registration is complete; immediate shipment to Jakarta-based partners is now possible. This batch includes 3 toner pads and 4 skincare SKUs.</p>",
      },
      ja: {
        title: "インドネシアBPOM 第2回登録 7件完了",
        excerpt: "トナーパッドとスキンケア7SKUのBPOM登録が完了しました。",
        body: "<p>インドネシアBPOMの第2回登録が完了し、ジャカルタ拠点のパートナー様への即時出荷が可能になりました。今回の登録にはトナーパッド3種、スキンケア4種が含まれます。</p>",
      },
      zh: {
        title: "印尼 BPOM 第二批 7 个 SKU 注册完成",
        excerpt: "已完成棉片与护肤共 7 款 SKU 的 BPOM 注册。",
        body: "<p>印尼 BPOM 第二批注册已完成，可立即向雅加达地区的合作伙伴发货。此次包含 3 款棉片与 4 款护肤产品。</p>",
      },
      vi: {
        title: "Hoàn tất đăng ký BPOM Indonesia đợt 2 (7 SKU)",
        excerpt: "Đã hoàn tất đăng ký BPOM cho 7 SKU bông tẩy và chăm sóc da.",
        body: "<p>Đợt 2 đăng ký BPOM Indonesia đã hoàn tất, có thể giao hàng ngay cho các đối tác tại Jakarta. Bao gồm 3 SKU bông tẩy trang và 4 SKU chăm sóc da.</p>",
      },
    },
  },
  {
    slug: "vietnam-2026-roadshow",
    category: "event",
    region: "Vietnam",
    publishedAt: "2026-03-25T00:00:00Z",
    thumbnailUrl: "/images/dostac/product-02.png",
    translations: {
      ko: {
        title: "2026 베트남 호치민 K-Beauty 로드쇼 참가",
        excerpt: "5월 호치민 K-Beauty 로드쇼에서 신제품을 선보입니다.",
        body: "<p>2026년 5월 호치민 SECC에서 열리는 K-Beauty 로드쇼에 참가합니다. 부스 B-12에서 신제품 라인업과 ODM 제안서를 만나보실 수 있습니다.</p>",
      },
      en: {
        title: "Joining the 2026 Ho Chi Minh K-Beauty Roadshow",
        excerpt: "We will showcase new products at May's HCMC K-Beauty Roadshow.",
        body: "<p>We will be at the K-Beauty Roadshow at SECC, Ho Chi Minh City, in May 2026. Visit booth B-12 to see the new line and ODM proposals.</p>",
      },
      ja: {
        title: "2026 ホーチミン K-Beauty ロードショー出展",
        excerpt: "5月のホーチミンK-Beautyロードショーで新製品を披露します。",
        body: "<p>2026年5月にホーチミンSECCで開催されるK-Beautyロードショーに出展します。ブースB-12で新製品ラインナップとODM提案書をご覧いただけます。</p>",
      },
      zh: {
        title: "参加 2026 胡志明 K-Beauty 路演",
        excerpt: "5 月将在胡志明 K-Beauty 路演展示新品。",
        body: "<p>我们将参加 2026 年 5 月在胡志明 SECC 举办的 K-Beauty 路演。欢迎莅临 B-12 展位查看新品阵容与 ODM 提案。</p>",
      },
      vi: {
        title: "Tham gia K-Beauty Roadshow 2026 tại TP.HCM",
        excerpt: "Chúng tôi sẽ giới thiệu sản phẩm mới tại K-Beauty Roadshow tháng 5.",
        body: "<p>Chúng tôi tham dự K-Beauty Roadshow tại SECC, TP. Hồ Chí Minh tháng 5/2026. Mời ghé gian B-12 để xem dòng sản phẩm mới và đề xuất ODM.</p>",
      },
    },
  },
  {
    slug: "us-mocra-self-cert-update",
    category: "regulatory",
    region: "United States",
    publishedAt: "2026-02-20T00:00:00Z",
    thumbnailUrl: "/images/dostac/product-03.png",
    translations: {
      ko: {
        title: "미국 MoCRA 자가 검증 업데이트",
        excerpt: "MoCRA 자가 검증 시스템에 신제품 5종을 추가 등록했습니다.",
        body: "<p>미국 MoCRA 규정에 따라 자가 검증 시스템에 신제품 5종을 추가했습니다. 모든 자료는 영문으로 제공되며 FDA 요청 시 즉시 제출이 가능합니다.</p>",
      },
      en: {
        title: "U.S. MoCRA Self-Certification Update",
        excerpt: "We added 5 new SKUs to our MoCRA self-certification system.",
        body: "<p>Per U.S. MoCRA regulations, we added 5 new SKUs to our self-certification system. All documentation is in English and ready for FDA submission on request.</p>",
      },
      ja: {
        title: "米国 MoCRA 自己認証アップデート",
        excerpt: "MoCRA自己認証システムに新製品5SKUを追加しました。",
        body: "<p>米国MoCRA規制に従い、自己認証システムに新製品5SKUを追加しました。すべての書類は英語で用意され、FDAから要請があれば即時提出可能です。</p>",
      },
      zh: {
        title: "美国 MoCRA 自我认证更新",
        excerpt: "已在 MoCRA 自我认证体系中新增 5 个 SKU。",
        body: "<p>根据美国 MoCRA 规定，我们在自我认证体系中新增 5 个 SKU。所有文件以英文提供，可应 FDA 要求立即提交。</p>",
      },
      vi: {
        title: "Cập nhật tự chứng nhận MoCRA Hoa Kỳ",
        excerpt: "Đã bổ sung 5 SKU mới vào hệ thống tự chứng nhận MoCRA.",
        body: "<p>Theo quy định MoCRA của Hoa Kỳ, chúng tôi đã thêm 5 SKU mới vào hệ thống tự chứng nhận. Toàn bộ tài liệu bằng tiếng Anh, sẵn sàng nộp cho FDA khi được yêu cầu.</p>",
      },
    },
  },
  {
    slug: "japan-pmda-cooperation",
    category: "regulatory",
    region: "Japan",
    publishedAt: "2026-01-30T00:00:00Z",
    thumbnailUrl: "/images/dostac/product-04.png",
    translations: {
      ko: {
        title: "일본 PMDA 협력 파트너 지정",
        excerpt: "도쿄 소재 약무 컨설팅 파트너와 PMDA 신고 협력을 체결했습니다.",
        body: "<p>도쿄 PMDA 신고 전문 컨설팅 파트너와 협력 계약을 체결했습니다. 일본 진출 고객사의 통관/표시 요구사항을 보다 빠르게 지원합니다.</p>",
      },
      en: {
        title: "Japan PMDA Cooperation Partner Appointed",
        excerpt: "We signed a PMDA filing cooperation with a Tokyo-based regulatory partner.",
        body: "<p>We signed a cooperation agreement with a Tokyo-based PMDA filing consultancy. Customers entering Japan get faster support on customs and labeling requirements.</p>",
      },
      ja: {
        title: "日本PMDA協力パートナー指定",
        excerpt: "東京の薬務コンサルとPMDA申請の協力を締結しました。",
        body: "<p>東京のPMDA申請専門コンサルティングと協力契約を締結しました。日本市場に進出するお客様の通関・表示要件をより迅速に支援します。</p>",
      },
      zh: {
        title: "日本 PMDA 合作伙伴签约",
        excerpt: "与东京药事咨询机构签订 PMDA 申报合作。",
        body: "<p>与东京专业 PMDA 申报咨询机构签署合作协议，为进入日本市场的客户提供更快的通关与标识合规支持。</p>",
      },
      vi: {
        title: "Chỉ định đối tác hợp tác PMDA Nhật Bản",
        excerpt: "Ký kết hợp tác nộp PMDA với đơn vị tư vấn dược tại Tokyo.",
        body: "<p>Đã ký thỏa thuận hợp tác với đơn vị tư vấn nộp hồ sơ PMDA tại Tokyo. Khách hàng tiến vào thị trường Nhật được hỗ trợ nhanh hơn về thông quan và nhãn mác.</p>",
      },
    },
  },
  {
    slug: "factory-iso-22716-renewal",
    category: "company",
    region: "Korea",
    publishedAt: "2026-01-08T00:00:00Z",
    thumbnailUrl: "/images/dostac/product-05.png",
    translations: {
      ko: {
        title: "ISO 22716 GMP 인증 갱신 완료",
        excerpt: "본사 공장의 ISO 22716 GMP 인증이 갱신되었습니다.",
        body: "<p>본사 화성 공장의 ISO 22716 GMP 인증이 갱신되었습니다. 청결한 생산 환경과 품질 관리 시스템을 통해 글로벌 고객사에 신뢰를 제공합니다.</p>",
      },
      en: {
        title: "ISO 22716 GMP Certification Renewed",
        excerpt: "Our HQ factory's ISO 22716 GMP certification has been renewed.",
        body: "<p>Our Hwaseong HQ factory has renewed its ISO 22716 GMP certification, reaffirming our clean production environment and quality management system to global customers.</p>",
      },
      ja: {
        title: "ISO 22716 GMP認証更新完了",
        excerpt: "本社工場のISO 22716 GMP認証が更新されました。",
        body: "<p>華城本社工場のISO 22716 GMP認証が更新されました。清潔な生産環境と品質管理体制で、グローバルのお客様に信頼をお届けします。</p>",
      },
      zh: {
        title: "ISO 22716 GMP 认证更新完成",
        excerpt: "总部工厂的 ISO 22716 GMP 认证已完成更新。",
        body: "<p>位于华城的总部工厂已完成 ISO 22716 GMP 认证更新，洁净生产环境与品质管理体系将持续为全球客户提供保障。</p>",
      },
      vi: {
        title: "Hoàn tất gia hạn chứng nhận ISO 22716 GMP",
        excerpt: "Nhà máy trụ sở đã gia hạn chứng nhận ISO 22716 GMP.",
        body: "<p>Nhà máy trụ sở tại Hwaseong đã gia hạn chứng nhận ISO 22716 GMP, tiếp tục mang đến môi trường sản xuất sạch và hệ thống quản lý chất lượng đáng tin cậy cho khách hàng toàn cầu.</p>",
      },
    },
  },
];

async function seed(): Promise<void> {
  logger.info("Starting seed...");

  // Admin user
  const adminEmail = (process.env["ADMIN_EMAIL"] ?? "admin@dostac.co.kr")
    .toLowerCase()
    .trim();
  const adminPassword = process.env["ADMIN_PASSWORD"] ?? "dostac1234!";
  const adminName = process.env["ADMIN_NAME"] ?? "DOSTAC Admin";

  const passwordHash = await hashPassword(adminPassword);
  await db
    .insert(adminUsersTable)
    .values({ email: adminEmail, passwordHash, name: adminName, role: "owner" })
    .onConflictDoUpdate({
      target: adminUsersTable.email,
      set: { passwordHash, name: adminName, role: "owner" },
    });
  logger.info({ adminEmail }, "Admin user upserted");

  // Wipe & reseed product/notice content
  await db.execute(sql`TRUNCATE TABLE product_translations RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE notice_translations RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE notices RESTART IDENTITY CASCADE`);

  for (const p of PRODUCTS) {
    const [row] = await db
      .insert(productsTable)
      .values({
        slug: p.slug,
        category: p.category,
        sortOrder: p.sortOrder,
        imageUrl: p.imageUrl,
        published: true,
      })
      .returning();
    if (!row) continue;
    await db.insert(productTranslationsTable).values(
      (Object.keys(p.translations) as Lang[]).map((lang) => ({
        productId: row.id,
        lang,
        name: p.translations[lang].name,
        headline: p.translations[lang].headline,
        body: p.translations[lang].body,
      })),
    );
  }
  logger.info({ count: PRODUCTS.length }, "Products seeded");

  for (const n of NOTICES) {
    const [row] = await db
      .insert(noticesTable)
      .values({
        slug: n.slug,
        category: n.category,
        region: n.region,
        thumbnailUrl: n.thumbnailUrl,
        published: true,
        publishedAt: new Date(n.publishedAt),
      })
      .returning();
    if (!row) continue;
    await db.insert(noticeTranslationsTable).values(
      (Object.keys(n.translations) as Lang[]).map((lang) => ({
        noticeId: row.id,
        lang,
        title: n.translations[lang].title,
        excerpt: n.translations[lang].excerpt,
        body: n.translations[lang].body,
      })),
    );
  }
  logger.info({ count: NOTICES.length }, "Notices seeded");

  logger.info("Seed complete");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, "Seed failed");
    process.exit(1);
  });
