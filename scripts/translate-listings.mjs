// Translate the Norwegian-language seed listings into English while keeping
// the Norwegian market context (Oslo / Bergen, NOK, Frogner, etc.).
//
// Looks up listings by exact (vertical, title) match, then PATCHes them to
// the English equivalent. Idempotent — re-runs only matter if the title was
// reverted.
//
// Usage: API_KEY=venda_… node scripts/translate-listings.mjs

const API_URL = process.env.API_URL ?? "http://localhost:8787";
const API_KEY = process.env.API_KEY;
if (!API_KEY) { console.error("Set API_KEY"); process.exit(1); }

const TRANSLATIONS = [
  // ---- realestate (8) ----
  {
    oldTitle: "3-roms leilighet med balkong, Frogner",
    title: "3-room apartment with balcony, Frogner",
    description:
      "Bright 3-room apartment in Frogner, 78m² BRA on the 4th floor with elevator. " +
      "Renovated kitchen and bathroom in 2022, original hardwood floors restored. " +
      "Quiet corner unit with a sunny west-facing balcony. Common costs include fiber " +
      "internet and hot water. Co-op with strong finances.",
  },
  {
    oldTitle: "Lys studio med god planløsning, Grünerløkka",
    title: "Bright studio with smart layout, Grünerløkka",
    description:
      "Charming 1-room in Grünerløkka, 32m² BRA. 2nd floor, big windows facing a " +
      "quiet courtyard. Renovated kitchen (2021), original bathroom in good condition. " +
      "Walking distance to Mathallen, the Akerselva river, and the metro. Perfect " +
      "first-time buy or rental investment.",
  },
  {
    oldTitle: "Familiehus med stor hage, Bærum",
    title: "Family house with large garden, Bærum",
    description:
      "Well-maintained detached house, 220m² BRA on a 850m² plot. 5 bedrooms, 3 bathrooms, " +
      "modern kitchen, fireplace, attached double garage. Garden with mature fruit trees " +
      "and a south-facing terrace. Schools and kindergarten 5 minutes away. " +
      "Family-friendly neighbourhood.",
  },
  {
    oldTitle: "Klassisk hytte på Geilo, ski-in/ski-out",
    title: "Classic timber cabin on Geilo, ski-in/ski-out",
    description:
      "Charming timber cabin on Geilo, 95m² BRA. 4 bedrooms, spacious living room with " +
      "a fireplace, fully equipped kitchen. Ski-in/ski-out to Geilo Skisenter (Slaatta). " +
      "Year-round road access. Mains water and sewage. Sold fully furnished. Currently " +
      "rented out 12 weeks/year via DanCenter — generates ~180k NOK/year.",
  },
  {
    oldTitle: "Møblert 2-roms i Sentrum, kort leie",
    title: "Furnished 2-room in Sentrum, short-term rental",
    description:
      "Bright 2-room in central Oslo, 48m² BRA. Fully furnished and move-in ready. " +
      "Includes fiber internet, electricity up to 1500 NOK/month, and common costs. " +
      "Min. 6-month lease. Deposit: 3 months' rent. Non-smoker, no pets. " +
      "Ideal for an expat or a commuter.",
  },
  {
    oldTitle: "Rekkehus med 4 soverom, Stavanger",
    title: "Townhouse with 4 bedrooms, Stavanger",
    description:
      "Three-storey townhouse, 165m² BRA. 4 bedrooms, 2 bathrooms, fireplace. " +
      "Fenced garden with a hot tub. Garage with room for one car plus bikes. Quiet " +
      "street in a child-friendly neighbourhood. Schools within walking distance. " +
      "Sold as-is; built 2008, regularly maintained.",
  },
  {
    oldTitle: "Familieleilighet med utsikt, Holmenkollen",
    title: "Family apartment with views, Holmenkollen",
    description:
      "Premium 4-room apartment, 138m² BRA in a new building above Holmenkollen. " +
      "Panoramic views over the fjord. Generous terrace, walk-in closet, designer " +
      "kitchen with full Miele appliances. Two underground parking spots. Built 2020, " +
      "BREEAM-certified.",
  },
  {
    oldTitle: "Hyggelig 1-roms i Bergen sentrum, leies ut",
    title: "Cosy 1-room in central Bergen, for rent",
    description:
      "Compact studio in central Bergen, 26m². Fully furnished. Electricity and " +
      "internet included. Min. 3-month lease. Deposit: 2 months' rent. Non-smoker, no " +
      "pets. Students welcome.",
  },

  // ---- services (8) ----
  {
    oldTitle: "Erfaren rørlegger — Oslo og Bærum",
    title: "Experienced plumber — Oslo & Bærum",
    description:
      "Master plumber with 12 years' experience, all kinds of plumbing work: " +
      "bathrooms, kitchens, leaks, hot water tanks, underfloor heating. Sentralgodkjenning, " +
      "liability insurance included. Free site visit in Oslo and Bærum. Workmanship guarantee. " +
      "Same-day emergency service inside Ring 3.",
  },
  {
    oldTitle: "Hjemmevask og rengjøring — fast eller engangs",
    title: "Home cleaning — recurring or one-time",
    description:
      "Professional home cleaning in Oslo. We use eco-friendly products and are " +
      "registered in Renholdsregisteret. Weekly, bi-weekly, or one-off (move-in/move-out). " +
      "Insured. Friendly, experienced staff. Eligible for the home-services tax deduction.",
  },
  {
    oldTitle: "Personlig trener — 1-til-1 trening i Bergen",
    title: "Personal trainer — 1-on-1 sessions in Bergen",
    description:
      "Certified PT (NSF) with 6 years' experience. Specialised in strength training, " +
      "weight loss, and rehab. 1-on-1 sessions at SATS Lagunen or in your home. First " +
      "session free. Custom programmes and nutrition plans. English and Norwegian.",
  },
  {
    oldTitle: "Bryllupsfotograf — naturlig dokumentar-stil",
    title: "Wedding photographer — natural documentary style",
    description:
      "Wedding photographer with 10+ years of experience and 200+ weddings shot. " +
      "My style is natural documentary — I capture real moments rather than stiff posing. " +
      "Package includes 8 hours of coverage, 600+ edited photos delivered digitally, and " +
      "a private online gallery. Travels anywhere in Norway.",
  },
  {
    oldTitle: "Oversettelse engelsk ⇄ norsk — fag- og markedsføringstekst",
    title: "Translation EN ⇄ NO — technical & marketing copy",
    description:
      "State-authorised translator with 15 years' experience. Specialty: legal, finance, " +
      "technical documentation, and marketing copy. 24-72h turnaround depending on length. " +
      "From 1.80 NOK/word, but get in touch for a quote — I always agree on a fixed price " +
      "before starting.",
  },
  {
    oldTitle: "Skatterådgivning for selvstendig næringsdrivende",
    title: "Tax advisory for sole traders & small businesses",
    description:
      "Authorised accountant helping small businesses and sole traders with tax filing, " +
      "VAT, and ongoing bookkeeping. 200+ clients since 2018. Fixed monthly pricing from " +
      "2,500 NOK depending on volume. First consultation free. Central Oslo or online.",
  },
  {
    oldTitle: "Frisør — kommer hjem til deg",
    title: "Hairdresser — at-home appointments",
    description:
      "Experienced hairdresser with 9 years of salon background, offering cuts and colour " +
      "in your home in Oslo and nearby. Women's cut from 600 NOK, men's 450, colour from 1,200. " +
      "Uses only professional brands (L'Oréal, Wella). Flexible evenings and weekends.",
  },
  {
    oldTitle: "Web design og utvikling — frilanser",
    title: "Web design & development — freelance",
    description:
      "Freelance web designer/developer with 8 years of experience. I build fast, " +
      "beautiful sites for small businesses and individuals. Webflow, Next.js, and Tailwind. " +
      "Packages from 25k NOK for a simple landing page, from 80k NOK for a full site. " +
      "Ongoing maintenance available.",
  },
];

// Pull all listings owned by the caller (we use seller-scoped GET via /v1/listings
// + the search-includes-seller behaviour). To keep this simple we just fetch
// pageSize=100 across all verticals.
const all = await fetch(`${API_URL}/v1/listings?pageSize=100`, {
  headers: { "x-api-key": API_KEY },
}).then((r) => r.json());

const byTitle = new Map();
for (const l of all.items) byTitle.set(l.title, l);

let ok = 0, missing = 0, failed = 0;
for (const t of TRANSLATIONS) {
  const existing = byTitle.get(t.oldTitle);
  if (!existing) {
    missing++;
    console.log(`  ? not found: ${t.oldTitle}`);
    continue;
  }

  const r = await fetch(`${API_URL}/v1/listings/${existing.id}`, {
    method: "PATCH",
    headers: { "x-api-key": API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ title: t.title, description: t.description }),
  });

  if (!r.ok) {
    failed++;
    const text = await r.text();
    console.log(`  ✗ ${t.oldTitle} — ${r.status} ${text.slice(0, 200)}`);
    continue;
  }
  ok++;
  console.log(`  ✓ ${t.oldTitle}\n     → ${t.title}`);
}

console.log(`\nDone: ${ok} translated, ${missing} not found, ${failed} failed.`);
