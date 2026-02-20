import { padTwo } from "../utils/time";

interface Props {
  hours: number;
  minutes: number;
  seconds: number;
  label: string;
  progress: number | null;
}

export function Countdown({ hours, minutes, seconds, label, progress }: Props) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-[0.1em] text-[clamp(3rem,12vw,7rem)] font-bold tracking-wider text-neutral-900 tabular-nums dark:text-white">
        <span className="inline-block min-w-[2ch]">{padTwo(hours)}</span>
        <span className="text-gold animate-blink">:</span>
        <span className="inline-block min-w-[2ch]">{padTwo(minutes)}</span>
        <span className="text-gold animate-blink">:</span>
        <span className="inline-block min-w-[2ch]">{padTwo(seconds)}</span>
      </div>
      {progress !== null && (
        <div className="mx-auto mt-6 w-[min(80vw,28rem)]">
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-1000 ease-linear"
              style={{ width: `${(progress * 100).toFixed(1)}%` }}
            />
          </div>
          <p className="mt-2 text-sm tabular-nums text-neutral-500">
            {(progress * 100).toFixed(1)}%
          </p>
        </div>
      )}
      <p className="mt-3 text-[clamp(1rem,3vw,1.4rem)] uppercase tracking-[0.15em] text-gold">
        {label}
      </p>
    </div>
  );
}
