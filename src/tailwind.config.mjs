/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
    theme: {
        extend: {
            fontSize: {
                xs: ["0.75rem", { lineHeight: "1.2", letterSpacing: "0.02em", fontWeight: "400" }],
                sm: ["0.875rem", { lineHeight: "1.3", letterSpacing: "0.02em", fontWeight: "400" }],
                base: ["1rem", { lineHeight: "1.5", letterSpacing: "0.025em", fontWeight: "400" }],
                lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "0.025em", fontWeight: "500" }],
                xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "0.03em", fontWeight: "600" }],
                "2xl": ["1.5rem", { lineHeight: "1.4", letterSpacing: "0.03em", fontWeight: "600" }],
                "3xl": ["1.875rem", { lineHeight: "1.3", letterSpacing: "0.035em", fontWeight: "700" }],
                "4xl": ["2.25rem", { lineHeight: "1.2", letterSpacing: "0.04em", fontWeight: "700" }],
                "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "0.045em", fontWeight: "800" }],
                "6xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "0.05em", fontWeight: "800" }],
                "7xl": ["4.5rem", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "900" }],
                "8xl": ["6rem", { lineHeight: "1", letterSpacing: "0.06em", fontWeight: "900" }],
                "9xl": ["8rem", { lineHeight: "1", letterSpacing: "0.07em", fontWeight: "900" }],
            },
            fontFamily: {
                heading: ["Sora"],
                paragraph: ["Sora"]
            },
            colors: {
                "glassmorphism-overlay": "rgba(255, 255, 255, 0.1)",
                destructive: "#DF3131",
                "destructive-foreground": "#FFFFFF",
                background: "#121212",
                secondary: "#1C1C1C",
                foreground: "#FFFFFF",
                "secondary-foreground": "#FFFFFF",
                "primary-foreground": "#FFFFFF",
                primary: "#D23F0F",
                "background-light": "#FAFAFA",
                divider: "#E0E0E0",
                surfacedark: "#1C1C1C"
            },
            darkMode: 'class',
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
