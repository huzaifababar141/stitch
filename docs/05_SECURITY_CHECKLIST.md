# 🔐 Security Checklist & Implementation Guide
## Centralized Custom Tailoring Platform
### Zero-Compromise Security — Built-In, Not Bolted-On

---

## PRIORITY LEVELS
- 🔴 **CRITICAL** — Must be done before first line of feature code
- 🟠 **HIGH** — Must be done before beta/staging
- 🟡 **MEDIUM** — Must be done before public launch
- 🟢 **LOW** — Can be done in first month post-launch

---

## SECTION 1: INFRASTRUCTURE SECURITY

### 1.1 Cloudflare Setup (Free) 🔴
- [ ] Domain routed through Cloudflare (not direct-to-server)
- [ ] SSL/TLS mode set to "Full (Strict)"
- [ ] HTTPS redirect enforced (HTTP → HTTPS automatic)
- [ ] HSTS enabled (max-age: 31536000, includeSubDomains)
- [ ] Bot Fight Mode enabled
- [ ] Security level set to "Medium" or "High"
- [ ] Rate limiting rules set:
  - [ ] `/api/auth/*`: max 10 req/min per IP
  - [ ] `/api/payments/*/webhook`: IP allowlist only
- [ ] WAF managed rules enabled
- [ ] DDoS protection enabled (default in free tier)

### 1.2 Environment Variables 🔴
- [ ] `.env` file in `.gitignore` (verified with `git check-ignore -v .env`)
- [ ] `.env.example` committed (with dummy values, no real secrets)
- [ ] All secrets set in Railway/Vercel dashboard, NOT in code
- [ ] Secret rotation process documented
- [ ] Never use `console.log(process.env)` in any environment

```
Required env variables (minimum):
DATABASE_URL            — Neon PostgreSQL connection string
REDIS_URL               — Upstash Redis URL
JWT_ACCESS_SECRET       — 64+ char random string
JWT_REFRESH_SECRET      — Different 64+ char random string
PADDLE_API_KEY          — Paddle API key
PADDLE_WEBHOOK_SECRET   — Paddle webhook signature secret
JAZZCASH_MERCHANT_ID    — JazzCash credentials
JAZZCASH_PASSWORD       — JazzCash credentials
JAZZCASH_INTEGRITY_SALT — JazzCash HMAC salt
CLOUDINARY_API_KEY      — Cloudinary credentials
CLOUDINARY_API_SECRET   — Cloudinary credentials
OPENAI_API_KEY          — OpenAI key
TCS_API_KEY             — TCS Express API key
WHATSAPP_API_TOKEN      — Meta WhatsApp Cloud API
RESEND_API_KEY          — Resend email API
```

---

## SECTION 2: AUTHENTICATION SECURITY

### 2.1 Password Policy 🔴
```typescript
// bcrypt configuration
const BCRYPT_ROUNDS = 12; // Never less than 10

// Password requirements (if password auth enabled)
const passwordSchema = z.string()
  .min(8, 'Minimum 8 characters')
  .max(128, 'Maximum 128 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[0-9]/, 'At least one number');

// NEVER store plain text passwords
// NEVER use MD5 or SHA1 for passwords
// NEVER compare passwords without timing-safe comparison
```

### 2.2 JWT Implementation 🔴
```typescript
// Access Token — short-lived, stateless
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!; // 64+ chars
const ACCESS_TOKEN_EXPIRY = '15m'; // Never more than 30 minutes

// Refresh Token — longer-lived, stored in DB as hash
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!; // Different secret
const REFRESH_TOKEN_EXPIRY = '7d';

// Token payload — minimum necessary, no sensitive data
interface AccessTokenPayload {
  sub: string;      // user UUID
  role: UserRole;   // for RBAC
  jti: string;      // unique token ID (for blacklisting if needed)
  iat: number;
  exp: number;
}

// NEVER put: email, phone, password_hash, or PII in JWT payload
// ALWAYS verify signature on every request
// ALWAYS check exp on every request (JWT library handles this)
```

### 2.3 Cookie Security 🔴
```typescript
// Refresh tokens stored in cookies, NOT localStorage
res.cookie('refreshToken', token, {
  httpOnly: true,      // JS cannot access — prevents XSS token theft
  secure: true,        // HTTPS only — never HTTP
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/api/auth',   // Only sent to auth routes
});
// Access tokens returned in response body, stored in memory (not localStorage)
```

### 2.4 OTP Security 🔴
```typescript
// OTP generation — cryptographically secure
import { randomInt } from 'crypto';
const otp = randomInt(100000, 999999).toString();

// Store HASH of OTP, never the raw OTP
const otpHash = await bcrypt.hash(otp, 10);

// OTP expiry: 5 minutes max
// Max attempts: 3 (lock after 3 wrong attempts)
// Rate limit: 1 OTP per phone per 60 seconds
// Invalidate: mark is_used=true immediately after successful verify
```

### 2.5 Account Lockout 🔴
```typescript
// After 5 failed login attempts:
// Lock account for 15 minutes
// After 10 failed attempts: Lock for 1 hour
// Alert admin after 20 failed attempts on same account
// Reset counter on successful login
```

### 2.6 Refresh Token Rotation 🔴
```typescript
// On every refresh token use:
// 1. Validate old refresh token (check hash in DB)
// 2. Issue new access token + new refresh token
// 3. Invalidate old refresh token (delete from DB)
// 4. If old refresh token is already invalidated → SECURITY ALERT
//    (Possible token theft — invalidate ALL tokens for this user's family)
```

---

## SECTION 3: AUTHORIZATION (RBAC)

### 3.1 Role Permission Matrix 🔴

| Endpoint | customer | tailor | qc_inspector | delivery_agent | admin | super_admin |
|----------|----------|--------|--------------|----------------|-------|-------------|
| GET /orders (own) | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| POST /orders | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| GET /admin/orders | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| PATCH /admin/orders/:id/assign | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| GET /tailor/orders | ❌ | ✅ (own) | ❌ | ❌ | ✅ | ✅ |
| POST /qc/:id/inspect | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| PATCH /delivery/:id/status | ❌ | ❌ | ❌ | ✅ (own) | ✅ | ✅ |
| GET /admin/analytics | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| DELETE any resource | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3.2 RBAC Middleware Implementation 🔴
```typescript
// middleware/rbac.middleware.ts
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        ip: req.ip
      });
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage on routes:
router.get('/admin/orders', 
  authenticate,                      // Verify JWT
  requireRole('admin', 'super_admin'), // Check role
  ordersController.listAll
);
```

### 3.3 Resource Ownership Checks 🔴
```typescript
// ALWAYS verify that the authenticated user owns the resource
// NEVER trust user-provided IDs without ownership verification

// BAD — allows any customer to see any order
app.get('/orders/:id', authenticate, async (req, res) => {
  const order = await getOrder(req.params.id);  // ❌ No ownership check
  return res.json(order);
});

// GOOD
app.get('/orders/:id', authenticate, async (req, res) => {
  const order = await getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  // Ownership check: customers can only see their own orders
  if (req.user.role === 'customer' && order.customerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return res.json(order);
});
```

---

## SECTION 4: INPUT VALIDATION & SANITIZATION

### 4.1 Zod Validation Middleware 🔴
```typescript
// EVERY route must have input validation before controller logic
// validate.middleware.ts
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: result.error.flatten()
        }
      });
    }
    // Replace req.body/query/params with validated+typed data
    req.validated = result.data;
    next();
  };
};
```

### 4.2 Critical Validations 🔴
```typescript
// Phone validation (Pakistani format)
const phoneSchema = z.string()
  .regex(/^\+92[0-9]{10}$/, 'Invalid Pakistani phone number');

// UUID validation (prevents injection via route params)
const uuidSchema = z.string().uuid();

// Money validation (prevent decimal attacks)
const amountSchema = z.number().positive().multipleOf(0.01).max(1000000);

// Measurement validation (prevent obviously wrong data)
const measurementValue = z.number().positive().min(10).max(200); // 10cm to 200cm

// URL validation for link parser (prevent SSRF)
const productUrlSchema = z.string().url().refine(
  (url) => ALLOWED_DOMAINS.some(domain => new URL(url).hostname.endsWith(domain)),
  'URL not from an allowed domain'
);

const ALLOWED_DOMAINS = [
  'khaadi.com', 'gul-ahmed.com', 'alkaram.com', 
  'limelight.pk', 'sapphireonline.pk', 'sanasamia.com'
];
```

### 4.3 Output Sanitization 🔴
```typescript
// NEVER return sensitive fields in API responses
// Use DTO (Data Transfer Object) pattern

// BAD — returns password hash!
app.get('/users/profile', async (req, res) => {
  const user = await db.users.findOne(req.user.id);
  return res.json(user);  // ❌ Includes password_hash, failed_login_count, etc.
});

// GOOD — pick only safe fields
const toUserDTO = (user: User): UserDTO => ({
  id: user.id,
  email: user.email,
  phone: user.phone,   // Consider masking: +92*******801
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  profileImageUrl: user.profileImageUrl,
  createdAt: user.createdAt,
  // NEVER include: passwordHash, failedLoginCount, lockedUntil, ipAddress, etc.
});
```

---

## SECTION 5: RATE LIMITING

### 5.1 Redis-Backed Rate Limiter 🔴
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const createLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, error: { code: 'RATE_LIMITED', message } },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({ client: redisClient }),
    keyGenerator: (req) => req.ip + (req.user?.id || ''),
  });

// Apply per route:
router.post('/auth/send-otp',     createLimiter(10 * 60 * 1000, 5,   'Too many OTP requests'));
router.post('/auth/verify-otp',   createLimiter(10 * 60 * 1000, 10,  'Too many OTP attempts'));
router.post('/auth/login',        createLimiter(15 * 60 * 1000, 10,  'Too many login attempts'));
router.use('/api',                createLimiter(60 * 1000,       100, 'Too many requests'));
router.use('/admin',              createLimiter(60 * 1000,       200, 'Too many admin requests'));
```

---

## SECTION 6: PAYMENT SECURITY

### 6.1 Paddle Webhook Verification 🔴
```typescript
// payments/paddle.service.ts
import Paddle from '@paddle/paddle-node-sdk';

const paddle = new Paddle(process.env.PADDLE_API_KEY!);

export const verifyPaddleWebhook = (req: Request): boolean => {
  // MUST use raw body — after JSON.parse(), signature verification fails
  const signature = req.headers['paddle-signature'] as string;
  if (!signature) return false;
  
  try {
    return paddle.webhooks.isSignatureValid({
      rawBody: req.rawBody,  // Requires raw body middleware
      headers: { 'paddle-signature': signature },
      secretKey: process.env.PADDLE_WEBHOOK_SECRET!,
    });
  } catch {
    return false;
  }
};

// Webhook endpoint
router.post('/payments/paddle/webhook',
  rawBodyMiddleware,   // Must parse raw body before JSON
  async (req, res) => {
    if (!verifyPaddleWebhook(req)) {
      logger.error('Invalid Paddle webhook signature', { ip: req.ip });
      return res.status(401).send();  // Don't reveal why
    }
    // Process webhook...
  }
);
```

### 6.2 Amount Verification 🔴
```typescript
// ALWAYS verify amounts server-side
// NEVER trust client-sent amounts

// BAD — client can send total: 0
app.post('/orders', async (req, res) => {
  const { productId, amount } = req.body;  // ❌ Client-controlled amount
  await processPayment(amount);
});

// GOOD — calculate server-side
app.post('/orders', authenticate, async (req, res) => {
  const { productId, styleConfigId, deliveryAddressId } = req.validated.body;
  // Calculate total server-side (stitching fee + delivery + addons - discount)
  const calculatedTotal = await orderService.calculateTotal({
    garmentType, deliveryCity, couponCode
  });
  // Use calculatedTotal, NEVER client amount
  await paymentService.initiate(orderId, calculatedTotal);
});
```

### 6.3 Idempotency 🔴
```typescript
// Prevent double payments
// Client sends idempotency key; server deduplicates

app.post('/payments/initiate', async (req, res) => {
  const idempotencyKey = req.headers['x-idempotency-key'];
  if (!idempotencyKey) return res.status(400).json({ error: 'Missing idempotency key' });
  
  // Check if this exact request was already processed
  const existing = await db.payments.findOne({ idempotencyKey });
  if (existing) return res.json({ data: existing }); // Return cached result
  
  // Process payment and store idempotency key
  const payment = await processPayment({ ..., idempotencyKey });
  return res.json({ data: payment });
});
```

---

## SECTION 7: FILE UPLOAD SECURITY

### 7.1 File Upload Validation 🔴
```typescript
// NEVER trust client-provided MIME types or file extensions
import fileType from 'file-type';

const validateUpload = async (buffer: Buffer): Promise<boolean> => {
  const type = await fileType.fromBuffer(buffer);
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return type !== undefined && allowedTypes.includes(type.mime);
};

// Limits
const uploadLimits = {
  fileSize: 5 * 1024 * 1024, // 5MB max
  files: 5,                   // Max 5 files per request
};

// Use signed Cloudinary uploads (never direct)
// The client signs the upload on the backend, then uploads directly to Cloudinary
// This means image data NEVER passes through our server
```

---

## SECTION 8: SSRF PREVENTION (Product Link Parser)

### 8.1 Link Parser Security 🟠
```typescript
// CRITICAL: The product link parser feature is an SSRF risk
// If not properly controlled, attackers can make your server
// fetch internal URLs (like Redis, database, cloud metadata)

const ALLOWED_DOMAINS = new Set([
  'khaadi.com', 'gul-ahmed.com', 'alkaram.com',
  'limelight.pk', 'sapphireonline.pk', 'sanasamia.com',
  'generation.com.pk', 'elan.com.pk'
]);

const parseProductLink = async (url: string) => {
  // 1. Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new ValidationError('Invalid URL');
  }
  
  // 2. Only allow HTTPS
  if (parsedUrl.protocol !== 'https:') {
    throw new ValidationError('Only HTTPS URLs allowed');
  }
  
  // 3. Allowlist check
  if (!ALLOWED_DOMAINS.has(parsedUrl.hostname.replace('www.', ''))) {
    throw new ValidationError('Domain not supported');
  }
  
  // 4. Prevent IP addresses (cloud metadata bypass)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(parsedUrl.hostname)) {
    throw new ValidationError('IP addresses not allowed');
  }
  
  // 5. Fetch with strict timeout and size limit
  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),  // 5 second timeout
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TailoringPlatform/1.0)' },
    redirect: 'follow',
    size: 1024 * 1024, // 1MB max response size
  });
  
  // Continue parsing...
};
```

---

## SECTION 9: SECURITY HEADERS

### 9.1 Helmet.js Configuration 🔴
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.paddle.com", "js.paddle.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "res.cloudinary.com", "*.cloudinary.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      connectSrc: ["'self'", "api.paddle.com", "*.anthropic.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

---

## SECTION 10: SECURITY TESTING

### 10.1 Security Test Suite 🟠
```bash
# Run these before every production deploy:

# 1. Dependency audit
npm audit --audit-level=high

# 2. OWASP Dependency Check
npx owasp-dependency-check --project tailoring-platform --scan ./

# 3. Secret scanning (ensure no API keys in code)
npx gitleaks detect --source .

# 4. Static analysis
npx semgrep --config=p/nodejs-security .

# 5. Auth security tests (from route-validator.ts)
npm run test:security
```

### 10.2 Security Test Cases 🟠
```typescript
// These MUST pass before launch:
// AUTH-01: OTP endpoint rate limits after 5 requests
// AUTH-02: Wrong OTP rejected (3 attempts max)
// AUTH-03: Expired OTP rejected
// AUTH-04: JWT with wrong signature rejected (401)
// AUTH-05: Expired JWT rejected (401)
// AUTH-06: Customer cannot access /admin/* (403)
// AUTH-07: Tailor cannot access other tailor's orders (403)
// PAY-01:  Paddle webhook with wrong signature rejected (401)
// PAY-02:  Client-modified amount rejected (400)
// PAY-03:  Duplicate payment idempotency key returns cached result
// UPLOAD-01: Non-image file rejected
// UPLOAD-02: File > 5MB rejected
// INPUT-01: SQL injection attempt returns 422, not 500
// INPUT-02: XSS payload in name field stored escaped
// SSRF-01: Internal IP URL rejected by link parser
// SSRF-02: Non-allowlisted domain rejected by link parser
```

---

## SECTION 11: PRODUCTION LAUNCH SECURITY CHECKLIST

### Before First User Signs Up 🔴
- [ ] All environment variables verified in production
- [ ] Cloudflare proxying all traffic
- [ ] HTTPS enforced, HSTS header present
- [ ] Security headers verified with https://securityheaders.com
- [ ] Rate limiting tested and verified working
- [ ] All auth tests passing in CI
- [ ] No secrets in git history (`git log -p | grep -i "api_key\|secret\|password"`)
- [ ] Database has no default/weak passwords
- [ ] Admin accounts created with strong passwords + 2FA
- [ ] Webhook endpoints verified with signature checking
- [ ] Error messages don't expose internal details (stack traces, DB errors)
- [ ] `/health` endpoint returns status without revealing system info
- [ ] Admin panel on separate subdomain (`admin.stitchly.pk`) with IP restriction

### After Launch — Month 1 🟡
- [ ] Security monitoring alerts configured
- [ ] Failed auth attempts dashboard reviewed weekly
- [ ] npm audit run weekly (automate in CI)
- [ ] Penetration test scheduled (ethical hacker review)
- [ ] Bug bounty program considered
- [ ] GDPR/PDPA compliance review (data retention policies)

---

*Security Checklist Version: 1.0 | Review quarterly or after any major feature addition*
