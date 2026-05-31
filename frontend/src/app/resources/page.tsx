import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";
import resourcesImg from "../../../pictures/resources.png";

export default async function ResourcesPage() {
  const posts = await getPosts();
  const filtered = posts
    .filter((p) => p.tags.includes("资源"))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return <SubPageContent title="资源" posts={filtered} image={resourcesImg.src} imageClassName="h-[32vh] md:h-[40vh]" imagePositionClass="bottom-[13%] md:bottom-[20.3%]" />;
}
