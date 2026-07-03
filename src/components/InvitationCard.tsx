import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  Calendar, 
  Heart, 
  Send, 
  Users, 
  Lock, 
  Plus,
  Minus,
  UserCheck,
  Sparkles
} from "lucide-react";
import { WeddingConfig } from "../types";
import CountdownTimer from "./CountdownTimer";

// Elegant reusable Vector Olive Branch
const OliveBranch = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 120" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Stem */}
    <path d="M10,110 Q40,60 85,15" />
    {/* Leaves */}
    <path d="M22,95 Q10,85 20,75 Q32,85 22,95" fill="currentColor" fillOpacity="0.2" />
    <path d="M30,85 Q40,70 48,80 Q38,95 30,85" fill="currentColor" fillOpacity="0.2" />
    <path d="M40,72 Q28,62 38,52 Q50,62 40,72" fill="currentColor" fillOpacity="0.2" />
    <path d="M50,60 Q62,48 68,58 Q56,70 50,60" fill="currentColor" fillOpacity="0.2" />
    <path d="M58,48 Q46,38 56,28 Q68,38 58,48" fill="currentColor" fillOpacity="0.2" />
    <path d="M68,36 Q80,24 86,34 Q74,46 68,36" fill="currentColor" fillOpacity="0.2" />
    <path d="M78,24 Q66,14 74,6 Q86,14 78,24" fill="currentColor" fillOpacity="0.2" />
    {/* Olives */}
    <circle cx="28" cy="74" r="3.5" fill="currentColor" stroke="none" />
    <circle cx="52" cy="50" r="3.5" fill="currentColor" stroke="none" />
    <circle cx="68" cy="28" r="3.5" fill="currentColor" stroke="none" />
  </svg>
);

// Elegant reusable baby's breath (gypsophila/nubes de bebé) branch for decoration
const BabysBreath = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 120 120" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.1" 
    strokeLinecap="round" 
    className={className}
  >
    {/* Delicate main stem */}
    <path d="M60,110 C58,80 70,50 85,25" />
    <path d="M59,95 C45,85 40,70 30,58" />
    <path d="M63,78 C75,68 85,58 92,42" />
    <path d="M43,76 C35,66 25,62 18,48" />
    
    {/* Soft thin branches for flowers */}
    <path d="M30,58 C22,55 24,45 20,38" />
    <path d="M30,58 C35,50 42,48 40,38" />
    <path d="M85,25 C82,18 75,15 78,8" />
    <path d="M85,25 C92,20 95,12 102,8" />
    <path d="M92,42 C98,38 95,30 102,24" />
    <path d="M92,42 C88,34 82,30 84,20" />
    
    {/* Cloud-like soft baby's breath little flowers filled with soft warm white */}
    <circle cx="20" cy="38" r="3" fill="#fafaf6" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="16" cy="48" r="2.5" fill="#fafaf6" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="40" cy="38" r="3" fill="#fafaf6" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="78" cy="8" r="3.5" fill="#fafaf6" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="102" cy="8" r="3" fill="#fafaf6" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="102" cy="24" r="3" fill="#fafaf6" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="84" cy="20" r="2.5" fill="#fafaf6" stroke="currentColor" strokeWidth="0.8" />
    
    <circle cx="34" cy="46" r="2" fill="#fafaf6" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="88" cy="14" r="2" fill="#fafaf6" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="96" cy="32" r="2.5" fill="#fafaf6" stroke="currentColor" strokeWidth="0.8" />
  </svg>
);

// Elegant interlocking wedding rings icon
const LinkedRings = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 60" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className={className}
  >
    {/* Left Ring (with a diamond on top) */}
    <circle cx="38" cy="35" r="18" />
    {/* Diamond on top of the left ring */}
    <path d="M38,11 L43,17 L38,21 L33,17 Z" fill="currentColor" stroke="none" />
    <path d="M38,11 L43,17 L38,21 L33,17 Z" stroke="currentColor" strokeWidth="1" />
    
    {/* Right Ring linked/overlapping */}
    <circle cx="62" cy="35" r="18" />
  </svg>
);

interface InvitationCardProps {
  config: WeddingConfig;
  onOpenAdmin: () => void;
}

export default function InvitationCard({ config, onOpenAdmin }: InvitationCardProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [guestCount, setGuestCount] = useState(2);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Synchronize with the main background music player state
  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isPlaying: boolean }>;
      if (customEvent.detail) {
        setIsPlayingMusic(customEvent.detail.isPlaying);
      }
    };
    window.addEventListener("wedding-music-state", handleStateChange as EventListener);
    return () => {
      window.removeEventListener("wedding-music-state", handleStateChange as EventListener);
    };
  }, []);

  const handleToggleMusic = () => {
    window.dispatchEvent(new CustomEvent("toggle-wedding-music"));
  };

  // Format the date beautifully for display
  const formatWeddingDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      };
      const formattedDate = dateObj.toLocaleDateString("es-ES", options);
      const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      
      return {
        fullDate: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1),
        time: formattedTime,
        dayNum: dateObj.getDate(),
        monthStr: dateObj.toLocaleDateString("es-ES", { month: "long" }).toUpperCase(),
        shortMonthStr: dateObj.toLocaleDateString("es-ES", { month: "short" }).toUpperCase().replace(".", ""),
        yearNum: dateObj.getFullYear(),
        dayName: dateObj.toLocaleDateString("es-ES", { weekday: "long" }).toUpperCase()
      };
    } catch (e) {
      return {
        fullDate: "Sábado, 17 de Octubre de 2026",
        time: "6:00 PM",
        dayNum: 17,
        monthStr: "OCTUBRE",
        shortMonthStr: "OCT",
        yearNum: 2026,
        dayName: "SÁBADO"
      };
    }
  };

  const dateDetails = formatWeddingDate(config.date);

  const incrementGuests = () => {
    setGuestCount(prev => Math.min(prev + 1, 8));
  };

  const decrementGuests = () => {
    setGuestCount(prev => Math.max(prev - 1, 1));
  };

  const handleRSVP = () => {
    // Construct the WhatsApp URL
    const sanitizedPhone = config.whatsappNumber.replace(/[^+\d]/g, "");
    
    // Customize message with guest count & white heart emoji 🤍
    const placesText = guestCount === 1 ? "1 persona" : `${guestCount} personas`;
    const customizedMessage = `${config.whatsappMessage}\n\n🤍 Cantidad de asistentes: ${placesText}.`;
    
    const encodedMsg = encodeURIComponent(customizedMessage);
    const whatsappUrl = `https://wa.me/${sanitizedPhone}?text=${encodedMsg}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenMaps = () => {
    window.open(config.googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div 
      id="invitation-scroll-container" 
      className={`min-h-screen relative overflow-x-hidden font-sans select-none flex flex-col items-center justify-start transition-colors duration-1000 ${
        isOpened ? "bg-cream-50 text-sage-900" : "bg-cream-100 text-sage-900"
      }`}
    >
      
      {/* Absolute Admin Padlock Button in corner */}
      <button
        id="btn-admin-access"
        onClick={onOpenAdmin}
        className={`absolute top-4 right-4 z-40 w-9 h-9 rounded-full flex items-center justify-center transition-all focus:outline-none backdrop-blur-xs shadow-sm cursor-pointer ${
          isOpened 
            ? "bg-white/10 hover:bg-white/20 border border-white/20 text-cream-100" 
            : "bg-white/40 hover:bg-white/80 border border-sage-200/50 text-sage-600"
        }`}
        title="Acceso Administrador"
      >
        <Lock size={15} />
      </button>

      <AnimatePresence mode="wait">
        {!isOpened ? (
          /* SECTION 1: ELEGANT CLOSED ENVELOPE WITH REALISTIC OLIVE COLOR AND BRANCHES */
          <motion.div
            key="envelope-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -80, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="w-full max-w-md min-h-screen flex flex-col justify-between items-center px-6 py-12 text-center bg-cream-50 relative overflow-hidden"
          >
            {/* Elegant Olive Branches background watermarks */}
            <div className="absolute top-0 left-0 w-48 h-48 text-sage-500/15 pointer-events-none transform -scale-x-100 rotate-[30deg]">
              <OliveBranch className="w-full h-full" />
            </div>
            <div className="absolute bottom-0 right-0 w-48 h-48 text-sage-500/15 pointer-events-none transform -scale-y-100 -rotate-[30deg]">
              <OliveBranch className="w-full h-full" />
            </div>
            <div className="absolute top-1/2 left-4 w-32 h-32 text-sage-500/10 pointer-events-none -translate-y-1/2 rotate-12">
              <OliveBranch className="w-full h-full" />
            </div>
            <div className="absolute top-1/2 right-4 w-32 h-32 text-sage-500/10 pointer-events-none -translate-y-1/2 -rotate-12 transform -scale-x-100">
              <OliveBranch className="w-full h-full" />
            </div>

            {/* Header Title with pristine spacing */}
            <div className="space-y-2.5 z-10 pt-6">
              <span className="font-serif text-[11px] tracking-[0.35em] text-amber-600 uppercase font-bold">NUESTRA BODA</span>
              <h2 className="font-script text-[3.8rem] text-sage-800 leading-none mt-2 select-text">
                {config.names}
              </h2>
              <div className="flex items-center justify-center gap-2 py-1">
                <span className="h-[1px] w-8 bg-amber-300/60"></span>
                <Heart size={14} className="text-amber-500 fill-amber-500" />
                <span className="h-[1px] w-8 bg-amber-300/60"></span>
              </div>
              <p className="font-serif text-xs tracking-[0.15em] text-sage-600 uppercase">
                {dateDetails.dayNum} DE {dateDetails.monthStr} DE {dateDetails.yearNum}
              </p>
            </div>

            {/* Realistic Wedding Envelope Interactive Graphic */}
            <div className="w-full max-w-xs my-6 relative z-10 flex flex-col items-center">
              
              {/* Envelope Body Wrapper - Olive Green (#5f6d4b) as requested */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                onClick={() => {
                  setIsOpened(true);
                  // Dispatch programmatic play event to play background music on user action
                  window.dispatchEvent(new Event("play-wedding-music"));
                }}
                className="w-68 h-46 bg-sage-600 border-2 border-sage-700/80 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] relative flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all"
              >
                {/* Visual lighting gradients resembling texture and paper fibers */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/20" />
                
                {/* Envelope Flap triangular simulated lines - highly detailed realistic model */}
                <svg className="absolute top-0 left-0 w-full h-full text-sage-700/80 pointer-events-none" viewBox="0 0 272 184" fill="none">
                  {/* Flap outline shadow */}
                  <path d="M0,0 L136,102 L272,0" stroke="#2c3422" strokeWidth="2" opacity="0.4" />
                  <path d="M0,0 L136,100 L272,0" stroke="#ccd2bd" strokeWidth="1.5" opacity="0.25" />
                  {/* Side folds */}
                  <path d="M0,184 L100,115" stroke="#2c3422" strokeWidth="1.5" opacity="0.4" />
                  <path d="M272,184 L172,115" stroke="#2c3422" strokeWidth="1.5" opacity="0.4" />
                </svg>

                {/* Highly polished golden wax seal button - textured gold wax stamp */}
                <motion.div 
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.3)] relative z-20 border border-amber-300/40 group-hover:from-amber-100 group-hover:to-amber-600 select-none"
                >
                  {/* Outer organic ridge ring */}
                  <div className="absolute inset-0.5 rounded-full border border-amber-100/20 bg-gradient-to-tl from-transparent to-amber-300/25" />
                  <div className="w-13 h-13 border-2 border-amber-300/50 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-800 shadow-inner">
                    <Heart size={20} className="text-amber-100 fill-amber-100/90 filter drop-shadow" />
                  </div>
                </motion.div>
                
                {/* Floating shine reflex effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-50 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shine" />
              </motion.div>

              <span className="font-serif text-[10px] tracking-[0.25em] text-amber-600 uppercase mt-5 block animate-bounce font-bold">
                HACER CLICK PARA ABRIR LA INVITACIÓN
              </span>
            </div>

            {/* Symmetrical Olive Branch ornament above footer */}
            <div className="flex justify-center text-amber-500/40 py-2">
              <OliveBranch className="w-14 h-14" />
            </div>

            {/* Subtle disclaimer footer */}
            <div className="pt-2">
              <p className="font-serif text-[9px] text-sage-400 tracking-widest uppercase">
                HECHO CON AMOR • 2026
              </p>
            </div>
          </motion.div>
        ) : (
          /* SECTION 2: ELEGANT IMMERSIVE OLIVE GREEN INVITATION */
          <motion.div
            key="invitation-main-content"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md flex flex-col items-center justify-start pb-20 relative"
          >
            {/* Elegant Olive Branches background watermarks for internal screen */}
            <div className="absolute top-12 left-2 w-48 h-48 text-sage-600/20 pointer-events-none transform -scale-x-100 rotate-12">
              <OliveBranch className="w-full h-full" />
            </div>
            <div className="absolute top-1/2 right-2 w-48 h-48 text-sage-600/20 pointer-events-none rotate-45">
              <OliveBranch className="w-full h-full" />
            </div>
            <div className="absolute bottom-1/4 left-2 w-48 h-48 text-sage-600/20 pointer-events-none transform -scale-y-100 -rotate-12">
              <OliveBranch className="w-full h-full" />
            </div>

            {/* PHOTO 1: Cover Banner / Couple Image Hero - Horizontal block header format as requested */}
            <div 
              id="hero-banner"
              className="w-full relative h-[25vh] overflow-hidden shadow-lg border-b-4 border-amber-400/30 rounded-b-[40px]"
            >
              <img 
                src={config.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200"}
                alt="Wedding Cover"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover brightness-[0.8]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end items-center p-4 text-center text-white">
                <span className="font-serif text-[10px] tracking-[0.35em] text-cream-100 uppercase font-light">NUESTRA BODA</span>
                <h1 className="font-script text-[3rem] sm:text-[3.5rem] text-cream-50 leading-none select-text">
                  {config.names}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-1 mb-1.5">
                  <span className="h-[1px] w-6 bg-cream-200"></span>
                  <Heart className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span className="h-[1px] w-6 bg-cream-200"></span>
                </div>
              </div>
            </div>

            {/* Elegant Main Content Cards interspersed with beautiful large photos */}
            <div id="invitation-main-card" className="w-full px-4 -mt-2 z-10 relative space-y-6">
              
              {/* CARD A: Welcome & Event Intro - Premium Olive Green cardstock */}
              <div className="bg-sage-500 border border-sage-400/50 rounded-3xl p-6 shadow-xl text-center space-y-6">
                
                {/* Botanical branch decorative divider */}
                <div className="flex justify-center text-amber-300 py-1">
                  <OliveBranch className="w-14 h-14 hover:scale-110 transition-transform duration-300" />
                </div>

                <div className="space-y-2">
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-amber-300 font-bold">
                    ¡Nos casamos!
                  </p>
                  <p className="font-serif text-[14.5px] text-white leading-relaxed max-w-xs mx-auto italic select-text">
                    "{config.eventDetails || "Nos complace anunciar nuestro matrimonio y queremos compartir contigo este momento."}"
                  </p>
                </div>
              </div>

              {/* CARD AA: Elegant Custom Text Card (Replaces the Music Player Card) */}
              {config.middleText && (
                <div className="bg-sage-500 border border-sage-400/50 rounded-3xl p-6 shadow-xl text-center space-y-4">
                  <div className="flex justify-center text-amber-300">
                    <Heart className="w-5 h-5 text-amber-300 fill-amber-300/10 animate-pulse" />
                  </div>
                  <p className="font-serif text-[14.5px] text-white leading-relaxed max-w-xs mx-auto italic select-text">
                    "{config.middleText}"
                  </p>
                  <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent mx-auto"></div>
                </div>
              )}

              {/* PHOTO 2: Beautiful Large Gallery Intercalated Image */}
              {config.image2 && (
                <div className="w-full h-auto overflow-hidden rounded-3xl shadow-xl border-2 border-white/20 transition-all hover:shadow-2xl">
                  <img 
                    src={config.image2} 
                    alt="Boda Galería 2" 
                    referrerPolicy="no-referrer"
                    className="w-full h-auto block rounded-3xl hover:scale-[1.01] transition-transform duration-500" 
                  />
                </div>
              )}

              {/* CARD B: Parents Section (Separate Groom and Bride Parents with gorgeous layout) */}
              <div className="bg-sage-500 border border-sage-400/50 rounded-3xl p-6 shadow-xl text-center space-y-5 relative overflow-hidden">
                {config.parentsIntro && (
                  <div className="space-y-3">
                    <p className="font-serif text-sm italic text-white leading-relaxed px-2 select-text">
                      "{config.parentsIntro}"
                    </p>
                    <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent mx-auto"></div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-amber-300">
                  <Users size={16} className="text-amber-300" />
                  <span className="font-serif text-[10px] tracking-wider uppercase font-bold text-amber-300">NUESTROS PADRES</span>
                </div>
                
                <div className="grid grid-cols-1 gap-4 text-center">
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/15">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-amber-300 font-bold block mb-1">Padres del Novio</span>
                    <p className="font-serif text-[14.5px] text-white font-bold select-text">
                      {config.groomParents || "Obdulio Camargo y Lucía de Camargo"}
                    </p>
                  </div>

                  <div className="p-4 bg-white/10 rounded-2xl border border-white/15">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-amber-300 font-bold block mb-1">Padres de la Novia</span>
                    <p className="font-serif text-[14.5px] text-white font-bold select-text">
                      {config.brideParents || "Padres de la Novia"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD C1: Elegant Date & Countdown Section exactly matching the model */}
              <div className="bg-sage-500 border border-sage-400/50 rounded-3xl p-6 shadow-xl text-center space-y-6 relative overflow-hidden">
                {/* Model-matched Date Display Widget */}
                <div className="py-2 select-text max-w-sm mx-auto">
                  {/* Top: Month name in spaced elegant letters */}
                  <div className="text-center mb-1">
                    <span className="font-serif text-xs sm:text-sm tracking-[0.25em] text-amber-300 font-extrabold">
                      {dateDetails.monthStr}
                    </span>
                  </div>

                  {/* Middle: Horizontal Layout exactly like the model */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 my-1">
                    {/* Left: Day Name between horizontal lines */}
                    <div className="flex-1 border-y border-amber-300/30 py-2 text-center min-w-[85px]">
                      <span className="font-serif text-[10px] sm:text-xs tracking-[0.15em] text-amber-200 font-bold">
                        {dateDetails.dayName}
                      </span>
                    </div>

                    {/* Center: Large elegant Cormorant Garamond cursive/italic number */}
                    <div className="px-1 shrink-0 flex items-center justify-center h-16">
                      <span className="font-cormorant italic text-6xl sm:text-7xl text-amber-300 font-bold leading-none select-text">
                        {dateDetails.dayNum}
                      </span>
                    </div>

                    {/* Right: Year between horizontal lines */}
                    <div className="flex-1 border-y border-amber-300/30 py-2 text-center min-w-[85px]">
                      <span className="font-serif text-[10px] sm:text-xs tracking-[0.15em] text-amber-200 font-bold">
                        {dateDetails.yearNum}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Countdown Timer inside Date card */}
                <div className="pt-2 border-t border-white/10">
                  <CountdownTimer targetDate={config.date} />
                </div>
              </div>

              {/* PHOTO 3: Third Large Gallery Intercalated Image (Placed between Date and Lugar) */}
              {config.image3 && (
                <div className="w-full h-auto overflow-hidden rounded-3xl shadow-xl border-2 border-white/20 transition-all hover:shadow-2xl">
                  <img 
                    src={config.image3} 
                    alt="Boda Galería 3" 
                    referrerPolicy="no-referrer"
                    className="w-full h-auto block rounded-3xl hover:scale-[1.01] transition-transform duration-500" 
                  />
                </div>
              )}

              {/* CARD C: Model-matched Venue / Lugar Section */}
              <div className="bg-sage-500 border border-sage-400/50 rounded-3xl p-6 shadow-xl text-center space-y-4 relative overflow-hidden">
                {/* 1. Interlocking Gold Rings Icon */}
                <div className="flex justify-center text-amber-300 py-1">
                  <LinkedRings className="w-16 h-10" />
                </div>

                {/* 2. Script word: "Lugar" */}
                <h2 className="font-script text-amber-200 text-[2.8rem] leading-none">
                  Lugar
                </h2>

                {/* 3, 4 & 5. Time and Place Name exactly matching the model */}
                <div className="space-y-1 select-text">
                  <p className="font-serif text-white text-base sm:text-lg tracking-widest font-bold uppercase leading-snug">
                    {config.placeName || "Hacienda El Establo"}
                  </p>
                  <p className="font-serif text-[11px] italic text-cream-200/90 max-w-xs mx-auto mb-1">
                    {dateDetails.fullDate}
                  </p>
                  <p className="font-serif text-xs text-amber-300 tracking-[0.15em] uppercase font-bold pt-1 border-t border-white/10 max-w-[200px] mx-auto">
                    Hora de la ceremonia: {dateDetails.time}
                  </p>
                </div>

                {/* 6. Pill-shaped Map Button styled in white contrast */}
                <div className="pt-2 flex justify-center">
                  <button
                    id="btn-google-maps"
                    onClick={handleOpenMaps}
                    className="w-auto bg-white hover:bg-cream-50 text-sage-700 border-none rounded-full font-sans font-semibold py-2.5 px-8 text-xs flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none cursor-pointer tracking-wider uppercase"
                  >
                    <MapPin size={13} className="text-sage-600" />
                    Ver ubicación
                  </button>
                </div>
              </div>

              {/* PHOTO 4: Fourth Large Gallery Intercalated Image */}
              {config.image4 && (
                <div className="w-full h-auto overflow-hidden rounded-3xl shadow-xl border-2 border-white/20 transition-all hover:shadow-2xl">
                  <img 
                    src={config.image4} 
                    alt="Boda Galería 4" 
                    referrerPolicy="no-referrer"
                    className="w-full h-auto block rounded-3xl hover:scale-[1.01] transition-transform duration-500" 
                  />
                </div>
              )}

              {/* CARD E: Attendance Reservation Details */}
              <div className="bg-sage-500 border border-sage-400/50 rounded-3xl p-6 shadow-xl text-center space-y-4">
                <div className="flex items-center justify-center gap-1.5 text-amber-300">
                  <UserCheck size={16} />
                  <span className="font-serif text-[10px] tracking-wider uppercase font-bold">Tus Lugares Reservados</span>
                </div>
                
                <p className="text-xs text-white leading-relaxed max-w-xs mx-auto">
                  ¿Cuántas personas confirmarán asistencia de tu grupo familiar?
                </p>

                <div className="flex items-center justify-center gap-4 py-1">
                  <button
                    type="button"
                    onClick={decrementGuests}
                    className="w-9 h-9 rounded-full bg-white hover:bg-cream-50 border-none flex items-center justify-center text-sage-600 transition-colors focus:outline-none cursor-pointer shadow-sm"
                  >
                    <Minus size={14} />
                  </button>
                  
                  <div className="min-w-16">
                    <span className="font-sans text-2xl font-bold text-white block leading-tight">
                      {guestCount}
                    </span>
                    <span className="text-[10px] text-amber-300 uppercase tracking-widest block font-bold">
                      {guestCount === 1 ? "PERSONA" : "PERSONAS"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={incrementGuests}
                    className="w-9 h-9 rounded-full bg-white hover:bg-cream-50 border-none flex items-center justify-center text-sage-600 transition-colors focus:outline-none cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <p className="text-[9px] text-cream-200/80 italic">
                  Puedes modificar este número haciendo clic en los botones de restar y sumar.
                </p>
              </div>

              {/* CARD F: RSVP Action Details Card - Highlights Deep Sage Green button against Light Sage card */}
              <div className="bg-sage-500 border border-sage-400/50 rounded-3xl p-6 shadow-xl text-center space-y-5">
                <div className="space-y-1">
                  <span className="font-serif text-[10px] tracking-[0.25em] text-amber-300 uppercase font-bold">CONFIRMACIÓN</span>
                  <p className="font-sans text-xs text-white leading-relaxed max-w-xs mx-auto">
                    Por favor confirma tu asistencia antes del 3 de noviembre. ¡Será un honor contar con tu presencia!
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-confirm-attendance"
                    onClick={handleRSVP}
                    className="w-full bg-[#3e4a3d] hover:bg-[#2c332a] text-cream-50 rounded-full font-bold py-4 px-6 text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-xl focus:outline-none hover:scale-[1.01] cursor-pointer tracking-wider uppercase"
                  >
                    <Send size={15} className="fill-current" />
                    Confirmar Asistencia vía WhatsApp
                  </button>
                  
                  <p className="text-[9.5px] text-cream-200/90 mt-3 select-text">
                    Enviaremos confirmación para <strong className="text-white font-bold">{guestCount} {guestCount === 1 ? "persona" : "personas"}</strong> al teléfono {config.whatsappNumber}
                  </p>
                </div>
              </div>

              {/* Secondary Botanical Footer Info */}
              <div className="text-center mt-8 space-y-1 pb-4">
                <div className="flex justify-center text-amber-500 gap-1.5">
                  <Heart size={12} className="fill-current" />
                  <Heart size={12} className="fill-current animate-ping absolute" />
                  <Sparkles size={12} />
                </div>
                <h3 className="font-serif text-sm tracking-widest text-amber-600 uppercase pt-2 font-extrabold">
                  {config.names}
                </h3>
                <p className="font-serif text-sm sm:text-base text-sage-700 font-medium italic leading-relaxed px-4 pt-2">
                  Te esperamos con gran alegría en nuestro gran día.
                </p>
              </div>

            </div>

            {/* Bottom Screen botanical decorative leaves */}
            <div className="absolute bottom-0 left-0 w-24 h-24 text-sage-500/10 pointer-events-none transform rotate-90">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                <path d="M10,90 Q40,40 90,10 Q60,60 10,90" />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 text-sage-500/10 pointer-events-none transform rotate-180">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                <path d="M10,90 Q40,40 90,10 Q60,60 10,90" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
