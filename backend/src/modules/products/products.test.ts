import { linkParserService } from './link-parser.service';
import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../config/database', () => ({
  db: {
    product: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

describe('Products Module — Link Parser Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SSRF & URL Validation Tests', () => {
    it('should reject non-HTTPS URLs', () => {
      expect(() =>
        linkParserService.validateUrl('http://khaadi.com/product/123')
      ).toThrow('Only HTTPS URLs are allowed');
    });

    it('should reject IP address hostnames for SSRF protection', () => {
      expect(() =>
        linkParserService.validateUrl('https://127.0.0.1/admin')
      ).toThrow('IP addresses and localhost URLs are forbidden');
    });

    it('should reject path traversal in URLs', () => {
      expect(() =>
        linkParserService.validateUrl('https://khaadi.com/../etc/passwd')
      ).toThrow('Invalid URL path traversal detected');
    });

    it('should reject domains not in allowed whitelist', () => {
      expect(() =>
        linkParserService.validateUrl('https://malicious-site.com/product')
      ).toThrow('Domain \'malicious-site.com\' is not supported');
    });

    it('should accept valid whitelisted domain HTTPS URL', () => {
      const validUrl = 'https://www.khaadi.com/pk/unstitched-3pc-suit.html';
      const parsed = linkParserService.validateUrl(validUrl);
      expect(parsed.hostname).toBe('www.khaadi.com');
    });
  });

  describe('Product Link Parsing & Caching', () => {
    it('should return cached product if normalizedUrl already exists in DB', async () => {
      const mockCachedProduct = {
        id: 'p-100',
        name: 'Cached Unstitched Suit',
        brand: 'Khaadi',
        sourceUrl: 'https://khaadi.com/product-1',
        normalizedUrl: 'https://khaadi.com/product-1',
      };

      (db.product.findFirst as jest.Mock).mockResolvedValue(mockCachedProduct);

      const result = await linkParserService.parseProductLink('https://khaadi.com/product-1');

      expect(result).toEqual(mockCachedProduct);
      expect(db.product.findFirst).toHaveBeenCalled();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should fetch HTML, parse metadata via Cheerio, and save new Product to DB', async () => {
      (db.product.findFirst as jest.Mock).mockResolvedValue(null);

      const mockHtml = `
        <! elimination>
        <html>
          <head>
            <meta property="og:title" content="Khaadi Printed Lawn 3PC" />
            <meta property="og:description" content="3 Piece Unstitched Printed Lawn Suit" />
            <meta property="og:image" content="https://khaadi.com/images/suit1.jpg" />
            <meta property="og:price:amount" content="4990" />
          </head>
          <body>
            <h1>Khaadi Printed Lawn 3PC</h1>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({ data: mockHtml, status: 200 });

      const mockSavedProduct = {
        id: 'p-200',
        name: 'Khaadi Printed Lawn 3PC',
        brand: 'Khaadi',
        normalizedUrl: 'https://khaadi.com/product-new',
        images: ['https://khaadi.com/images/suit1.jpg'],
      };

      (db.product.create as jest.Mock).mockResolvedValue(mockSavedProduct);

      const result = await linkParserService.parseProductLink(
        'https://khaadi.com/product-new?utm_source=facebook'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://khaadi.com/product-new?utm_source=facebook',
        expect.objectContaining({ timeout: 5000 })
      );
      expect(db.product.create).toHaveBeenCalled();
      expect(result.name).toBe('Khaadi Printed Lawn 3PC');
    });
  });
});
