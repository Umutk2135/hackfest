/**
 * OWNER: P1 (Frontend)
 * Simple podium / lectern mark for Kürsü wordmark.
 */
export function PodiumMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M4 20h16v2H4v-2zm2-2h12l-1-8H7l-1 8zm3-10h6l1-4H8l1 4z"
        fill="currentColor"
      />
      <rect x="10" y="4" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
