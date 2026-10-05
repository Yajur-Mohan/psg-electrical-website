import { whatsappLink } from "@/lib/site";
import WhatsAppIcon from "./WhatsAppIcon";

// Inline WhatsApp call-to-action with a pre-filled message.
// "solid" for banners, "link" for small text links on cards and posts.
export default function WhatsAppButton({
  message,
  label = "WhatsApp us",
  variant = "solid",
  className = "",
}: {
  message: string;
  label?: string;
  variant?: "solid" | "link";
  className?: string;
}) {
  const styles =
    variant === "solid"
      ? "min-h-11 gap-2 rounded bg-[#25d366] px-5 font-extrabold text-[#06301a] hover:bg-[#3be07a]"
      : "min-h-11 gap-1.5 text-sm font-bold text-[#4be38a] underline-offset-4 hover:underline";
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center ${styles} ${className}`}
    >
      <WhatsAppIcon className={variant === "solid" ? "size-5" : "size-4"} />
      {label}
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}
