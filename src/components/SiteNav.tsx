import { Link } from "@tanstack/react-router";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="font-display text-xl tracking-tight">
          Spatia
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/explore/$sceneId"
            params={{ sceneId: "cardiac" }}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Studio
          </Link>
          <Link
            to="/about"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
        </div>
      </nav>
    </header>
  );
}
