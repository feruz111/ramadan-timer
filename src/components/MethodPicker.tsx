import { CALC_METHODS } from "../services/aladhanApi";
import type { CalcMethod } from "../types";

interface Props {
  value: CalcMethod;
  onChange: (method: CalcMethod) => void;
}

export function MethodPicker({ value, onChange }: Props) {
  return (
    <select
      className="max-w-80 cursor-pointer rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 font-mono text-xs text-neutral-600 outline-none transition-colors focus:border-gold focus:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:focus:text-neutral-300"
      value={value.id}
      onChange={(e) => {
        const found = CALC_METHODS.find((m) => m.id === e.target.value);
        if (found) onChange(found);
      }}
    >
      {CALC_METHODS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label} — {m.region}
        </option>
      ))}
    </select>
  );
}
