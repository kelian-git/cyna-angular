import { Product, RawProduct } from '../models';

const CATEGORY_IMAGES: Record<string, string> = {
  SOC: 'https://alleo.fr/wp-content/uploads/2024/04/2Alleo-WEB-147.jpg',
  EDR: 'https://www.bitdefender.com/adobe/dynamicmedia/deliver/dm-aid--c7155abf-837c-4ff7-81bb-bd33ee28bf88/infozone-endpoint-security-consists-660x380px-4.jpg?quality=85&preferwebp=true',
  XDR: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=70',
  'Sécurité Cloud':
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=70',
  'Services Managés':
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=800&q=70',
  'Audit & Conformité':
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=70',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=70';

// Une image par produit (clé = nom exact du produit en BDD)
const PRODUCT_IMAGES: Record<string, string> = {
  'SOC Platform Essential': 'https://cdn.phototourl.com/free/2026-06-12-6848c4b9-e305-49f1-a9ff-329fd5c2faa7.png',
  'SIEM License Pro': 'https://cdn.phototourl.com/free/2026-06-12-ff084ba1-b65b-47e3-893d-9afcefd4cfcb.png',
  'EDR Agent - Pack 50 postes': 'https://cdn.phototourl.com/free/2026-06-12-c61daec4-e2f3-4628-8dc2-1b67511bcf1e.png',
  'EDR Enterprise - Pack 200 postes': 'https://cdn.phototourl.com/free/2026-06-12-69890bf5-0f67-449d-a6cd-30e30c439f55.png',
  'XDR Suite 360': 'https://cdn.phototourl.com/free/2026-06-12-69a397f1-b91f-4579-805b-5b91d85eac6d.png',
  'XDR Starter': 'https://cdn.phototourl.com/free/2026-06-12-11f087ba-585f-4ce0-8bb9-ad95ec34f488.png',
  'CSPM - Cloud Security Posture': 'https://cdn.phototourl.com/free/2026-06-12-371bc8f9-1576-4d2a-a391-016e420d18cf.png',
  'CASB License': 'https://cdn.phototourl.com/free/2026-06-12-4fc603cc-49ee-44a8-90e8-97030e2677ec.png',
};

const CHARACTERISTICS: Record<string, string[]> = {
  SOC: ['Surveillance 24/7/365', "Corrélation d'événements", 'SLA 99.9%', 'Alertes temps réel'],
  EDR: ['Multi-OS (Win/Linux/Mac)', 'Threat hunting', 'Isolation automatique', 'Intégration SIEM'],
  XDR: ['Corrélation IA', 'Vision unifiée', 'Endpoints + Réseau + Cloud', 'SLA 99.95%'],
  'Sécurité Cloud': ['AWS / Azure / GCP', 'Remédiation auto', 'Compliance continue', 'Multi-tenant'],
  'Services Managés': ['Équipe dédiée', 'Reporting mensuel', 'SLA contractuel', 'Support prioritaire'],
  'Audit & Conformité': ['ISO 27001 / SOC 2 / RGPD', 'Rapport détaillé', "Plan d'action", 'Suivi'],
};

/** Dérive image, disponibilité, pricing et caractéristiques depuis le modèle back simple. */
export function enrichProduct(p: RawProduct & Partial<Product>, categoryName?: string): Product {
  const catName = categoryName || p.category?.name || p.categoryName;
  const stock = p.stock ?? 0;
  return {
    ...p,
    categoryName: catName,
    available: stock > 0,
    imageUrl:
      PRODUCT_IMAGES[p.name] ||
      (catName && CATEGORY_IMAGES[catName]) ||
      DEFAULT_IMAGE,
    characteristics: (catName && CHARACTERISTICS[catName]) || [
      'Support inclus',
      'Documentation complète',
    ],
    priority: (p.idProduct % 5) + 1,
    pricing: {
      monthly: Math.round(p.price / 12),
      yearly: p.price,
      perUser: Math.round(p.price / 100),
    },
  };
}

/** Tri : disponibles d'abord, puis par priorité décroissante (épuisés en dernier). */
export function sortByPriorityAndStock(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return (b.priority || 0) - (a.priority || 0);
  });
}