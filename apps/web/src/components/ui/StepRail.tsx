import type { ReactNode } from "react";

export function StepRail({
  current,
  steps,
}: {
  current: number;
  steps: string[];
}): ReactNode {
  return (
    <ol className="step-rail">
      {steps.map((label, index) => {
        const state = index < current ? "is-done" : index === current ? "is-now" : "is-next";
        return (
          <li key={label} className={`step-rail-item ${state}`}>
            <span className="step-rail-index">{String(index + 1).padStart(2, "0")}</span>
            <span>{label}</span>
            {index < steps.length - 1 ? <span className="step-rail-rule" aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}
