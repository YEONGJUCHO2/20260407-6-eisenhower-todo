"use client";

interface TagChipProps {
  name: string;
  color: string;
  size?: "sm" | "md";
  onRemove?: () => void;
}

export default function TagChip({
  name,
  color,
  size = "sm",
  onRemove,
}: TagChipProps) {
  const sizeClasses =
    size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-medium leading-none ${sizeClasses}`}
      style={{
        borderWidth: 1,
        borderColor: color + "40",
        backgroundColor: color + "15",
        color: color,
      }}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity duration-150 leading-none"
          style={{ color }}
          aria-label={`${name} 태그 제거`}
        >
          &times;
        </button>
      )}
    </span>
  );
}
