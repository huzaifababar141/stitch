import { config } from 'dotenv';
config({ path: '.env.local' });
import { prisma } from '../src/lib/prisma';

async function seed() {
  console.log('Seeding demo In-House Stock Articles...');

  // Check if articles already exist
  const count = await prisma.product.count({
    where: { parseSource: 'in_house' },
  });

  if (count > 0) {
    console.log(`Found ${count} existing in-house articles.`);
    return;
  }

  const articles = [
    {
      name: 'Boutique Chiffon Flared Anarkali Maxi',
      brand: 'TailorLink Studio',
      description:
        'Pure Chiffon flared anarkali unstitched 3-piece suit with embroidered flare accents and silk trouser.',
      images: [
        '/images/tailor/garment_w_frockmaxi.png',
        '/images/tailor/preview_w_frock.png',
        '/images/tailor/preview_w_shalwarkameez.png',
      ],
      fabricType: 'chiffon',
      garmentType: 'other',
      colorTags: ['Maroon', 'Gold', 'Crimson'],
      priceOriginal: 4500,
      currencyOriginal: 'PKR',
      isActive: true,
      parseSource: 'in_house',
      parsedAt: new Date(),
      parseMetadata: {
        gender: 'female',
        piecesCount: '3 Piece',
        garmentSubtype: 'frock_maxi',
        stockQuantity: 8,
        inStock: true,
        sku: 'TLK-FRK-001',
        season: 'Festive 2026',
        specifications: {
          shirtFabric: 'Embroidered Chiffon 4.0 Meters (16 Kalis)',
          dupattaFabric: 'Zari Tissue Dupatta 2.5 Meters',
          trouserFabric: 'Dyed Silk Trouser 2.5 Meters',
        },
      },
    },
    {
      name: 'Sapphire Luxury Lawn 3-Piece Suit',
      brand: 'Sapphire Studio',
      description:
        'Finely spun luxury printed lawn with organza embroidered neckline and dyed cambric trouser.',
      images: [
        '/images/tailor/garment_w_shalwarkameez.png',
        '/images/tailor/preview_w_shalwarkameez.png',
      ],
      fabricType: 'lawn',
      garmentType: 'full_suit',
      colorTags: ['Pastel Mint', 'Emerald'],
      priceOriginal: 5200,
      currencyOriginal: 'PKR',
      isActive: true,
      parseSource: 'in_house',
      parsedAt: new Date(),
      parseMetadata: {
        gender: 'female',
        piecesCount: '3 Piece',
        garmentSubtype: 'full_suit',
        stockQuantity: 14,
        inStock: true,
        sku: 'TLK-SLK-002',
        season: 'Spring/Summer 2026',
        specifications: {
          shirtFabric: 'Digital Printed Lawn 3.0 Meters',
          dupattaFabric: 'Chiffon Dupatta 2.5 Meters',
          trouserFabric: 'Cambric Cotton 2.5 Meters',
        },
      },
    },
    {
      name: 'Bespoke Jamawar Sadri / Waistcoat',
      brand: 'TailorLink Studio',
      description:
        'Heavy Banarsi Jamawar weave fabric crafted specifically for formal men sadri / waistcoat wear.',
      images: [
        '/images/tailor/garment_m_waistcoat.png',
        '/images/tailor/preview_m_shalwarkameez.png',
      ],
      fabricType: 'silk',
      garmentType: 'other',
      colorTags: ['Navy Blue', 'Silver'],
      priceOriginal: 3800,
      currencyOriginal: 'PKR',
      isActive: true,
      parseSource: 'in_house',
      parsedAt: new Date(),
      parseMetadata: {
        gender: 'male',
        piecesCount: '1 Piece',
        garmentSubtype: 'waistcoat',
        stockQuantity: 6,
        inStock: true,
        sku: 'TLK-WST-003',
        season: 'Wedding Collection',
        specifications: {
          shirtFabric: 'Jamawar Jacquard 1.5 Meters',
          dupattaFabric: 'Silk Inner Lining 1.5 Meters',
          trouserFabric: 'Not Included (Sadri Only)',
        },
      },
    },
    {
      name: 'Executive Italian Wool Two-Piece Suit',
      brand: 'TailorLink Formal',
      description:
        'Super 150s fine Italian tropical wool suit length for two-piece blazer coat and matching trouser.',
      images: [
        '/images/tailor/garment_m_pentcoat.png',
        '/images/tailor/garment_m_trouser.png',
      ],
      fabricType: 'other',
      garmentType: 'other',
      colorTags: ['Charcoal Grey', 'Jet Black'],
      priceOriginal: 14500,
      currencyOriginal: 'PKR',
      isActive: true,
      parseSource: 'in_house',
      parsedAt: new Date(),
      parseMetadata: {
        gender: 'male',
        piecesCount: '2 Piece',
        garmentSubtype: 'pant_coat',
        stockQuantity: 5,
        inStock: true,
        sku: 'TLK-PNT-004',
        season: 'Winter / Executive',
        specifications: {
          shirtFabric: 'Italian Tropical Wool 3.5 Meters',
          dupattaFabric: 'Bemberg Silk Lining 2.0 Meters',
          trouserFabric: 'Matching Wool Trouser Included',
        },
      },
    },
  ];

  for (const art of articles) {
    await prisma.product.create({
      data: art as any,
    });
    console.log(`Created: ${art.name}`);
  }

  console.log('Seeding completed successfully!');
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
