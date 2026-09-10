import { Link } from "@tanstack/react-router";
import { Boxes, Info } from "lucide-react";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="font-display text-base font-bold tracking-tight">
          SPATIA
        </Link>
        <div className="ml-2 flex flex-1 items-center gap-1">
          <Link
            to="/explore/$sceneId"
            params={{ sceneId: "cardiac" }}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <Boxes className="h-3.5 w-3.5" />
            3D Studio
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <Info className="h-3.5 w-3.5" />
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
