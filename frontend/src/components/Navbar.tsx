"use client";

const navItems = [
  { label: "笔记", href: "#" },
  { label: "思考", href: "#" },
  { label: "视频", href: "#" },
  { label: "项目开发", href: "#" },
  { label: "灵感与分享", href: "#" },
  { label: "经历", href: "#" },
  { label: "关于", href: "#" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center h-16 pl-[15%]">
        <ul className="flex items-center gap-8 text-sm tracking-wide text-[#555]">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="relative inline-block py-1 transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:text-[#1a1a1a]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
