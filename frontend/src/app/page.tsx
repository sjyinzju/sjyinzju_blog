import { getPosts } from "@/lib/api";
import PageContent from "@/components/PageContent";
import homeImg from "../../pictures/home.png";

export default async function Home() {
  const posts = await getPosts();
  return <PageContent posts={posts} image={homeImg.src} imageClassName="h-[44vh] md:h-[64vh]" imagePositionClass="bottom-[23%] md:bottom-[20%]" clipImage />;
}
