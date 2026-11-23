import Image from "next/image";

export function HeroArtwork({ imageUrl }: { imageUrl?: string }) {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="art-topline"><span>ARAS / MATERIAL STUDY</span><span>01 — 04</span></div>
      <div className="art-glow" />
      {imageUrl && <Image className="art-photo" src={imageUrl} alt="" fill sizes="(max-width: 760px) 95vw, 50vw" priority unoptimized />}
      {!imageUrl && <svg className="art-scene" viewBox="0 0 610 540" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tube" x1="130" y1="330" x2="500" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="#C7E2EA"/><stop offset=".48" stopColor="#F8FBFC"/><stop offset="1" stopColor="#99C5D2"/></linearGradient>
          <linearGradient id="blue" x1="340" y1="110" x2="420" y2="410" gradientUnits="userSpaceOnUse"><stop stopColor="#75B5C8"/><stop offset="1" stopColor="#235876"/></linearGradient>
          <linearGradient id="ground" x1="106" y1="376" x2="536" y2="428" gradientUnits="userSpaceOnUse"><stop stopColor="#123149"/><stop offset="1" stopColor="#0A2134"/></linearGradient>
          <filter id="shadow" x="35" y="75" width="540" height="440" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="18"/></filter>
        </defs>
        <ellipse cx="318" cy="418" rx="220" ry="40" fill="#021525" fillOpacity=".45" filter="url(#shadow)" />
        <path d="M103 352L322 224L518 328L295 461L103 352Z" fill="url(#ground)" stroke="#578196" strokeOpacity=".4" />
        <path d="M120 348L322 231L498 329L296 448L120 348Z" stroke="#8AA9B4" strokeOpacity=".24" />
        <path d="M165 352L324 259L455 332L296 424L165 352Z" fill="#17374B" stroke="#A6C2CB" strokeOpacity=".26" />
        <path d="M188 340L188 240C188 228 194 217 205 211L346 129C357 123 371 123 382 129L444 165C455 171 462 182 462 194L462 295L307 386L188 318" fill="url(#tube)" stroke="#EAF7F9" strokeWidth="2" />
        <path d="M188 240L307 309L462 218" stroke="#6D9DAD" strokeWidth="2" />
        <path d="M307 309L307 386" stroke="#7CA6B3" strokeWidth="2" />
        <path d="M205 211L359 300L444 251" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="3" />
        <path d="M205 211L346 129C357 123 371 123 382 129L444 165C455 171 462 182 462 194L307 284L188 215" fill="url(#blue)" stroke="#D3E9EE" strokeWidth="2" />
        <path d="M212 210L356 128" stroke="#E7F5F7" strokeOpacity=".9" strokeWidth="4" strokeLinecap="round" />
        <path d="M235 224L357 153" stroke="#DBEEF1" strokeOpacity=".45" strokeWidth="1.5" />
        <path d="M381 286V199C381 190 386 181 394 176L432 154" stroke="#EAF7F9" strokeOpacity=".62" strokeWidth="2" />
        <path d="M153 296L183 279L211 295L180 313L153 296Z" fill="#7BB3C3" stroke="#D9EEF1" strokeOpacity=".6" />
        <path d="M153 296V324L180 340V313" fill="#326B82" stroke="#D9EEF1" strokeOpacity=".45" />
        <path d="M180 313L211 295V322L180 340" fill="#214C65" stroke="#D9EEF1" strokeOpacity=".45" />
        <circle cx="490" cy="128" r="38" fill="#D6EDF0" fillOpacity=".1" stroke="#D6EDF0" strokeOpacity=".34" />
        <circle cx="490" cy="128" r="22" stroke="#D6EDF0" strokeOpacity=".42" />
        <circle cx="490" cy="128" r="5" fill="#7BC0CF" />
        <path d="M474 128H506M490 112V144" stroke="#D6EDF0" strokeOpacity=".5" />
        <path d="M94 161L135 137" stroke="#B7D9E0" strokeOpacity=".48" />
        <circle cx="90" cy="163" r="3" fill="#8BC7D1" />
        <path d="M471 389L515 363" stroke="#B7D9E0" strokeOpacity=".48" />
        <circle cx="519" cy="361" r="3" fill="#8BC7D1" />
      </svg>}
      <div className="art-caption"><span className="caption-dot" /><span>DESIGNED FOR WHAT&apos;S NEXT</span><span className="caption-line" /></div>
      <div className="art-index">A—01</div>
    </div>
  );
}
