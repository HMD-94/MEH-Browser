import React, { useEffect, useRef, useState } from 'react';
import { WallpaperConfig, ThemeConfig } from '../types/browser';
import { WALLPAPER_PRESETS, resolveWallpaperUrl } from '../constants/presets';

interface WallpaperBackgroundProps {
  wallpaper: WallpaperConfig;
  theme: ThemeConfig;
  mousePos?: { x: number; y: number };
}

export const WallpaperBackground: React.FC<WallpaperBackgroundProps> = React.memo(({
  wallpaper,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageError, setImageError] = useState(false);

  // Animated Fluid Canvas effect if animated
  const isAnimated =
    wallpaper.type === 'animated' ||
    (wallpaper.type === 'preset' &&
      WALLPAPER_PRESETS.find((p) => p.id === wallpaper.presetId)?.isAnimated);

  // Reset image error state when wallpaper changes
  useEffect(() => {
    setImageError(false);
  }, [wallpaper.presetId, wallpaper.customImageUrl, wallpaper.customOnlineUrl]);

  useEffect(() => {
    if (!isAnimated) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let isPaused = document.hidden;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Liquid Blobs parameters
    const blobs = [
      { x: width * 0.2, y: height * 0.3, r: 240, dx: 0.6, dy: 0.4, color: '#3b82f6' },
      { x: width * 0.7, y: height * 0.4, r: 300, dx: -0.5, dy: 0.7, color: '#8b5cf6' },
      { x: width * 0.4, y: height * 0.8, r: 260, dx: 0.5, dy: -0.4, color: '#06b6d4' },
      { x: width * 0.85, y: height * 0.75, r: 240, dx: -0.4, dy: -0.5, color: '#ec4899' },
    ];

    let t = 0;
    const render = () => {
      if (isPaused) return;

      t += 0.008;
      ctx.fillStyle = theme.mode === 'light' ? '#e2e8f0' : '#030712';
      ctx.fillRect(0, 0, width, height);

      // Draw drifting liquid gradients
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        b.x += b.dx;
        b.y += b.dy;

        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = height + b.r;
        if (b.y > height + b.r) b.y = -b.r;

        const grad = ctx.createRadialGradient(
          b.x + Math.sin(t + b.r) * 30,
          b.y + Math.cos(t) * 30,
          20,
          b.x,
          b.y,
          b.r * 1.4
        );
        grad.addColorStop(0, b.color + '99');
        grad.addColorStop(0.5, b.color + '26');
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAnimated, theme.mode]);

  // Compute CSS filter string
  const filterStyle = `blur(${wallpaper.blur || 0}px) brightness(${wallpaper.brightness ?? 1}) saturate(${wallpaper.saturation ?? 1})`;

  // Determine background content
  const renderBackground = () => {
    if (isAnimated) {
      return (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
          style={{
            filter: filterStyle,
            opacity: wallpaper.opacity,
          }}
        />
      );
    }

    if (
      (wallpaper.type === 'upload' || (wallpaper as any).type === 'online') &&
      (wallpaper.customImageUrl || wallpaper.customOnlineUrl) &&
      !imageError
    ) {
      const rawUrl = wallpaper.customImageUrl || wallpaper.customOnlineUrl;
      const srcUrl = resolveWallpaperUrl(rawUrl);
      return (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300 transform scale-105"
          style={{
            backgroundImage: `url(${srcUrl})`,
            filter: filterStyle,
            opacity: wallpaper.opacity,
          }}
        >
          <img
            src={srcUrl}
            alt=""
            className="hidden"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    if (wallpaper.type === 'color' && wallpaper.solidColor) {
      return (
        <div
          className="absolute inset-0 transition-colors duration-300"
          style={{
            backgroundColor: wallpaper.solidColor,
            filter: filterStyle,
            opacity: wallpaper.opacity,
          }}
        />
      );
    }

    if (wallpaper.type === 'gradient' && wallpaper.gradient) {
      const g = wallpaper.gradient;
      const stopsStr = g.stops
        .map((s) => `${s.color} ${s.offset}%`)
        .join(', ');
      const bgStyle =
        g.type === 'linear'
          ? `linear-gradient(${g.angle}deg, ${stopsStr})`
          : `radial-gradient(circle at center, ${stopsStr})`;

      return (
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: bgStyle,
            filter: filterStyle,
            opacity: wallpaper.opacity,
          }}
        />
      );
    }

    // Default or preset
    const preset =
      WALLPAPER_PRESETS.find((p) => p.id === wallpaper.presetId) ||
      WALLPAPER_PRESETS[0];

    if (preset.imageUrl && !imageError) {
      const resolvedImg = resolveWallpaperUrl(preset.imageUrl);
      return (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300 transform scale-105"
          style={{
            backgroundImage: `url(${resolvedImg})`,
            filter: filterStyle,
            opacity: wallpaper.opacity,
          }}
        >
          <img
            src={resolvedImg}
            alt=""
            className="hidden"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    if (preset.gradientCss) {
      return (
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: preset.gradientCss,
            filter: filterStyle,
            opacity: wallpaper.opacity,
          }}
        />
      );
    }

    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black" />
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Fallback solid background ensuring screen is never blank */}
      <div className="absolute inset-0 bg-slate-950" />

      {renderBackground()}

      {/* High-visibility contrast scrim layer ensuring foreground text & glass is always sharp */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background:
            theme.mode === 'light'
              ? 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.2) 0%, rgba(240,244,250,0.65) 100%)'
              : 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.25) 0%, rgba(5,8,16,0.78) 100%)',
        }}
      />

      {/* Subtle Liquid Glass Mesh Grid / Vignette */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background:
            theme.mode === 'light'
              ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(220,230,245,0.4) 100%)'
              : 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Interactive Liquid Glass Light Caustic Reflection using CSS variables */}
      {theme.mouseGlowEnabled && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-150"
          style={{
            background:
              'radial-gradient(700px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), rgba(255, 255, 255, 0.08), transparent 60%)',
          }}
        />
      )}
    </div>
  );
});
