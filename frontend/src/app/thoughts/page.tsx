import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";
import thinkingsImg from "../../../pictures/thinkings.png";

export default async function ThoughtsPage() {
  const posts = await getPosts();
  const filtered = posts
    .filter((p) => p.tags.includes("思考"))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return <SubPageContent title="思考" posts={filtered} image={thinkingsImg.src} imageClassName="h-[24vh] md:h-[40vh]" imagePositionClass="bottom-[23%] md:bottom-[11%]" />;
}
