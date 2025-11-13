import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  return (
    <div className="mx-auto px-[100px]" style={{ letterSpacing: "-0.02em" }}>
      <Link to="/" className="font-bold mt-8 text-[36px] block hover:underline">
        Seoul Tourism Map for Koreans
      </Link>
      <div className="flex flex-col text-left gap-1 mt-4 mb-2 text-sm font-medium text-zinc-700 px-1">
        <Link
          to="/"
          className={`hover:underline${location.pathname === "/" ? " font-bold" : ""}`}
        >
          All
        </Link>
        <span>Category</span>
        <span>Region</span>
      </div>
      <div className="w-full mt-4 h-px bg-zinc-300" />
    </div>
  );
};

export default Header;