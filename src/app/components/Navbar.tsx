import { Link } from "react-router";
import { Leaf } from "lucide-react";

export function Navbar() {
  return (
    <nav style={{ backgroundColor: "#FAF7F2", borderBottom: "1px solid #EDE8DF" }} className="sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#3D6B4F" }}>
            <Leaf size={16} color="white" />
          </div>
          <span className="text-lg font-bold" style={{ color: "#3D6B4F" }}>GlycoTrack</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{ borderColor: "#EDE8DF", color: "#6B6B6B" }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#3D6B4F" }}
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  );
}
