import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";
import inspirationImg from "../../../pictures/inspiration.png";

export default async function InspirationPage() {
  const posts = await getPosts();
  const filtered = posts
    .filter((p) => p.tags.includes("灵感"))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return <SubPageContent title="灵感" posts={filtered} image={inspirationImg.src} imageClassName="h-[24vh] md:h-[40vh]" imagePositionClass="bottom-[23%] md:bottom-[17.5%]" />;
}
