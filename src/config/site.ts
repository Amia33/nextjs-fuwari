export type SiteLang = "zh_CN" | "en" | "ja_JP";

export const siteLang: SiteLang = "zh_CN";

export const siteConfig = {
  title: "笔记与札记",
  subtitle: "写字、读书、记录",
  description: "一个关于文字、阅读与日常的私人空间。",
  url: "https://example.com",
  basePath: "",
  lang: siteLang,
  timezone: "Asia/Tokyo",
  author: "Ami",
  banner: {
    src: "/images/banner.jpg",
    position: "center",
    dim: 0.35,
  },
  toc: { minHeadings: 2, maxDepth: 3 },
  favicon: "/favicon.ico",
} as const;
