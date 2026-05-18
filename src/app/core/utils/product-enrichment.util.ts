import { Product, RawProduct } from '../models';

const CATEGORY_IMAGES: Record<string, string> = {
  SOC: 'https://images.unsplash.com/photo-1551808525-051fb1a87d8a?auto=format&fit=crop&w=800&q=70',
  EDR: 'https://images.unsplash.com/photo-1614064548237-02f96b3c2bd1?auto=format&fit=crop&w=800&q=70',
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
    imageUrl: (catName && CATEGORY_IMAGES[catName]) || DEFAULT_IMAGE,
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
