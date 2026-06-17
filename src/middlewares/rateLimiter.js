const rateStore = new Map();

const LIMITS = {
  'POST:/ai/regenerate': { max: 10, window: 3600000 },
  'POST:/ai/regenerate-company': { max: 5, window: 3600000 },
  'POST:/project/add': { max: 100, window: 3600000 },
  'POST:/project/copy': { max: 50, window: 3600000 },
  'POST:/project-plans/add': { max: 200, window: 3600000 },
  'POST:/project-actual/add': { max: 200, window: 3600000 },
};

function getRateLimitKey(userId, method, path) {
  const endpoint = `${method}:${path}`;
  return `rate:${userId}:${endpoint}`;
}

function checkRateLimit(userId, method, path) {
  const config = LIMITS[`${method}:${path}`];
  if (!config) return { allowed: true };

  const key = getRateLimitKey(userId, method, path);
  const now = Date.now();
  const record = rateStore.get(key) || { count: 0, resetAt: now + config.window };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + config.window;
  }

  if (record.count >= config.max) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      limit: config.max,
      remaining: 0,
    };
  }

  record.count++;
  rateStore.set(key, record);

  return {
    allowed: true,
    limit: config.max,
    remaining: config.max - record.count,
    resetAt: record.resetAt,
  };
}

const rateLimiter = (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) return next();

  const method = req.method;
  const path = req.route?.path || req.path;
  const fullPath = `${req.baseUrl || ''}${path}`.replace(/\/$/, '');

  const result = checkRateLimit(userId, method, fullPath);

  res.setHeader('X-RateLimit-Limit', result.limit || 0);
  res.setHeader('X-RateLimit-Remaining', result.remaining || 0);
  if (result.resetAt) {
    res.setHeader('X-RateLimit-Reset', Math.floor(result.resetAt / 1000));
  }

  if (!result.allowed) {
    res.setHeader('Retry-After', result.retryAfter);
    return res.status(429).json({
      message: 'Too many requests',
      retryAfter: result.retryAfter,
    });
  }

  next();
};

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateStore.entries()) {
    if (now > record.resetAt + 3600000) {
      rateStore.delete(key);
    }
  }
}, 3600000);

module.exports = { rateLimiter };
