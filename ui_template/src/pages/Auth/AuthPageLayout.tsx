import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { motion, useMotionValue, useTransform } from "framer-motion";

// Import Swiper components and modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper required styles
import "swiper/css";
import "swiper/css/effect-fade";
import { AngleDoubleRightIcon } from "../../icons";

export default function AuthPageLayout({ children }: { children: React.ReactNode }) {
  const [showLogin, setShowLogin] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronized active slider states
  const [desktopSlide, setDesktopSlide] = useState(0);
  const [mobileSlide, setMobileSlide] = useState(0);

  const swiperRef = useRef<SwiperType | null>(null);

  // Drag Slider mechanics
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  
  // Track text opacity fading as user slides (0px to 120px translation)
  const textOpacity = useTransform(dragX, [0, 80], [1, 0]);

  const slides = [
    {
      image: "/images/auth-slideshow/stock-trader-slideshow.jpg",
      title: "Stock Trading",
      description: "Learn how to trade stocks effectively and grow your portfolio.",
    },
    {
      image: "/images/auth-slideshow/retirement-investment-slideshow.jpg",
      title: "Long-Term Investment",
      description: "Plan for retirement and grow your wealth steadily.",
    },
    {
      image: "/images/auth-slideshow/financial-literacy-slideshow.jpg",
      title: "Financial Learning",
      description: "Understand the markets and improve your financial literacy.",
    },
  ];

  // Swiper configuration for Desktop
  const desktopSwiperOptions = {
    modules: [Autoplay, EffectFade],
    effect: "fade" as const,
    fadeEffect: { crossFade: true },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
  };

  // Hard reset drag coordinate to zero whenever view states reset
  useEffect(() => {
    dragX.set(0);
  }, [showLogin, hasSeenOnboarding, dragX]);

  // Check if user has already seen mobile onboarding
  useEffect(() => {
    const seen = localStorage.getItem("mobileOnboardingSeen");
    if (seen === "true") {
      setHasSeenOnboarding(true);
      setShowLogin(true);
    }
    setIsLoading(false); // FIXED: Changed from isLoading(false) to setIsLoading(false)
  }, []);

  // Mobile auto-slide
  useEffect(() => {
    if (showLogin) return; 
    const interval = setInterval(() => {
      setMobileSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showLogin, slides.length]);

  const handleStartJourney = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      localStorage.setItem("mobileOnboardingSeen", "true");
      setHasSeenOnboarding(true);
      setShowLogin(true);
      setIsTransitioning(false);
    }, 400);
  };

  const handleDragEnd = () => {
    const trackWidth = constraintsRef.current?.getBoundingClientRect().width || 0;
    const maxDraggableWidth = trackWidth - 56;
    const currentX = dragX.get();
    
    if (currentX > maxDraggableWidth * 0.75) {
      handleStartJourney();
    } else {
      dragX.set(0);
    }
  };

  if (isLoading) return null;

  return (
    <div className="relative bg-white dark:bg-gray-900">

      {/* ================= MOBILE ONBOARDING ================= */}
      {!showLogin && !hasSeenOnboarding && (
        <div
          className={`
            fixed inset-0 z-40 lg:hidden
            transition-all duration-500 ease-out
            ${isTransitioning ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}
          `}
        >
          <div className="relative w-full h-full overflow-hidden">
            {/* Background Image */}
            <img
              src={slides[mobileSlide].image}
              alt={slides[mobileSlide].title}
              className="absolute inset-0 object-cover w-full h-full transition-all duration-700"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Logo */}
            <div className="absolute top-8 left-6 z-20">
              <Link to="/">
                <img src="/images/logo/auth-logo.svg" alt="Logo" width={180} height={40} />
              </Link>
            </div>

            {/* Top Right Skip Button */}
            <button
              onClick={handleStartJourney}
              className="absolute top-9 right-6 z-20 text-white/60 hover:text-white text-sm font-medium transition-colors tracking-wide px-2 py-1"
            >
              Skip
            </button>

            {/* Slide Content */}
            <div className="relative z-10 flex flex-col justify-end h-full px-6 pb-10 text-white">
              <div className="mb-8">
                <h1 className="mb-4 text-4xl font-bold leading-tight">
                  {slides[mobileSlide].title}
                </h1>
                <p className="text-lg text-white/80">{slides[mobileSlide].description}</p>
              </div>

              {/* Mobile Indicators */}
              <div className="flex gap-2 mb-8 justify-center">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setMobileSlide(index)}
                    aria-label={`Slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      mobileSlide === index ? "w-8 bg-white" : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* White and Blue Fully Rounded Swipe Track Container */}
              <div 
                ref={constraintsRef}
                className="relative w-full h-16 p-1 bg-white border border-gray-200 rounded-full flex items-center justify-start select-none dark:bg-gray-800 dark:border-gray-700 overflow-hidden"
              >
                {/* Track Placeholder Label */}
                <motion.div 
                  style={{ opacity: textOpacity }}
                  className="absolute inset-0 flex items-center justify-center z-0 text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400 pointer-events-none"
                >
                  Swipe to get started
                </motion.div>

                {/* Fully Rounded Blue Sliding Thumb */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: constraintsRef.current?.getBoundingClientRect().width ? constraintsRef.current.getBoundingClientRect().width - 64 : 300 }}
                  dragElastic={{ right: 0.05, left: 0 }}
                  dragMomentum={false}
                  onDragEnd={handleDragEnd}
                  style={{ x: dragX }}
                  className="relative z-10 w-14 h-14 bg-brand-500 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md hover:bg-brand-600 transition-colors"
                >
                  <AngleDoubleRightIcon className="w-6 h-6 text-white pointer-events-none" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN LAYOUT ================= */}
      <div className="relative flex h-screen overflow-hidden">

        {/* LEFT PANEL - Desktop Only UI */}
        <div className="hidden w-1/2 h-full lg:block relative bg-gray-950 select-none">
          
          {/* ── ATMOSPHERIC GRADIENT GLOW OVERLAY ───────────────────────── */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden mix-blend-screen opacity-40">
            {/* Top Right Orb */}
            <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[50%] bg-gradient-to-br from-brand-400 to-indigo-600 rounded-full filter blur-[120px]" />
            {/* Top Left Secondary Orb */}
            <div className="absolute top-[5%] -left-[5%] w-[40%] h-[35%] bg-gradient-to-tr from-cyan-500 to-brand-500 rounded-full filter blur-[90px]" />
          </div>
          {/* ────────────────────────────────────────────────────────────────── */}

          {/* Desktop Logo Placement */}
          <div className="absolute top-12 left-16 z-30 pointer-events-auto">
            <Link to="/">
              <img src="/images/logo/auth-logo.svg" alt="Logo" width={160} height={36} className="drop-shadow-sm" />
            </Link>
          </div>

          {/* Swiper Implementation */}
          <Swiper 
            {...desktopSwiperOptions} 
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={(swiper) => setDesktopSlide(swiper.realIndex)}
            style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
            className="h-full w-full"
          >
            {slides.map((slide, index) => (
              <SwiperSlide 
                key={index} 
                className="relative h-full w-full overflow-hidden"
                style={{ height: '100%' }}
              >
                
                {/* 1. Fixed Image Layer Container */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center pointer-events-none"
                  />
                </div>

                {/* 2. Visual Mask Layer (Linear Gradient) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent z-10" />

                {/* 3. Text Layer */}
                <div className="absolute bottom-1/4 left-16 z-20 text-left max-w-lg pr-8 space-y-3 pointer-events-auto">
                  <h1 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
                    {slide.title}
                  </h1>
                  <p className="text-base text-gray-200/90 font-normal leading-relaxed antialiased">
                    {slide.description}
                  </p>
                </div>

              </SwiperSlide>
            ))}

            {/* Custom Desktop Indicators */}
            <div className="absolute bottom-14 left-16 z-30 flex gap-2 pointer-events-auto">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => swiperRef.current?.slideTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    desktopSlide === index ? "w-8 bg-white" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </Swiper>
        </div>

        {/* RIGHT PANEL - Form */}
        <div
          className={`
            ${showLogin ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            lg:translate-x-0 lg:opacity-100
            flex w-full lg:w-1/2 h-full items-center justify-center p-6 transition-all duration-500 ease-out
            bg-white dark:bg-gray-900
          `}
        >
          {children}
        </div>

        {/* Theme Toggle */}
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}