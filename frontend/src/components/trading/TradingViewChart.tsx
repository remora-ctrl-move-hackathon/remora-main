"use client";

import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string; // e.g., "BTCUSD", "ETHUSD", "APTUSD"
  interval?: string; // e.g., "1", "5", "15", "60", "D"
  theme?: 'light' | 'dark';
  height?: number;
}

export function TradingViewChart({
  symbol,
  interval = "60",
  theme = "light",
  height = 500
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    // Create TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && containerRef.current) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${symbol}`,
          interval: interval,
          timezone: "Etc/UTC",
          theme: theme,
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          hide_side_toolbar: false,
          studies: [
            "Volume@tv-basicstudies"
          ],
          disabled_features: [
            "use_localstorage_for_settings"
          ],
          enabled_features: [
            "study_templates"
          ],
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [symbol, interval, theme]);

  return (
    <div
      ref={containerRef}
      id={`tradingview_${symbol}`}
      style={{ height: `${height}px`, width: '100%' }}
    />
  );
}

// Lightweight chart component for smaller displays
export function TradingViewMiniChart({
  symbol,
  theme = "light"
}: {
  symbol: string;
  theme?: 'light' | 'dark';
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: `BINANCE:${symbol}`,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "1D",
      colorTheme: theme,
      trendLineColor: "rgba(41, 98, 255, 1)",
      underLineColor: "rgba(41, 98, 255, 0.3)",
      underLineBottomColor: "rgba(41, 98, 255, 0)",
      isTransparent: false,
      autosize: true,
      largeChartUrl: ""
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: '200px', width: '100%' }}
    />
  );
}
