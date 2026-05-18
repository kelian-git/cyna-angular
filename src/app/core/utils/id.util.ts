let counter = 0;

/** Identifiant unique pour les entités locales (évite les collisions Date.now()). */
export function nextId(): number {
  counter += 1;
  return Date.now() * 1000 + (counter % 1000);
}
