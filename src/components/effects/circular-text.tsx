import { useId } from "react";

/*
  CircularText — texto corriendo sobre un círculo (SVG textPath).
  La rotación vive en CSS (.orbit-svg + keyframe orbit-spin), así el
  componente queda estático bajo reduced-motion sin JS extra.
  Decorativo: siempre aria-hidden.
*/

type CircularTextProps = {
  text: string;
  className?: string;
};

export function CircularText({ text, className }: CircularTextProps) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 200 200"
      className={`orbit-svg ${className ?? ""}`}
      aria-hidden="true"
    >
      <defs>
        <path
          id={id}
          d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0"
        />
      </defs>
      <text>
        <textPath href={`#${id}`}>{text}</textPath>
      </text>
    </svg>
  );
}
