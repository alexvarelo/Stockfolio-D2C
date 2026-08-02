import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Home, RotateCcw, User, Briefcase, LifeBuoy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StockyLogo } from "@/components/brand/StockyLogo";
import { useTheme } from "@/contexts/ThemeContext";

interface NotFoundProps {
  type?: 'page' | 'user' | 'portfolio';
  message?: string;
}

interface Star {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

const STAR_COUNT = 70;

function useStarfield(): Star[] {
  return useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, () => ({
        top: Math.random() * 62,
        left: Math.random() * 100,
        size: Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
      })),
    []
  );
}

const NotFound = ({ type = 'page', message }: NotFoundProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const stars = useStarfield();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const notFoundItem = pathSegments[pathSegments.length - 1] || 'page';

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const getNotFoundContent = () => {
    switch (type) {
      case 'user':
        return {
          title: 'User Not Found',
          description: message || `The profile "${notFoundItem}" doesn't exist or has been removed.`,
          icon: User,
        };
      case 'portfolio':
        return {
          title: 'Portfolio Not Found',
          description: message || `The portfolio "${notFoundItem}" doesn't exist or you don't have permission to view it.`,
          icon: Briefcase,
        };
      default:
        return {
          title: 'Signal Lost',
          description: message || "The page you're looking for doesn't exist, or it slipped through the noise.",
          icon: null,
        };
    }
  };

  const { title, description, icon: Icon } = getNotFoundContent();
  const handleGoHome = () => navigate("/");
  const handleGoBack = () => navigate(-1);

  const isDark = resolvedTheme === 'dark';
  const primaryVariant = isDark ? "default" : "dark";
  const outlineVariant = isDark ? "outline-dark" : "outline";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col items-center justify-center px-6">
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-foreground"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: star.size,
              height: star.size,
            }}
            initial={{ opacity: 0.15 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.35 }
                : { opacity: [0.15, 0.7, 0.15] }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: star.duration,
                    delay: star.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </div>

      {/* Radial dome glow, echoing the two-mode canvas system */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 15%, hsl(var(--foreground) / 0.10), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "hsl(var(--foreground) / 0.14)" }}
      />

      {/* Brand mark, top-left */}
      <button
        onClick={handleGoHome}
        className="absolute left-6 top-6 flex items-center gap-2 text-foreground/80 transition-opacity hover:opacity-100 md:left-10 md:top-10"
        aria-label="Go to Stocky home"
      >
        <StockyLogo variant={isDark ? "paper" : "ink"} size={32} className="shadow-sm rounded-lg" />
        <span className="text-sm font-semibold tracking-tight">Stocky</span>
      </button>

      <motion.div
        className="relative z-10 flex max-w-xl flex-col items-center text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <motion.div
            animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <StockyLogo variant="mark" size={56} animated className="text-foreground" />
          </motion.div>
          {Icon && (
            <motion.div
              className="mx-auto -mt-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          )}
        </motion.div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Error 404
        </p>

        <motion.h1
          className="text-[64px] font-bold leading-none tracking-tight md:text-[96px]"
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.03, 1] }}
          transition={
            prefersReducedMotion ? undefined : { duration: 2.5, ease: "easeInOut" }
          }
        >
          404
        </motion.h1>

        <h2 className="mt-4 text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-muted-foreground">{description}</p>

        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleGoHome}
            variant={primaryVariant}
            size="lg"
            className="min-w-[180px]"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
          <Button
            onClick={handleGoBack}
            variant={outlineVariant}
            size="lg"
            className="min-w-[180px]"
          >
            <RotateCcw className="h-4 w-4" />
            Go Back
          </Button>
        </motion.div>

        <motion.a
          href="mailto:support@stocky.app"
          className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <LifeBuoy className="h-3.5 w-3.5" />
          Contact support
        </motion.a>
      </motion.div>
    </div>
  );
};

export default NotFound;
