/** Local brand suggestions for the intake field. Not a live lookup. */
export interface BrandSuggestion {
  name: string;
  tagline: string;
  domain: string;
  handle: string;
  kind: "website" | "instagram";
}
const handleOverrides: Record<string, string> = {
  "O Boticário": "oboticario",
  "Dunkin'": "dunkin",
  "Blue Bottle Coffee": "bluebottle",
  "NUMA Studios": "thenumastudios",
};
const brands: [string, string, string][] = [
  ["Starbucks", "Coffeehouse chain", "starbucks.com"],
  ["Stripe", "Online payments platform", "stripe.com"],
  ["Spotify", "Music and podcast streaming", "spotify.com"],
  ["Shopify", "Online store builder", "shopify.com"],
  ["Squarespace", "Website builder", "squarespace.com"],
  ["Sephora", "Beauty and cosmetics retailer", "sephora.com"],
  ["NUMA Studios", "Hot Pilates, Sculpt and Yoga", "numastudios.com.br"],
  ["SmartFit", "Gym network", "smartfit.com.br"],
  ["Magazine Luiza", "Brazilian retail marketplace", "magazineluiza.com.br"],
  ["Mercado Livre", "Latin American marketplace", "mercadolivre.com.br"],
  ["Nubank", "Digital bank", "nubank.com.br"],
  ["Natura", "Beauty and personal care", "natura.com.br"],
  ["O Boticário", "Fragrance and beauty", "boticario.com.br"],
  ["Renner", "Fashion retailer", "lojasrenner.com.br"],
  ["Havaianas", "Sandals and apparel", "havaianas.com.br"],
  ["Farm Rio", "Colorful fashion label", "farmrio.com"],
  ["iFood", "Food delivery", "ifood.com.br"],
  ["Rappi", "On-demand delivery", "rappi.com.br"],
  ["Americanas", "Retail and e-commerce", "americanas.com.br"],
  ["Amazon", "Online marketplace", "amazon.com"],
  ["Apple", "Consumer electronics", "apple.com"],
  ["Airbnb", "Stays and experiences", "airbnb.com"],
  ["Canva", "Online design tool", "canva.com"],
  ["Calendly", "Scheduling software", "calendly.com"],
  ["Etsy", "Handmade and vintage marketplace", "etsy.com"],
  ["Glossier", "Skincare and makeup", "glossier.com"],
  ["Gymshark", "Fitness apparel", "gymshark.com"],
  ["Lululemon", "Athletic apparel", "lululemon.com"],
  ["Nike", "Sportswear", "nike.com"],
  ["Adidas", "Sportswear", "adidas.com"],
  ["Mailchimp", "Email marketing", "mailchimp.com"],
  ["Notion", "Workspace and notes", "notion.so"],
  ["Hotmart", "Digital products platform", "hotmart.com"],
  ["Nuvemshop", "Online store platform", "nuvemshop.com.br"],
  ["Tray", "E-commerce platform", "tray.com.br"],
  ["Wix", "Website builder", "wix.com"],
  ["WooCommerce", "WordPress e-commerce", "woocommerce.com"],
  ["Square", "Payments for small business", "squareup.com"],
  ["Toast", "Restaurant technology", "toasttab.com"],
  ["Blue Bottle Coffee", "Specialty coffee roaster", "bluebottlecoffee.com"],
  ["Dunkin'", "Coffee and donuts", "dunkindonuts.com"],
  ["Subway", "Sandwich chain", "subway.com"],
  ["Spoleto", "Italian fast food", "spoleto.com.br"],
  ["Outback", "Steakhouse chain", "outback.com.br"],
  ["Sallve", "Brazilian skincare", "sallve.com.br"],
  ["Vivara", "Jewelry retailer", "vivara.com.br"],
  ["Reserva", "Brazilian fashion", "usereserva.com"],
  ["Arezzo", "Shoes and accessories", "arezzo.com.br"],
  ["Petz", "Pet supplies and care", "petz.com.br"],
  ["Cobasi", "Pet supplies", "cobasi.com.br"],
  ["Drogasil", "Pharmacy chain", "drogasil.com.br"],
];
const normalize = (v: string) =>
  v
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/^(?:https?:\/\/)?(?:www\.)?/, "")
    .replace(/^@/, "")
    .replace(/[^a-z0-9.]+/g, "");
export function suggestBrands(query: string, limit = 6): BrandSuggestion[] {
  const instagram = query.trim().startsWith("@");
  const q = normalize(query);
  if (!q) return [];
  const scored: { b: BrandSuggestion; score: number }[] = [];
  for (const [name, tagline, domain] of brands) {
    const handle = handleOverrides[name] ?? domain.split(".")[0];
    const key = instagram ? normalize(handle) : domain;
    const n = normalize(name);
    const words = name
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .split(/\s+/)
      .map(normalize);
    let score = -1;
    if (n.startsWith(q) || key.startsWith(q)) score = 0;
    else if (words.some((w) => w.startsWith(q))) score = 1;
    else if (q.length > 2 && (n.includes(q) || key.includes(q))) score = 2;
    if (score >= 0)
      scored.push({
        b: {
          name,
          tagline,
          domain,
          handle,
          kind: instagram ? "instagram" : "website",
        },
        score,
      });
  }
  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((s) => s.b);
}
