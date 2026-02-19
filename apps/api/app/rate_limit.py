"""Simple in-memory rate limiter for anonymous endpoints."""

import time
from collections import defaultdict
from fastapi import HTTPException, Request, status


class RateLimiter:
    """IP-based sliding window rate limiter."""

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _cleanup(self, ip: str, now: float):
        cutoff = now - self.window_seconds
        self._requests[ip] = [t for t in self._requests[ip] if t > cutoff]

    async def __call__(self, request: Request):
        ip = self._get_client_ip(request)
        now = time.time()
        self._cleanup(ip, now)

        if len(self._requests[ip]) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Limit: {self.max_requests} per {self.window_seconds}s",
            )

        self._requests[ip].append(now)


# Pre-configured instances
anon_save_limiter = RateLimiter(max_requests=5, window_seconds=60)
anon_read_limiter = RateLimiter(max_requests=30, window_seconds=60)
count_limiter = RateLimiter(max_requests=60, window_seconds=60)
