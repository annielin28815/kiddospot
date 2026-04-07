import Link from "next/link";
import BrandLogo from "../components/BrandLogo";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-brand-cream text-brand-ink dark:bg-[#1F1A17] dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-6 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm shadow-soft dark:bg-white/10">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-peach" />
            Calm, playful, kid-friendly
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <BrandLogo size={180} showText={false} />

          <div className="mt-8 text-center">
            <p className="mb-4 text-sm tracking-[0.2em] text-brand-softInk dark:text-white/70">
              FIND FAMILY-FRIENDLY PLACES
            </p>

            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Discover joyful spots
              <br />
              for little adventures.
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-softInk dark:text-white/70 sm:text-base">
              Explore parks, restaurants, indoor spaces, and family-friendly
              facilities with a warm, playful map experience.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end pt-6">
          <Link
            href="/home"
            className="inline-flex items-center rounded-full bg-brand-ink px-6 py-3 text-sm font-medium text-white shadow-soft transition hover:scale-[1.02] hover:opacity-95 dark:bg-white dark:text-[#1F1A17]"
          >
            Start
          </Link>
        </div>
      </div>
    </main>
  );
}
