export type TimelineEntry = {
  date: string;
  title: string;
  description?: string;
};

export const timeline: TimelineEntry[] = [
  {
    date: "2026-11",
    title: "开始重写站点",
    description: "把旧的构建流程换成更简单的一套，只保留真正会用的部分。",
  },
  {
    date: "2026-10",
    title: "翻译校对完成",
    description: "一本书的译稿终于校对完毕。",
  },
  {
    date: "2026-07",
    title: "搬到京都",
    description: "换了一个城市生活，开始记录沿河的散步。",
  },
];
