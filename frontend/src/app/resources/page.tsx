import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";
import resourcesImg from "../../../pictures/resources.png";

export default async function ResourcesPage() {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.tags.includes("资源"));
  return <SubPageContent title="资源" posts={filtered} image={resourcesImg.src} imageClassName="h-[32vh] md:h-[48vh]" imagePositionClass="bottom-[13%] md:bottom-[10%]" clipImage />;
}
