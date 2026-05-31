import { getPosts } from "@/lib/api";
import SubPageContent from "@/components/SubPageContent";
import notesImg from "../../../pictures/notes.png";

export default async function NotesPage() {
  const posts = await getPosts();
  const filtered = posts
    .filter((p) => p.tags.includes("笔记"))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return <SubPageContent title="笔记" posts={filtered} image={notesImg.src} imageClassName="h-[24vh] md:h-[40vh]" imagePositionClass="bottom-[23%] md:bottom-[15%] left-[64%]" />;
}
