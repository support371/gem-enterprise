import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT:              "hsl(var(--sidebar-background))",
          foreground:           "hsl(var(--sidebar-foreground))",
          primary:              "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent:               "hsl(var(--sidebar-accent))",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground))",
          border:               "hsl(var(--sidebar-border))",
          ring:                 "hsl(var(--sidebar-ring))",
        },

        // Semantic brand colors
        "cloud-dancer":  "hsl(var(--cloud-dancer))",
        "true-charcoal": "hsl(var(--true-charcoal))",
        "electric-cyan": "hsl(var(--electric-cyan))",
        "neon-lime":     "hsl(var(--neon-lime))",
        "night-plum":    "hsl(var(--night-plum))",

        // Service-specific tokens (consistent across the app)
        "svc-cyber": {
          DEFAULT: "hsl(var(--svc-cyber))",
          muted:   "hsl(var(--svc-cyber-muted))",
        },
        "svc-financial": {
          DEFAULT: "hsl(var(--svc-financial))",
          muted:   "hsl(var(--svc-financial-muted))",
        },
        "svc-realty": {
          DEFAULT: "hsl(var(--svc-realty))",
          muted:   "hsl(var(--svc-realty-muted))",
        },
      },
      fontFamily: {
        sans:     ["var(--font-sans)"],
        mono:     ["var(--font-mono)"],
        serif:    ["var(--font-serif)"],
        "sans-atr": ["var(--font-sans-atr)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          from: { backgroundPosition: "200% 0" },
          to:   { backgroundPosition: "-200% 0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.5" },
        },
        "progress-fill": {
          from: { width: "0%" },
          to:   { width: "var(--progress-width)" },
        },
      },
      animation: {
        "accordion-down":   "accordion-down 0.2s ease-out",
        "accordion-up":     "accordion-up 0.2s ease-out",
        "fade-in":          "fade-in 0.5s ease-out forwards",
        "slide-in-right":   "slide-in-right 0.5s ease-out forwards",
        "scale-in":         "scale-in 0.3s ease-out forwards",
        "shimmer":          "shimmer 8s linear infinite",
        "pulse-slow":       "pulse-slow 3s ease-in-out infinite",
        "progress-fill":    "progress-fill 0.8s ease-out forwards",
      },
      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        "shimmer-gradient":   "linear-gradient(90deg, transparent, hsl(var(--electric-cyan) / 0.1), transparent)",
        "cyber-gradient":     "linear-gradient(135deg, hsl(var(--svc-cyber)) 0%, hsl(var(--svc-cyber) / 0.6) 100%)",
        "financial-gradient": "linear-gradient(135deg, hsl(var(--svc-financial)) 0%, hsl(var(--svc-financial) / 0.6) 100%)",
        "realty-gradient":    "linear-gradient(135deg, hsl(var(--svc-realty)) 0%, hsl(var(--svc-realty) / 0.6) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
