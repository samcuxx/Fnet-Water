"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type TouchEvent,
} from "react";

const PRODUCTS = [
  {
    id: "19l",
    label: "19L",
    name: "Dispenser jug",
    image: "/landing/products/19l.jpg",
    scale: 1.55,
  },
  {
    id: "5l",
    label: "5L",
    name: "Family jug",
    image: "/landing/products/5l.jpg",
    scale: 1.48,
  },
  {
    id: "1-5l",
    label: "1.5L",
    name: "Everyday bottle",
    image: "/landing/products/1-5l.jpg",
    scale: 1.42,
  },
  {
    id: "750ml",
    label: "750ML",
    name: "Premium spring",
    image: "/landing/products/750ml.png",
    scale: 0.72,
  },
  {
    id: "600ml",
    label: "600ML",
    name: "On the go",
    image: "/landing/products/600ml.jpg",
    scale: 0.68,
  },
  {
    id: "330ml",
    label: "330ML",
    name: "Personal size",
    image: "/landing/products/330ml.jpg",
    scale: 0.62,
  },
] as const;

const VISIBLE = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
} as const;

function useVisibleCount() {
  const [count, setCount] = useState(VISIBLE.desktop);

  useEffect(() => {
    const sync = () => {
      if (window.matchMedia("(max-width: 639px)").matches) {
        setCount(VISIBLE.mobile);
      } else if (window.matchMedia("(max-width: 1023px)").matches) {
        setCount(VISIBLE.tablet);
      } else {
        setCount(VISIBLE.desktop);
      }
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return count;
}

export function ProductCarousel() {
  const visible = useVisibleCount();
  const maxIndex = Math.max(0, PRODUCTS.length - visible);
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  useEffect(() => {
    const timer = window.setInterval(goNext, 5000);
    return () => window.clearInterval(timer);
  }, [goNext]);

  const onTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) goNext();
      else goPrev();
    }
    setTouchStartX(null);
  };

  const slidePct = 100 / visible;

  return (
    <section
      id="products"
      className="scroll-mt-28 overflow-hidden bg-white py-14 sm:scroll-mt-32 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#0A1931] sm:text-4xl">
            Our Products
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
            F Net products provide clean hydration for every occasion — from
            portable bottles to refillable dispenser jugs for home and office.
          </p>
        </div>

        <div className="relative mt-10 sm:mt-14">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous products"
            className="absolute left-0 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center text-[#0A1931]/45 transition-colors hover:text-[#0056D2] sm:-left-2 sm:flex lg:-left-4"
          >
            <ChevronLeft className="size-8 stroke-[1.25]" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next products"
            className="absolute right-0 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center text-[#0A1931]/45 transition-colors hover:text-[#0056D2] sm:-right-2 sm:flex lg:-right-4"
          >
            <ChevronRight className="size-8 stroke-[1.25]" aria-hidden />
          </button>

          <div
            className="overflow-hidden px-2 sm:px-8"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <ul
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${index * slidePct}%)`,
              }}
            >
              {PRODUCTS.map((product) => (
                <li
                  key={product.id}
                  className="shrink-0 px-2 sm:px-4"
                  style={{ width: `${slidePct}%` }}
                >
                  <article className="flex flex-col items-center text-center">
                    <div className="relative flex h-[400px] w-full max-w-[320px] items-end justify-center overflow-visible sm:h-[480px] sm:max-w-[380px] lg:h-[520px] lg:max-w-[400px]">
                      <div
                        className="relative h-full w-full origin-bottom"
                        style={{ transform: `scale(${product.scale})` }}
                      >
                        <Image
                          src={product.image}
                          alt={`F Net ${product.label} — ${product.name}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 90vw, 400px"
                          className="object-contain object-bottom"
                        />
                      </div>
                    </div>

                    <p className="mt-5 text-lg font-bold tracking-[0.08em] text-[#0056D2] sm:text-xl">
                      {product.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{product.name}</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2.5 sm:mt-10">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`size-2.5 rounded-full transition-colors ${
                  i === index
                    ? "bg-[#0A1931]"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-3 sm:hidden">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous products"
              className="inline-flex size-10 items-center justify-center border border-slate-300 bg-white text-[#0A1931]"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next products"
              className="inline-flex size-10 items-center justify-center border border-slate-300 bg-white text-[#0A1931]"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
