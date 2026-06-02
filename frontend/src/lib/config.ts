export const TAG_ROUTE_MAP: Record<string, string> = {
  "笔记": "notes",
  "思考": "thoughts",
  "视频": "videos",
  "项目开发": "projects",
  "灵感": "inspiration",
  "资源": "resources",
  "关于": "about",
};

export const ROUTE_TAG_MAP: Record<string, string> = {
  "notes": "笔记",
  "thoughts": "思考",
  "videos": "视频",
  "projects": "项目开发",
  "inspiration": "灵感",
  "resources": "资源",
  "about": "关于",
};

export function getCategoryUrl(tag: string): string {
  return TAG_ROUTE_MAP[tag] || tag.toLowerCase();
}

export function getTagFromRoute(route: string): string {
  return ROUTE_TAG_MAP[route] || route;
}
