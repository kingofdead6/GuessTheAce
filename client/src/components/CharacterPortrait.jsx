import { useState } from "react";
import { CHARACTERS } from "../data/characters.js";
import { CHARACTER_IMAGES } from "../data/characterImages.js";

const SIZES = {
  sm: "h-10 w-10 text-lg",
  lg: "h-28 w-28 text-5xl sm:h-36 sm:w-36 sm:text-6xl",
};

const RINGS = {
  win: "ring-2 ring-win",
  miss: "ring-2 ring-miss",
  none: "",
};

export function imageFor(id) {
  const c = CHARACTERS.find((x) => x.id === id);
  return c?.image || CHARACTER_IMAGES[id] || null;
}

const initials = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

// Falls back to the character's initials when there is no image or it fails to load.
export default function CharacterPortrait({ id, name, size = "sm", ring = "none", className = "" }) {
  const src = imageFor(id);
  const [failed, setFailed] = useState(false);
  const series = CHARACTERS.find((x) => x.id === id)?.series;
  const box = `${SIZES[size]} ${RINGS[ring]} shrink-0 overflow-hidden rounded-xl ${className}`;

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`${box} display flex items-center justify-center ${series === "bluelock" ? "bg-rally/30" : "bg-ember/25"}`}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={size === "lg" ? name : ""}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${box} bg-chalk/10 object-cover object-top`}
    />
  );
}
