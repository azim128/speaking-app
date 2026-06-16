type ClassValue = string | number | boolean | undefined | null

/** Merge Tailwind class strings, filtering out falsy values */
function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ')
}

/** Format a Date or ISO string into a human-readable date */
function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/** Promisified setTimeout — useful for artificial delays in dev/tests */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { cn, formatDate, sleep }
