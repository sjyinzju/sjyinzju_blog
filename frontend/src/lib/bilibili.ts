const SELECTED_BVIDS = [
  "BV1hAL56aE7V",
  "BV1a15y6nELP",
  "BV1UgAhzoE7V",
  "BV1rBFDzbEeY",
  "BV1SwvQB1EkE",
  "BV1aEUZBKEzr",
  "BV1FNgTz8Eyu",
  "BV1ixNqzZEET",
  "BV1qr4y1o7Yw",
];

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.bilibili.com",
};

export interface BilibiliVideo {
  bvid: string;
  title: string;
  desc: string;
  cover: string;
  pubdate: number;
  view: number;
  like: number;
  coin: number;
  favorite: number;
}

export async function getBilibiliVideos(): Promise<BilibiliVideo[]> {
  const results = await Promise.all(
    SELECTED_BVIDS.map(async (bvid) => {
      try {
        const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
        const res = await fetch(url, {
          headers: HEADERS,
          next: { revalidate: 300 },
        });
        const json = await res.json();
        const data = json.data ?? {};

        return {
          bvid,
          title: data.title ?? "",
          desc: data.desc ?? "",
          cover: data.pic ?? "",
          pubdate: data.pubdate ?? 0,
          view: data.stat?.view ?? 0,
          like: data.stat?.like ?? 0,
          coin: data.stat?.coin ?? 0,
          favorite: data.stat?.favorite ?? 0,
        };
      } catch (e) {
        console.error(`B站视频 ${bvid} 拉取失败:`, e);
        return null;
      }
    })
  );

  return results.filter(Boolean) as BilibiliVideo[];
}
