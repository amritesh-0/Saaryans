import { Router } from 'express';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const router = Router();

// Catalog products seed data
// Server-owned source of truth for checkout pricing.
export const PRODUCTS = [
  {
    id: 1,
    name: 'Red Banarasi Georgette Saree With Bandhani Weave And Unstitched Blouse Piece',
    slug: 'red-banarasi-georgette-saree',
    price: 1000,
    originalPrice: 5000,
    category: 'Saree',
    subcategory: 'Silk Saree',
    isSale: true,
    isNew: true,
    sizes: ['XS', 'S', 'M', 'L'],
    material: 'Pure Banarasi Georgette with Zari Work',
    description:
      'This exquisite Red Banarasi Georgette Saree features intricate Bandhani weave patterns with golden zari embellishments. The rich red color symbolizes celebration and elegance, making it perfect for weddings, festivals, and special occasions. Comes with an unstitched blouse piece.',
    details: {
      fabric: 'Banarasi Georgette',
      work: 'Bandhani Weave, Zari',
      length: '5.5 meters (with blouse piece)',
      weight: '550 grams',
      occasion: 'Wedding, Festival, Party',
      washCare: 'Dry Clean Only',
    },
  },
  {
    id: 2,
    name: 'Lime Green Kanjivaram Silk Saree With Golden Border',
    slug: 'lime-green-kanjivaram-silk-saree',
    price: 1200,
    originalPrice: 4500,
    category: 'Saree',
    subcategory: 'Silk Saree',
    isSale: true,
    isNew: true,
    sizes: ['XS', 'S', 'M', 'L'],
    material: 'Pure Kanjivaram Silk',
    description:
      'A vibrant Lime Green Kanjivaram Silk Saree with a stunning golden border. The traditional weave and rich silk texture create a regal look perfect for auspicious occasions.',
    details: {
      fabric: 'Kanjivaram Silk',
      work: 'Traditional Weave, Zari Border',
      length: '5.5 meters (with blouse piece)',
      weight: '600 grams',
      occasion: 'Wedding, Festival, Pooja',
      washCare: 'Dry Clean Only',
    },
  },
  {
    id: 3,
    name: 'Purple Satin Gaji Silk Saree With Floral Embroidery',
    slug: 'purple-satin-gaji-silk-saree',
    price: 1500,
    originalPrice: 5500,
    category: 'Saree',
    subcategory: 'Silk Saree',
    isSale: true,
    isNew: false,
    sizes: ['XS', 'S', 'M', 'L'],
    material: 'Satin Gaji Silk',
    description:
      'This gorgeous Purple Satin Gaji Silk Saree features exquisite floral embroidery along the border. The luxurious satin finish gives it a beautiful sheen, perfect for evening events and celebrations.',
    details: {
      fabric: 'Satin Gaji Silk',
      work: 'Floral Embroidery, Resham',
      length: '5.5 meters (with blouse piece)',
      weight: '500 grams',
      occasion: 'Party, Reception, Evening Event',
      washCare: 'Dry Clean Only',
    },
  },
  {
    id: 4,
    name: 'Golden Zari Tissue Saree With Paisley Motifs',
    slug: 'golden-zari-tissue-saree',
    price: 2000,
    originalPrice: 6000,
    category: 'Saree',
    subcategory: 'Tissue Saree',
    isSale: true,
    isNew: true,
    sizes: ['XS', 'S', 'M', 'L'],
    material: 'Tissue with Zari',
    description:
      'An opulent Golden Zari Tissue Saree adorned with intricate Paisley motifs woven in pure zari. The luminous golden tone and delicate craftsmanship make this a true statement piece for grand celebrations.',
    details: {
      fabric: 'Tissue',
      work: 'Zari Weave, Paisley Motifs',
      length: '5.5 meters (with blouse piece)',
      weight: '450 grams',
      occasion: 'Wedding, Grand Celebration',
      washCare: 'Dry Clean Only',
    },
  },
];

/**
 * GET /api/v1/products
 * Fetch product catalog with optional category filtering
 */
router.get('/', async (req, res) => {
  const { category } = req.query;
  let result = PRODUCTS;

  if (category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  return successResponse(
    res,
    {
      products: result,
      total: result.length,
    },
    'Products catalog retrieved'
  );
});

/**
 * GET /api/v1/products/:id
 * Fetch product details by ID or slug
 */
router.get('/:id', async (req, res) => {
  const param = req.params.id;
  const product = PRODUCTS.find(
    (p) => String(p.id) === param || p.slug === param
  );

  if (!product) {
    return errorResponse(res, `Product '${param}' not found`, 404);
  }

  return successResponse(res, product, 'Product details retrieved');
});

export default router;
