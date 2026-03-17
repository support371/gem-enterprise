import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ExternalLink, ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const GEM_SENTINEL_URL = "https://gem-sentinel-trust.lovable.app";

export default function GemSentinel() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-0">
      {/* Slim chrome bar */}
      {!isFullscreen && (
        <header className="flex items-center justify-between gap-4 px-4 h-12 border-b border-border/50 bg-background/95 backdrop-blur shrink-0 z-10">
          {/* Left: back + branding */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>

            <div className="w-px h-5 bg-border" />

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                GEM <span className="text-primary">Sentinel</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground">gem-sentinel-trust.lovable.app</span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsFullscreen(true)}
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              asChild
            >
              <a href={GEM_SENTINEL_URL} target="_blank" rel="noopener noreferrer" title="Open in new tab">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </header>
      )}

      {/* Fullscreen exit bar */}
      {isFullscreen && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 bg-background/80 backdrop-blur border border-border/50 text-muted-foreground hover:text-foreground"
            onClick={() => setIsFullscreen(false)}
          >
            <Minimize2 className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">Exit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 bg-background/80 backdrop-blur border border-border/50 text-muted-foreground hover:text-foreground"
            asChild
          >
            <a href={GEM_SENTINEL_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>
      )}

      {/* Full-bleed iframe — renders the site exactly as-is */}
      <iframe
        src={GEM_SENTINEL_URL}
        title="GEM Sentinel Trust"
        className="flex-1 w-full border-0"
        allow="fullscreen"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
      />
    </div>
  );
}
