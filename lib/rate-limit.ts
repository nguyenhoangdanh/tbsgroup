// Simple in-memory rate limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  limit: number = 1,
  windowMs: number = 15000 // 15 seconds
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitMap.delete(identifier);
  }

  const currentEntry = rateLimitMap.get(identifier);

  if (!currentEntry) {
    // First request
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }

  if (currentEntry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: currentEntry.resetTime,
    };
  }

  // Increment count
  currentEntry.count++;
  rateLimitMap.set(identifier, currentEntry);

  return {
    success: true,
    remaining: limit - currentEntry.count,
    resetTime: currentEntry.resetTime,
  };
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  for (const [key, entry] of entries) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute