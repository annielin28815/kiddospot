import Link from "next/link";
import { ArrowRight, MapPinned, Search, Heart } from "lucide-react";
import BrandLogo from "../components/BrandLogo";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-brand-cream text-brand-ink dark:bg-[#1F1A17] dark:text-[#F7EEE8]">
      <div className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-6 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm shadow-soft backdrop-blur dark:bg-white/10">
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-brand-peach" />
            陪孩子一起探索新地方
          </div>
        </div>

        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="animate-[float_4s_ease-in-out_infinite] rounded-[2rem] bg-white/80 p-4 shadow-soft backdrop-blur dark:bg-white/10">
            <BrandLogo size={160} showText={false} />
          </div>

          <div className="mt-8 animate-[fadeUp_0.7s_ease-out_both]">
            <p className="mb-4 text-sm tracking-[0.18em] text-brand-softInk dark:text-[#CBBDB2]">
              親子友善地點探索網站
            </p>

            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              發現適合孩子的
              <br />
              每一個快樂角落
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-softInk dark:text-[#CBBDB2] sm:text-base">
              不論是公園、餐廳或室內空間，
              <br/>
              快速找到適合帶孩子一起去的好地方。
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 animate-[fadeUp_0.9s_ease-out_both]">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-softInk dark:text-[#CBBDB2]">
              <Search className="h-3.5 w-3.5 text-brand-peach" />
              快速搜尋
            </div>

            <span className="hidden h-1 w-1 rounded-full bg-brand-peach/50 sm:inline-block" />

            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-softInk dark:text-[#CBBDB2]">
              <MapPinned className="h-3.5 w-3.5 text-brand-peach" />
              地圖瀏覽
            </div>

            <span className="hidden h-1 w-1 rounded-full bg-brand-peach/50 sm:inline-block" />

            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-softInk dark:text-[#CBBDB2]">
              <Heart className="h-3.5 w-3.5 text-brand-peach" />
              收藏地點
            </div>
          </div>
        </section>

        <div className="flex justify-center pt-8 pb-12 animate-[fadeUp_1.1s_ease-out_both]">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-full bg-brand-peach px-7 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.03] hover:opacity-95 active:scale-[0.98]"
          >
            開始探索
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </main>
  );
}