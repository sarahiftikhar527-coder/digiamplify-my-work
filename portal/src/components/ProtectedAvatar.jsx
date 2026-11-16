import { useEffect, useState } from "react";
import useProtectedImage from "@/hooks/useProtectedImage";

const getInitials = (name) =>
  String(name || "User")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * Avatar that can show login-protected profile photos.
 * A normal <img src="..."> cannot send the auth token, so the photo is
 * fetched with the token (useProtectedImage) and shown from a blob URL.
 * Falls back to the user's initials when there is no photo or it fails.
 */
export default function ProtectedAvatar({
  src,
  name = "User",
  className = "h-9 w-9",
  textClassName = "text-xs",
  fallbackClassName = "bg-[#C0111F]",
}) {
  const { src: resolvedSrc } = useProtectedImage(src);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [resolvedSrc]);

  if (resolvedSrc && !imgError) {
    return (
      <img
        src={resolvedSrc}
        alt={`${name} profile`}
        onError={() => setImgError(true)}
        className={`${className} shrink-0 rounded-full border border-white/15 object-cover`}
      />
    );
  }

  return (
    <span
      className={`${className} ${fallbackClassName} ${textClassName} flex shrink-0 items-center justify-center rounded-full border border-white/15 font-semibold text-white`}
    >
      {getInitials(name)}
    </span>
  );
}