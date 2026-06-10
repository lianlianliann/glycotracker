interface TickSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  step?: number;
  numTicks?: number;
  accentColor?: string;
}

export function TickSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  numTicks = 10,
  accentColor = "#3D6B4F",
}: TickSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor }}
      />
      <div className="flex justify-between mt-1.5 px-[1px]">
        {Array.from({ length: numTicks + 1 }, (_, i) => {
          const tickPct = (i / numTicks) * 100;
          const filled = tickPct <= pct;
          return (
            <div
              key={i}
              style={{
                width: 2,
                height: 5,
                borderRadius: 1,
                backgroundColor: filled ? accentColor : "#C8C3BC",
                opacity: filled ? 0.9 : 0.38,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
