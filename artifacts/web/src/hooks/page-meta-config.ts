import type { Lang } from "@/components/dostac/i18n";

interface MetaEntry {
  title: string;
  description: string;
}

type PageMetaConfig = Record<Lang, MetaEntry>;

export const HOME_META: PageMetaConfig = {
  ko: { title: "도스탁 - 한국 화장품 OEM/ODM 전문", description: "아시아·미주·유럽 30개국에 K-Beauty를 공급하는 도스탁의 OEM/ODM 제조 솔루션을 만나보세요." },
  en: { title: "Korean Cosmetics OEM & ODM Manufacturer | Dostac", description: "Dostac powers global K-Beauty with partners across 30 countries. Trusted OEM/ODM manufacturer for private label skincare." },
  ja: { title: "韓国化粧品OEM/ODMメーカー | Dostac", description: "アジア・米州・欧州30カ国にK-Beautyを届けるDostacのOEM/ODMソリューション。" },
  zh: { title: "韩国化妆品OEM/ODM制造商 | Dostac", description: "Dostac携手30个国家的合作伙伴，共创全球K-Beauty。专业OEM/ODM代工制造。" },
  vi: { title: "Nhà Sản Xuất Mỹ Phẩm OEM/ODM Hàn Quốc | Dostac", description: "Dostac cung cấp giải pháp OEM/ODM K-Beauty tại 30 quốc gia trên toàn cầu." },
};

export const ABOUT_META: PageMetaConfig = {
  ko: { title: "Dostac 소개 - 회사 소개 및 비전", description: "도스탁의 설립 배경, 기업 철학, 글로벌 네트워크와 오시는 길을 소개합니다." },
  en: { title: "About Dostac - Company & Vision", description: "Learn about Dostac's founding story, company philosophy, global network and office directions." },
  ja: { title: "Dostacについて - 企業情報とビジョン", description: "Dostacの設立背景、企業理念、グローバルネットワークをご紹介します。" },
  zh: { title: "关于Dostac - 公司介绍与愿景", description: "了解Dostac的创立背景、企业理念与全球合作网络。" },
  vi: { title: "Về Dostac - Giới Thiệu Công Ty", description: "Tìm hiểu về lịch sử, triết lý kinh doanh và mạng lưới toàn cầu của Dostac." },
};

export const PRODUCTION_META: PageMetaConfig = {
  ko: { title: "생산 역량 - OEM/ODM 프로세스 & 글로벌 인증", description: "디자인부터 양산까지 통합 제조 프로세스와 ISO 22716, CE, FDA 등 글로벌 인증을 확인하세요." },
  en: { title: "Production - OEM/ODM Process & Global Certifications", description: "Integrated manufacturing from design to mass production. ISO 22716, CE, FDA certified K-Beauty OEM/ODM." },
  ja: { title: "生産 - OEM/ODMプロセス＆グローバル認証", description: "デザインから量産まで一気通貫の製造プロセスとISO 22716・CE・FDA認証をご確認ください。" },
  zh: { title: "生产 - OEM/ODM流程与全球认证", description: "从设计到量产的一站式制造流程，ISO 22716、CE、FDA等全球认证。" },
  vi: { title: "Sản Xuất - Quy Trình OEM/ODM & Chứng Nhận Toàn Cầu", description: "Quy trình sản xuất tích hợp từ thiết kế đến sản xuất hàng loạt với chứng nhận ISO 22716, CE, FDA." },
};

export const PRODUCTS_META: PageMetaConfig = {
  ko: { title: "제품 - K-Beauty OEM/ODM 제품 카탈로그", description: "스킨케어, 헤어케어, 바디케어, 마스크, 물티슈까지 풀라인업 OEM/ODM 제품을 확인하세요." },
  en: { title: "Products - K-Beauty OEM/ODM Catalog", description: "Browse our full OEM/ODM product lineup: skincare, haircare, bodycare, masks, and wipes for global brands." },
  ja: { title: "製品 - K-BeautyのOEM/ODMカタログ", description: "スキンケア・ヘアケア・ボディケア・マスク・ウェットティッシュのフルラインOEM/ODM製品一覧。" },
  zh: { title: "产品 - K-Beauty OEM/ODM产品目录", description: "浏览全系列OEM/ODM产品：护肤、护发、护体、面膜及湿巾，覆盖全球品牌需求。" },
  vi: { title: "Sản Phẩm - Danh Mục OEM/ODM K-Beauty", description: "Khám phá danh mục đầy đủ OEM/ODM: chăm sóc da, tóc, cơ thể, mặt nạ và khăn ướt cho thương hiệu toàn cầu." },
};

export const NOTICES_META: PageMetaConfig = {
  ko: { title: "Insights - 규제 업데이트 & 업계 소식", description: "도스탁의 최신 규제 대응 현황, 전시회 참가 소식, 업계 트렌드를 확인하세요." },
  en: { title: "Insights - Regulatory Updates & Industry News", description: "Latest regulatory updates, trade show participations and K-Beauty industry news from Dostac." },
  ja: { title: "Insights - 規制アップデート＆業界ニュース", description: "Dostacの最新規制対応状況、展示会参加情報、業界トレンドをご確認ください。" },
  zh: { title: "Insights - 法规更新与行业资讯", description: "了解Dostac最新法规应对进展、展会参与动态及美妆行业趋势。" },
  vi: { title: "Insights - Cập Nhật Quy Định & Tin Tức Ngành", description: "Cập nhật quy định mới nhất, thông tin tham gia triển lãm và xu hướng ngành K-Beauty từ Dostac." },
};

export const CONTACT_META: PageMetaConfig = {
  ko: { title: "문의하기 - OEM/ODM 견적 요청", description: "도스탁의 글로벌 영업팀에 문의하세요. OEM/ODM 견적, 샘플 요청, 제품 상담을 도와드립니다." },
  en: { title: "Contact - Request OEM/ODM Quote", description: "Contact Dostac's global sales team. Request quotes, samples, and expert consultation for your OEM/ODM project." },
  ja: { title: "お問い合わせ - OEM/ODM見積もり依頼", description: "Dostacのグローバル営業チームにお問い合わせください。OEM/ODM見積もり・サンプル依頼・製品相談を承ります。" },
  zh: { title: "联系我们 - 申请OEM/ODM报价", description: "联系Dostac全球销售团队，申请报价、样品及专业OEM/ODM项目咨询。" },
  vi: { title: "Liên Hệ - Yêu Cầu Báo Giá OEM/ODM", description: "Liên hệ đội ngũ kinh doanh toàn cầu của Dostac. Yêu cầu báo giá, mẫu thử và tư vấn dự án OEM/ODM." },
};
