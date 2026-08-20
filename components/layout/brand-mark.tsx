import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function BrandMark() {
  return (
    <Link
      href="/"
      className="flex min-h-11 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
    >
      <span className="relative inline-flex size-9 shrink-0 overflow-hidden rounded-xl bg-[#0B1220] ring-1 ring-white/10">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={36}
          height={36}
          className="size-full object-cover"
        />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold tracking-tight">
          {siteConfig.shortName}
        </span>
        <span className="hidden text-[11px] text-zinc-500 sm:block">
          EVM · Solana · TRON
        </span>
      </span>
    </Link>
  );
}
