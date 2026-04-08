interface AppLogoProps {
  size?: "sm" | "lg";
}

const SIZES = {
  sm: { box: 8, gap: 1.5, radius: 2.5 },
  lg: { box: 24, gap: 3, radius: 5 },
};

const COLORS = [
  "rgba(255,84,81,0.25)",
  "rgba(5,102,217,0.25)",
  "rgba(202,129,0,0.25)",
  "rgba(66,71,84,0.25)",
];

export default function AppLogo({ size = "sm" }: AppLogoProps) {
  const s = SIZES[size];
  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: "1fr 1fr",
        gap: `${s.gap}px`,
      }}
    >
      {COLORS.map((color, i) => (
        <div
          key={i}
          style={{
            width: `${s.box}px`,
            height: `${s.box}px`,
            borderRadius: `${s.radius}px`,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
}
