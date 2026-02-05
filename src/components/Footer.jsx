import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#d8d8dc] px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="border-t-[3px] border-black/75 pt-3">
          <Link to="/" className="flex items-end justify-center gap-1 text-black">
            <span
              className="text-4xl leading-none"
              style={{ fontFamily: "'Old English Text MT', 'Times New Roman', serif" }}
            >
              The
            </span>
            <span
              className="text-4xl font-extrabold uppercase leading-none"
              style={{ fontFamily: "Arial Black, Impact, sans-serif" }}
            >
              Margin
              <span className="ml-1 align-super text-[10px] font-semibold tracking-wide">ke</span>
            </span>
          </Link>
        </div>

        <div className="mt-3 border-t border-black/35 pt-3">
          <div className="flex flex-col items-start justify-between gap-3 border-b border-black/35 pb-3 text-xs text-black/70 md:flex-row md:items-center">
            <p>
              Copyright (c) 2026 - Margin
              <span className="ml-1 align-super text-[9px] font-semibold tracking-wide">ke</span> - All rights
              reserved
            </p>

            <div className="flex items-center gap-3 text-black/80">
              <a href="#" aria-label="Instagram" className="hover:text-black">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm4.8-2.8a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2Z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-black">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zm7 0h3.8v1.7h.1A4.2 4.2 0 0 1 17.7 9c4 0 4.8 2.6 4.8 6V21h-4v-5.3c0-1.3 0-2.8-1.7-2.8s-2 1.4-2 2.7V21h-4z" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-black">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M23 12s0-3.3-.4-4.8a2.5 2.5 0 0 0-1.8-1.8C19.2 5 12 5 12 5s-7.2 0-8.8.4a2.5 2.5 0 0 0-1.8 1.8C1 8.7 1 12 1 12s0 3.3.4 4.8a2.5 2.5 0 0 0 1.8 1.8C4.8 19 12 19 12 19s7.2 0 8.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.5.4-4.8.4-4.8ZM10 15.5v-7l6 3.5z" />
                </svg>
              </a>
              <a href="#" aria-label="X" className="hover:text-black">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.3-8.3L1 2h6.3l4.3 5.7zm-1.1 18h1.7L6.4 3.9H4.6z" />
                </svg>
              </a>
              <a href="#" aria-label="Reddit" className="hover:text-black">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M14.7 3.8 13.9 7a8.4 8.4 0 0 1 3.9 1c.5-.5 1.1-.8 1.9-.8a2.3 2.3 0 1 1-1.4 4.2 3.7 3.7 0 0 1 .1.9c0 3.2-2.9 5.7-6.4 5.7s-6.4-2.5-6.4-5.7c0-.3 0-.6.1-.9A2.3 2.3 0 1 1 5.2 8a8.5 8.5 0 0 1 4.7-1.1l1-3.9a1 1 0 0 1 1.2-.7l2.8.6a1.2 1.2 0 1 1-.2 1.5zM8.9 13a1.2 1.2 0 1 0 0-2.3 1.2 1.2 0 0 0 0 2.3Zm6.2-2.3a1.2 1.2 0 1 0 0 2.3 1.2 1.2 0 0 0 0-2.3Zm-1.2 3.4a2.7 2.7 0 0 1-3.8 0 .6.6 0 0 0-.9.9 4 4 0 0 0 5.6 0 .6.6 0 0 0-.9-.9z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

