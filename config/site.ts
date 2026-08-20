export const siteConfig = {
  name: "Meme Coin Launchpad",
  shortName: "MemeLaunch",
  description:
    "Create and launch meme coins across EVM, Solana and TRON with no coding required.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export const navItems = [
  { href: "/create", label: "Create" },
  { href: "/explore", label: "Explore" },
  { href: "/launches", label: "Launches" },
  { href: "/dashboard", label: "Dashboard" },
] as const;
