'use client';

import { useEffect, useRef, memo, useId } from "react";

// ── TradingView Calendar ────────────────────────────────────────────────────

function TradingViewCalendarComponent() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "light",
      isTransparent: true,
      width: "100%",
      height: "100%",
      locale: "en",
      importanceFilter: "-1,0,1",
      countryFilter:
        "us,eu,gb,jp,cn,de,fr,it,au,ca,ch,nz,sg,hk,kr,mx,es,br,in,ru,tr,za",
    });

    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full" />
    </div>
  );
}

export const TradingViewCalendar = memo(TradingViewCalendarComponent);

// ── TradingView Chart ────────────────────────────────────────────────────────

interface TradingViewChartProps {
  symbol?: string;
  theme?: "light" | "dark";
}

declare global {
  interface Window {
    TradingView: any;
  }
}

function TradingViewChartComponent({
  symbol = "BTCUSD",
  theme = "light",
}: TradingViewChartProps) {
  const containerId = useId().replace(/:/g, "tv-");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          width: "100%",
          height: "100%",
          symbol: `COINBASE:${symbol}`,
          interval: "D",
          timezone: "Etc/UTC",
          theme,
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerId,
        });
      }
    };
    containerRef.current.appendChild(script);
  }, [symbol, theme, containerId]);

  return (
    <div
      id={containerId}
      className="w-full h-full"
      ref={containerRef}
    />
  );
}

export const TradingViewChart = memo(TradingViewChartComponent);
