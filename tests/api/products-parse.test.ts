import { POST } from '@/app/api/products/parse/route';
import { getAuthUser } from '@/lib/utils/auth';
import {
  extractProductDetails,
  parseProductLink,
} from '@/lib/services/link-parser.service';
import { AppError } from '@/lib/utils/errors';

jest.mock('@/lib/utils/auth', () => ({
  getAuthUser: jest.fn(),
}));

jest.mock('@/lib/services/link-parser.service', () => ({
  extractProductDetails: jest.fn(),
  parseProductLink: jest.fn(),
}));

function createMockRequest(
  body: any,
  options: { isMalformedJson?: boolean } = {}
) {
  return {
    json: options.isMalformedJson
      ? () => Promise.reject(new SyntaxError('Unexpected token in JSON'))
      : () => Promise.resolve(body),
  } as any;
}

describe('Adversarial API Test Suite: /api/products/parse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // 1. Invalid Requests & Zero 500 Crashes (Clean 400 Status Codes)
  // ==========================================================================
  describe('1. Invalid Requests (Clean 400 Bad Request & Zero 500s)', () => {
    it('returns 400 on malformed/invalid JSON syntax', async () => {
      const req = createMockRequest(null, { isMalformedJson: true });
      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('BAD_REQUEST');
      expect(json.message).toContain('Invalid JSON body provided');
    });

    it('returns 400 when body is empty JSON object ({})', async () => {
      const req = createMockRequest({});
      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('BAD_REQUEST');
      expect(res.status).not.toBe(500);
    });

    it('returns 400 when body is null or primitive types', async () => {
      for (const invalidBody of [null, 'raw-string', 12345, true, []]) {
        const req = createMockRequest(invalidBody);
        const res = await POST(req);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('BAD_REQUEST');
      }
    });

    it('returns 400 when URL field is missing or empty string', async () => {
      for (const emptyUrl of ['', '   ']) {
        const req = createMockRequest({ url: emptyUrl });
        const res = await POST(req);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('BAD_REQUEST');
      }
    });

    it('returns 400 when URL is a non-string type', async () => {
      for (const badType of [12345, true, {}, []]) {
        const req = createMockRequest({ url: badType });
        const res = await POST(req);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('BAD_REQUEST');
      }
    });

    it('returns 400 when URL is malformed or invalid syntax', async () => {
      const malformedUrls = [
        'not-a-valid-url',
        'http://',
        'https://',
        'httpp://example.com',
        '://missing-protocol.com',
        'www.sapphireonline.pk', // missing protocol
      ];

      for (const url of malformedUrls) {
        const req = createMockRequest({ url });
        const res = await POST(req);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('BAD_REQUEST');
        expect(res.status).not.toBe(500);
      }
    });

    it('returns 400 when protocol is not HTTP or HTTPS (e.g. ftp, javascript, file)', async () => {
      const forbiddenProtocols = [
        'ftp://ftp.example.com/item.json',
        'javascript:alert(1)',
        'file:///C:/Windows/System32/drivers/etc/hosts',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'mailto:support@sapphire.pk',
      ];

      for (const url of forbiddenProtocols) {
        const req = createMockRequest({ url });
        const res = await POST(req);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('BAD_REQUEST');
        expect(res.status).not.toBe(500);
      }
    });

    it('ensures zero 500 errors when extraction throws an unhandled error', async () => {
      (getAuthUser as jest.Mock).mockResolvedValue(null);
      (extractProductDetails as jest.Mock).mockRejectedValue(
        new Error('Unexpected network socket hang up')
      );

      const req = createMockRequest({
        url: 'https://pk.sapphireonline.pk/products/broken-link',
      });
      const res = await POST(req);

      // Must catch gracefully and return 400, NEVER 500
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('BAD_REQUEST');
      expect(json.message).toContain('Unexpected network socket hang up');
    });

    it('returns custom AppError status code if AppError is thrown with <500', async () => {
      (getAuthUser as jest.Mock).mockResolvedValue(null);
      (extractProductDetails as jest.Mock).mockRejectedValue(
        new AppError('Product not found on external store', 404, 'NOT_FOUND')
      );

      const req = createMockRequest({
        url: 'https://pk.sapphireonline.pk/products/404-item',
      });
      const res = await POST(req);
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });

  // ==========================================================================
  // 2. Guest / Unauthenticated Requests & Full Product Schema
  // ==========================================================================
  describe('2. Guest / Unauthenticated Flow & Full Schema Compliance', () => {
    it('executes in-memory extraction for guest users without calling database', async () => {
      (getAuthUser as jest.Mock).mockResolvedValue(null);

      const mockProduct = {
        title: "Men's Embroidered Cotton Kurta",
        name: "Men's Embroidered Cotton Kurta",
        brand: 'Sapphire',
        priceOriginal: 4990,
        currencyOriginal: 'PKR',
        description: 'Premium embroidered cotton stitched kurta for men.',
        images: [
          'https://cdn.shopify.com/s/files/1/sapphire-kurta-front.jpg',
          'https://cdn.shopify.com/s/files/1/sapphire-kurta-back.jpg',
        ],
        gender: 'male' as const,
        garmentType: 'kurta' as const,
        fabricMaterial: 'Cotton',
        fallbackTier: 1,
        confidenceScore: 0.98,
        requiresManualPrice: false,
      };

      (extractProductDetails as jest.Mock).mockResolvedValue(mockProduct);

      const req = createMockRequest({
        url: 'https://pk.sapphireonline.pk/products/men-embroidered-cotton-kurta',
      });
      const res = await POST(req);

      expect(res.status).toBe(200);

      // Verify parseProductLink (DB persistence) was NOT called
      expect(parseProductLink).not.toHaveBeenCalled();
      expect(extractProductDetails).toHaveBeenCalledWith(
        'https://pk.sapphireonline.pk/products/men-embroidered-cotton-kurta'
      );

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toBe('Product parsed successfully');

      // Verify Complete Standardized Schema
      const { data } = json;
      expect(data.name).toBe("Men's Embroidered Cotton Kurta");
      expect(data.title).toBe("Men's Embroidered Cotton Kurta");
      expect(data.brand).toBe('Sapphire');
      expect(data.priceOriginal).toBe(4990);
      expect(typeof data.priceOriginal).toBe('number');
      expect(data.currencyOriginal).toBe('PKR');
      expect(data.description).toBe(
        'Premium embroidered cotton stitched kurta for men.'
      );
      expect(data.images).toHaveLength(2);
      expect(data.images[0]).toBe(
        'https://cdn.shopify.com/s/files/1/sapphire-kurta-front.jpg'
      );
      expect(data.gender).toBe('male');
      expect(data.garmentType).toBe('kurta');
      expect(data.fabricMaterial).toBe('Cotton');
      expect(data.fallbackTier).toBe(1);
      expect(data.confidenceScore).toBe(0.98);
      expect(data.requiresManualPrice).toBe(false);
      // No DB id for unauthenticated guest
      expect(data.id).toBeUndefined();
    });

    it('returns full schema for female 3-piece unstitched lawn product', async () => {
      (getAuthUser as jest.Mock).mockResolvedValue(null);

      const mockProduct = {
        title: 'Mahay Printed Lawn 3-Piece Suit',
        name: 'Mahay Printed Lawn 3-Piece Suit',
        brand: 'Sana Safinaz',
        priceOriginal: 3850,
        currencyOriginal: 'PKR',
        description:
          '3-piece unstitched printed lawn suit with chiffon dupatta.',
        images: ['https://cdn.shopify.com/s/files/1/sana-safinaz-mahay-01.jpg'],
        gender: 'female' as const,
        garmentType: 'full_suit' as const,
        fabricMaterial: 'Lawn',
        fallbackTier: 1,
        confidenceScore: 0.99,
        requiresManualPrice: false,
      };

      (extractProductDetails as jest.Mock).mockResolvedValue(mockProduct);

      const req = createMockRequest({
        url: 'https://sanasafinaz.com/products/mahay-printed-lawn-3-piece',
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const { data } = json;
      expect(data.gender).toBe('female');
      expect(data.garmentType).toBe('full_suit');
      expect(data.priceOriginal).toBe(3850);
      expect(data.currencyOriginal).toBe('PKR');
      expect(data.brand).toBe('Sana Safinaz');
      expect(data.fabricMaterial).toBe('Lawn');
    });

    it('handles products with null price cleanly with requiresManualPrice = true', async () => {
      (getAuthUser as jest.Mock).mockResolvedValue(null);

      const mockProduct = {
        title: 'Designer Exclusive Couture',
        name: 'Designer Exclusive Couture',
        brand: 'Maria.B',
        priceOriginal: null,
        currencyOriginal: 'PKR',
        description: 'Bespoke hand-embellished couture.',
        images: ['https://mariab.pk/images/couture.jpg'],
        gender: 'female' as const,
        garmentType: 'full_suit' as const,
        fallbackTier: 5,
        confidenceScore: 0.7,
        requiresManualPrice: true,
      };

      (extractProductDetails as jest.Mock).mockResolvedValue(mockProduct);

      const req = createMockRequest({
        url: 'https://mariab.pk/products/designer-couture',
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.priceOriginal).toBeNull();
      expect(json.data.requiresManualPrice).toBe(true);
      expect(json.data.currencyOriginal).toBe('PKR');
    });
  });

  // ==========================================================================
  // 3. Authenticated DB Fallback Resilience
  // ==========================================================================
  describe('3. Authenticated User & DB Failure Fallback', () => {
    it('persists to database when user is authenticated', async () => {
      (getAuthUser as jest.Mock).mockResolvedValue({ id: 'user-auth-123' });

      const mockPersisted = {
        id: 'prod-uuid-999',
        title: 'J. Traditional Kameez Shalwar',
        name: 'J. Traditional Kameez Shalwar',
        brand: 'J. (Junaid Jamshed)',
        priceOriginal: 7490,
        currencyOriginal: 'PKR',
        gender: 'male',
        garmentType: 'full_suit',
        images: ['https://junaidjamshed.com/image.jpg'],
        fallbackTier: 1,
        confidenceScore: 0.95,
      };

      (parseProductLink as jest.Mock).mockResolvedValue(mockPersisted);

      const req = createMockRequest({
        url: 'https://junaidjamshed.com/products/kameez-shalwar',
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      expect(parseProductLink).toHaveBeenCalledWith(
        'https://junaidjamshed.com/products/kameez-shalwar',
        'user-auth-123'
      );

      const json = await res.json();
      expect(json.data.id).toBe('prod-uuid-999');
      expect(json.data.gender).toBe('male');
    });

    it('falls back seamlessly to extractProductDetails if database persistence fails', async () => {
      (getAuthUser as jest.Mock).mockResolvedValue({ id: 'user-auth-123' });

      // DB persistence throws error
      (parseProductLink as jest.Mock).mockRejectedValue(
        new Error('Prisma database connection pool exhausted')
      );

      const mockPureExtracted = {
        title: 'J. Traditional Kameez Shalwar',
        name: 'J. Traditional Kameez Shalwar',
        brand: 'J. (Junaid Jamshed)',
        priceOriginal: 7490,
        currencyOriginal: 'PKR',
        gender: 'male',
        garmentType: 'full_suit',
        images: ['https://junaidjamshed.com/image.jpg'],
        fallbackTier: 1,
        confidenceScore: 0.95,
      };

      (extractProductDetails as jest.Mock).mockResolvedValue(mockPureExtracted);

      const req = createMockRequest({
        url: 'https://junaidjamshed.com/products/kameez-shalwar',
      });
      const res = await POST(req);

      // Still returns 200 OK via pure extractor fallback!
      expect(res.status).toBe(200);
      expect(extractProductDetails).toHaveBeenCalledWith(
        'https://junaidjamshed.com/products/kameez-shalwar'
      );

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.priceOriginal).toBe(7490);
      expect(json.data.currencyOriginal).toBe('PKR');
    });
  });
});
