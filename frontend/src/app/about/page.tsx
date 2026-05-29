import InteractiveGrid from "@/components/InteractiveGrid";
import SubPageHero from "@/components/SubPageHero";
import SocialListItem from "@/components/SocialListItem";
import type { SocialAccount } from "@/components/SocialListItem";

const accounts: SocialAccount[] = [
  {
    platform: "GitHub",
    avatar: "https://github.com/sjyinzju.png",
    username: "Sjy_in_zju",
    link: "https://github.com/sjyinzju",
    bio: "sjyinzju",
  },
  {
    platform: "B站",
    avatar: "/bilibili-avatar.jpg",
    username: "Takagi_loving",
    link: "https://space.bilibili.com/542036974",
    bio: "为能够成为自己而挺起胸膛",
    localAvatar: true,
  },
  {
    platform: "QQ",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=2129381179&s=640",
    username: "2129381179",
    link: null,
    bio: "凉宫春日应援团视频组、开发组成员",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#F8F7F3]">
      <InteractiveGrid />
      <SubPageHero title="关于" />

      <div className="relative z-10 max-w-5xl ml-[15%] pl-8 pr-12 py-16 space-y-8">
        {accounts.map((account) => (
          <SocialListItem
            key={account.platform}
            account={account}
          />
        ))}
      </div>
    </div>
  );
}
