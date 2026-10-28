import type { HTMLAttributes } from "react";

type MoggersArtworkProps = HTMLAttributes<HTMLSpanElement>;

/** A 50/50 side-by-side preview of the original Lite cover and Ultimate art. */
export default function MoggersArtwork({
  className = "",
  ...props
}: MoggersArtworkProps) {
  return (
    <span
      className={`moggers-artwork ${className}`.trim()}
      role="img"
      aria-label="Subway Moggers Lite e Ultimate"
      {...props}
    >
      <img src="/map-icons/moggers.png" alt="" />
      <img src="/moggers/IMAGEMOG.png" alt="" />
    </span>
  );
}
