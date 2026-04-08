export default function AxisArrows() {
  return (
    <>
      {/* "긴급" label above horizontal arrow */}
      <div className="text-center mb-[2px]">
        <span className="text-[9px] font-semibold text-quadrant-do-primary tracking-[2px]">
          긴급
        </span>
      </div>

      {/* Horizontal arrow ← : right(thin/transparent) → left(thick/opaque) */}
      <div className="h-[14px] mb-1">
        <svg className="w-full h-full" viewBox="0 0 270 14" preserveAspectRatio="none">
          <defs>
            <linearGradient id="hArrow" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffb3ad" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#ffb3ad" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffb3ad" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <polygon points="270,6.5 18,4.5 18,9.5 270,7.5" fill="url(#hArrow)" />
          <polygon points="20,1 4,7 20,13" fill="#ffb3ad" fillOpacity="0.6" />
        </svg>
      </div>
    </>
  );
}

export function VerticalArrow() {
  return (
    <div className="flex items-stretch mr-1">
      {/* "중요" vertical text, LEFT of arrow, reading top-to-bottom */}
      <div className="flex items-center mr-[3px]">
        <span
          className="text-[9px] font-semibold text-quadrant-plan-primary tracking-[2px]"
          style={{ writingMode: "vertical-lr" }}
        >
          중요
        </span>
      </div>

      {/* Vertical arrow ↑ : bottom(thin/transparent) → top(thick/opaque) */}
      <div className="w-[14px]">
        <svg className="w-full h-full" viewBox="0 0 14 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="vArrow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#adc6ff" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#adc6ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#adc6ff" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <polygon points="6.5,200 4.5,18 9.5,18 7.5,200" fill="url(#vArrow)" />
          <polygon points="1,20 7,4 13,20" fill="#adc6ff" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
