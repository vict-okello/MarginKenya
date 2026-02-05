import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "World News", to: "/worldnews" },
  { label: "Politics", to: "/politics" },
  { label: "Business", to: "/business" },
  { label: "Technology", to: "/technology" },
  { label: "Health", to: "/health" },
  { label: "Sports", to: "/sports" },
  { label: "Culture", to: "/culture" },
  { label: "Podcast", to: "/podcast" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#d8d8dc] px-4 py-4 md:py-3">
      <div className="mx-auto w-full max-w-5xl">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-end justify-center gap-1 pb-3 text-black transition ${
              isActive ? "opacity-100" : "opacity-90 hover:opacity-100"
            }`
          }
        >
          <span
            className="text-5xl leading-none md:text-6xl"
            style={{ fontFamily: "'Old English Text MT', 'Times New Roman', serif" }}
          >
            The
          </span>
          <span
            className="text-5xl font-extrabold uppercase leading-none md:text-6xl"
            style={{ fontFamily: "Arial Black, Impact, sans-serif" }}
          >
            Margin
            <span className="ml-1 align-super text-xs font-semibold tracking-wide md:text-sm">ke</span>
          </span>
        </NavLink>

        <nav className="border-y border-black/25 py-2">
          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-black/85">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `transition ${
                      isActive
                        ? "border-b border-black/80 pb-0.5 font-semibold text-black"
                        : "text-black/70 hover:text-black"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

