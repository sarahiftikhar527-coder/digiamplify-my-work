export default function Avatar({ src, size = 24 }) {
  return src ? (
    <img src={src} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />
  ) : (
    <span style={{ width: size, height: size }} className="inline-block shrink-0 rounded-full bg-gray-300" />
  );
}