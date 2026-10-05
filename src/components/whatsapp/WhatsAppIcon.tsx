// WhatsApp glyph (speech bubble with handset). Decorative: pair it with visible text or an aria-label.
export default function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="currentColor">
      <path d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 6.9L3 29l6.5-2a13.2 13.2 0 0 0 6.5 1.7c7.2 0 13-5.7 13-12.8S23.2 3 16 3Zm0 23.4c-2.1 0-4.1-.6-5.8-1.6l-.4-.2-3.9 1.2 1.2-3.7-.3-.4a10.4 10.4 0 0 1-1.7-5.8C5.1 10 10 5.3 16 5.3S26.9 10 26.9 15.8 22 26.4 16 26.4Zm6-7.8c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2l-1 1.3c-.2.2-.4.2-.7.1a8.6 8.6 0 0 1-4.3-3.7c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-1-2.5c-.3-.6-.5-.6-.8-.6h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.1-1.2 2.7s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.8 5 2.2.9 3 1 4.1.8.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.4Z" />
    </svg>
  );
}
