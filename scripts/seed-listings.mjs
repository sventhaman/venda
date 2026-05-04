// Seeds ~40 realistic listings across all 5 verticals via the public REST API.
// Re-runnable: each run inserts a fresh batch (no dedupe), so call once and
// `delete_listing` via MCP / dashboard if you want to clean up.
//
// Usage:
//   API_KEY=venda_… node scripts/seed-listings.mjs
//   API_KEY=venda_… API_URL=http://localhost:8787 node scripts/seed-listings.mjs

const API_URL = process.env.API_URL ?? "http://localhost:8787";
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Set API_KEY=venda_…");
  process.exit(1);
}

// Stable Unsplash CDN URLs — these are real photos picked for category fit.
// If any 404, the listing detail page renders a placeholder, so a few stale
// IDs aren't fatal.
const img = (id, alt) => ({
  url: `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`,
  alt,
});

const LISTINGS = [
  // ---------- GOODS ----------
  {
    vertical: "goods",
    title: "Vintage leather jacket, Acne Studios",
    description:
      "Black leather biker jacket from Acne Studios. Bought in 2019, lightly worn. " +
      "Size 38 (women's). Soft buttery leather, no scratches, all zips work. " +
      "Storing it in a smoke-free home. Pickup in Grünerløkka or shipping at buyer's cost.",
    price: { amount: 1500, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0552" },
    images: [
      img("1551028719-00167b16eac5", "leather jacket front"),
      img("1542838132-92c53300491e", "leather jacket detail"),
    ],
    details: { category: "clothing", condition: "good", brand: "Acne Studios", size: "38", color: "black", shippingAvailable: true, pickupOnly: false },
  },
  {
    vertical: "goods",
    title: "IKEA Billy bookshelf, white, 80x202cm",
    description:
      "Standard white Billy bookshelf. Some light scuffs on the side from a move " +
      "but otherwise solid. Comes with the original adjustable shelves. " +
      "Pickup only — too big to ship affordably. I'll help you load it into a car.",
    price: { amount: 600, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0186" },
    images: [
      img("1555041469-a586c61ea9bc", "bookshelf in living room"),
    ],
    details: { category: "furniture", condition: "good", brand: "IKEA", color: "white", shippingAvailable: false, pickupOnly: true },
  },
  {
    vertical: "goods",
    title: "iPhone 14 Pro 256GB, Deep Purple, unlocked",
    description:
      "Selling my iPhone 14 Pro. 256GB, Deep Purple, battery health 92%. " +
      "Always used in a case with screen protector — no scratches, dents, or chips. " +
      "Comes with original box and USB-C cable (no charger, Apple stopped including those). " +
      "Wiped and ready to go.",
    price: { amount: 9500, currency: "NOK" },
    location: { country: "NO", region: "Vestland", city: "Bergen", postalCode: "5003" },
    images: [
      img("1592286927505-1def25115558", "iphone 14 pro front"),
      img("1606841837239-c5a1a4a07af7", "iphone in hand"),
    ],
    details: { category: "electronics", condition: "like_new", brand: "Apple", color: "purple", shippingAvailable: true, pickupOnly: false },
  },
  {
    vertical: "goods",
    title: "Nike Air Max 90, size 43, barely worn",
    description:
      "Nike Air Max 90 in classic white/grey. Size EU 43. Worn maybe 5 times — " +
      "they were a gift but I prefer my old pair. No box. From a smoke-free, pet-free home.",
    price: { amount: 800, currency: "NOK" },
    location: { country: "NO", region: "Trøndelag", city: "Trondheim", postalCode: "7012" },
    images: [
      img("1542291026-7eec264c27ff", "nike sneakers"),
      img("1600185365926-3a2ce3cdb9eb", "sneaker side view"),
    ],
    details: { category: "clothing", condition: "like_new", brand: "Nike", size: "43", color: "white", shippingAvailable: true, pickupOnly: false },
  },
  {
    vertical: "goods",
    title: "Eames lounge chair replica + ottoman, walnut & black leather",
    description:
      "High-quality replica of the classic Eames lounge chair, walnut shell with " +
      "black aniline leather. Bought from a Norwegian retailer in 2022 for 7000 NOK. " +
      "Selling because we're moving abroad. Minor wear on the leather, structurally perfect.",
    price: { amount: 3500, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0264" },
    images: [
      img("1567538096630-e0c55bd6374c", "eames lounge chair"),
      img("1519947486511-46149fa0a254", "lounge chair side"),
    ],
    details: { category: "furniture", condition: "like_new", color: "brown", shippingAvailable: false, pickupOnly: true },
  },
  {
    vertical: "goods",
    title: "Sony WH-1000XM5 noise-cancelling headphones, black",
    description:
      "Sony WH-1000XM5, the latest gen. Bought 8 months ago, still under warranty. " +
      "Comes with the original case, 3.5mm cable, USB-C cable, and box. Excellent " +
      "noise cancelling for flights and open offices. Selling because I switched to AirPods Max.",
    price: { amount: 2900, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0354" },
    images: [
      img("1505740420928-5e560c06d30e", "sony headphones"),
      img("1583394838336-acd977736f90", "headphones case"),
    ],
    details: { category: "electronics", condition: "like_new", brand: "Sony", color: "black", shippingAvailable: true, pickupOnly: false },
  },
  {
    vertical: "goods",
    title: "Specialized Allez road bike, 56cm, 2022",
    description:
      "Specialized Allez Sport, 2022 model, 56cm frame (fits 175-183cm riders). " +
      "Shimano Claris 8-speed groupset. Maybe 800km on the odo, freshly serviced last month. " +
      "Includes Specialized SL pedals (~600 NOK new). Pickup in Bergen Sentrum.",
    price: { amount: 8500, currency: "NOK" },
    location: { country: "NO", region: "Vestland", city: "Bergen", postalCode: "5006" },
    images: [
      img("1532298229144-0ec0c57515c7", "road bike side"),
      img("1485965127911-c038573e85b1", "bike in city"),
    ],
    details: { category: "sports_outdoors", condition: "like_new", brand: "Specialized", color: "red", shippingAvailable: false, pickupOnly: true },
  },
  {
    vertical: "goods",
    title: "MacBook Pro 14\" M2 Pro, 16GB / 512GB",
    description:
      "MacBook Pro 14-inch with M2 Pro chip, 16GB RAM, 512GB SSD. Space Grey. " +
      "Bought in March 2023, used as a personal laptop (no work setup), AppleCare+ " +
      "until March 2026 transferable to buyer. Battery cycles: 142. Light keyboard wear, " +
      "no dents. Comes with original box, MagSafe cable, and 96W charger.",
    price: { amount: 16500, currency: "NOK" },
    location: { country: "NO", region: "Rogaland", city: "Stavanger", postalCode: "4006" },
    images: [
      img("1517336714731-489689fd1ca8", "macbook pro on desk"),
      img("1496181133206-80ce9b88a853", "macbook pro detail"),
    ],
    details: { category: "electronics", condition: "like_new", brand: "Apple", color: "grey", shippingAvailable: true, pickupOnly: false },
  },

  // ---------- CARS ----------
  {
    vertical: "cars",
    title: "Tesla Model 3 Long Range AWD, 2019, 78,000km",
    description:
      "Norwegian-spec Tesla Model 3 Long Range, dual motor AWD. 78,000km. " +
      "Always serviced at Tesla, latest service April 2026. Battery health excellent " +
      "(roughly 480km real-world summer range). White exterior, black interior, premium audio. " +
      "Hengerfeste fitted. Two sets of wheels (sommer + pigg-fri vinter). Non-smoker, no kids/pets.",
    price: { amount: 380000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0250" },
    images: [
      img("1560958089-b8a1929cea89", "tesla model 3 white"),
      img("1571127236794-81c0bbfe1ce3", "tesla interior"),
    ],
    details: { make: "Tesla", model: "Model 3 Long Range AWD", year: 2019, mileageKm: 78000, fuelType: "electric", transmission: "automatic", bodyType: "sedan", drivetrain: "awd", enginePowerHp: 449 },
  },
  {
    vertical: "cars",
    title: "Volvo XC60 D5 AWD Inscription, 2017, 142,000km",
    description:
      "Beautiful Volvo XC60 D5 AWD in Onyx Black with cream leather. 2017, 142,000km, " +
      "full service history at Volvo Bergen. EU-godkjent until 2027. Heated/ventilated front seats, " +
      "panoramic sunroof, BLIS, adaptive cruise. Recently new tires (Nokian Hakkapeliitta + summer set). " +
      "Family car, well-maintained, never crashed.",
    price: { amount: 285000, currency: "NOK" },
    location: { country: "NO", region: "Vestland", city: "Bergen", postalCode: "5063" },
    images: [
      img("1549399542-7e3f8b79c341", "volvo xc60 black"),
      img("1503376780353-7e6692767b70", "volvo dashboard"),
    ],
    details: { make: "Volvo", model: "XC60 D5 AWD Inscription", year: 2017, mileageKm: 142000, fuelType: "diesel", transmission: "automatic", bodyType: "suv", drivetrain: "awd", enginePowerHp: 235 },
  },
  {
    vertical: "cars",
    title: "VW Golf 1.5 TSI Style, 2020, 54,000km",
    description:
      "VW Golf Mk8 1.5 TSI Style, 2020 model. 54,000km, regularly serviced at VW Trondheim. " +
      "Reflex Silver exterior, charcoal interior, factory navigation, adaptive cruise, " +
      "matrix LED. Just changed all four tires. Single owner since new. " +
      "Selling because we got a second kid and need the wagon version.",
    price: { amount: 235000, currency: "NOK" },
    location: { country: "NO", region: "Trøndelag", city: "Trondheim", postalCode: "7042" },
    images: [
      img("1606664515524-ed2f786a0bd6", "vw golf"),
      img("1494976388531-d1058494cdd8", "vw golf side"),
    ],
    details: { make: "Volkswagen", model: "Golf 1.5 TSI Style", year: 2020, mileageKm: 54000, fuelType: "petrol", transmission: "automatic", bodyType: "hatchback", drivetrain: "fwd", enginePowerHp: 150 },
  },
  {
    vertical: "cars",
    title: "BMW X3 xDrive 30e M-sport, 2018, 95,000km",
    description:
      "BMW X3 xDrive 30e plug-in hybrid in Sophistograu with M-sport package. " +
      "2018, 95,000km. EV range ~40km in summer, real-world fuel economy ~0.6l/mil. " +
      "Heated steering wheel, head-up display, harman/kardon. EU-godkjent 2026. " +
      "New brakes 5,000km ago. Always garaged.",
    price: { amount: 425000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0379" },
    images: [
      img("1555215695-3004980ad54e", "bmw x3 grey"),
      img("1583121274602-3e2820c69888", "bmw interior"),
    ],
    details: { make: "BMW", model: "X3 xDrive 30e M-sport", year: 2018, mileageKm: 95000, fuelType: "phev", transmission: "automatic", bodyType: "suv", drivetrain: "awd", enginePowerHp: 292 },
  },
  {
    vertical: "cars",
    title: "Audi A4 Avant 2.0 TDI quattro, 2016, 165,000km",
    description:
      "Audi A4 Avant 2.0 TDI quattro S-tronic, 2016. 165,000km, full Audi service history. " +
      "Glacier white, black leather (heated), B&O sound, virtual cockpit. EU-godkjent until 2027. " +
      "Just had a 150,000km service. Hengerfeste. Roof box included if you want it. Family wagon, " +
      "sad to let it go but going EV.",
    price: { amount: 195000, currency: "NOK" },
    location: { country: "NO", region: "Rogaland", city: "Stavanger", postalCode: "4015" },
    images: [
      img("1606664515524-ed2f786a0bd6", "audi a4 avant"),
    ],
    details: { make: "Audi", model: "A4 Avant 2.0 TDI quattro", year: 2016, mileageKm: 165000, fuelType: "diesel", transmission: "automatic", bodyType: "wagon", drivetrain: "awd", enginePowerHp: 190 },
  },
  {
    vertical: "cars",
    title: "Polestar 2 Long Range Single Motor, 2021, 42,000km",
    description:
      "Polestar 2, 2021 facelift, Long Range Single Motor. 42,000km. Snow white. " +
      "Plus Pack + Pilot Pack. Real-world summer range ~470km. Always charged at home. " +
      "Software updated, no battery degradation noticed. Garmisch leather-free interior. " +
      "Like-new condition, always garaged.",
    price: { amount: 425000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0270" },
    images: [
      img("1617469767053-d3b5c38d6fef", "polestar 2 white"),
    ],
    details: { make: "Polestar", model: "2 Long Range Single Motor", year: 2021, mileageKm: 42000, fuelType: "electric", transmission: "automatic", bodyType: "sedan", drivetrain: "fwd", enginePowerHp: 231 },
  },
  {
    vertical: "cars",
    title: "Ford Focus 1.6 Trend, 2014, 195,000km",
    description:
      "Ford Focus stasjonsvogn, 2014. 195,000km. Ran the family for 8 years, " +
      "now the kids are out of the house. Recently changed timing belt and " +
      "water pump. EU-godkjent until 2026. Some scratches and a small dent on the " +
      "passenger door — priced accordingly. Reliable, never let us down.",
    price: { amount: 89000, currency: "NOK" },
    location: { country: "NO", region: "Trøndelag", city: "Trondheim", postalCode: "7080" },
    images: [
      img("1494905998402-395d579af36f", "ford focus wagon"),
    ],
    details: { make: "Ford", model: "Focus 1.6 Trend", year: 2014, mileageKm: 195000, fuelType: "petrol", transmission: "manual", bodyType: "wagon", drivetrain: "fwd", enginePowerHp: 105 },
  },
  {
    vertical: "cars",
    title: "Toyota RAV4 Hybrid AWD-i, 2022, 28,000km",
    description:
      "Toyota RAV4 Hybrid AWD-i, 2022. 28,000km. Magnetic Grey Metallic. " +
      "Style Premium spec — JBL audio, panoramic monitor, head-up display, " +
      "wireless charging. Used as a daily commuter, never off-road. Garaged. " +
      "Selling because we're emigrating. New tires last spring.",
    price: { amount: 510000, currency: "NOK" },
    location: { country: "NO", region: "Vestland", city: "Bergen", postalCode: "5232" },
    images: [
      img("1605559424843-9e4c228bf1c2", "toyota rav4"),
    ],
    details: { make: "Toyota", model: "RAV4 Hybrid AWD-i", year: 2022, mileageKm: 28000, fuelType: "hybrid", transmission: "automatic", bodyType: "suv", drivetrain: "awd", enginePowerHp: 222 },
  },

  // ---------- REAL ESTATE ----------
  {
    vertical: "realestate",
    title: "3-roms leilighet med balkong, Frogner",
    description:
      "Lekker 3-roms leilighet på Frogner, 78m² BRA i 4. etg med heis. Renovert kjøkken " +
      "og bad i 2022, original parkett pusset opp. Stille hjørneleilighet med solbalkong " +
      "mot vest. Felleskostnader inkluderer fiber og varmtvann. Borettslag med god økonomi.",
    price: { amount: 8500000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0264" },
    images: [
      img("1502672260266-1c1ef2d93688", "modern apartment living"),
      img("1554995207-c18c203602cb", "kitchen interior"),
      img("1560448204-e02f11c3d0e2", "bedroom interior"),
    ],
    details: { dealType: "sale", propertyType: "apartment", ownership: "cooperative", livingAreaSqm: 78, bedrooms: 2, bathrooms: 1, rooms: 3, yearBuilt: 1925, energyRating: "C", floor: 4, hasElevator: true, hasBalcony: true, hasParking: false, furnished: false, monthlyCosts: { amount: 5800, currency: "NOK" } },
  },
  {
    vertical: "realestate",
    title: "Lys studio med god planløsning, Grünerløkka",
    description:
      "Trivelig 1-roms i Grünerløkka, 32m² BRA. 2. etg, lyst rom med store vinduer mot stille " +
      "bakgård. Renovert kjøkken (2021), originalt baderom i god stand. Alt på gangavstand: " +
      "Mathallen, Akerselva, t-bane. Perfekt for førstegangskjøper eller utleie.",
    price: { amount: 4200000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0552" },
    images: [
      img("1502672023488-70e25813eb80", "studio apartment"),
      img("1556909114-f6e7ad7d3136", "small kitchen"),
    ],
    details: { dealType: "sale", propertyType: "apartment", ownership: "freehold", livingAreaSqm: 32, bedrooms: 1, bathrooms: 1, rooms: 1, yearBuilt: 1898, energyRating: "E", floor: 2, hasElevator: false, hasBalcony: false, hasParking: false, furnished: false, monthlyCosts: { amount: 3200, currency: "NOK" } },
  },
  {
    vertical: "realestate",
    title: "Familiehus med stor hage, Bærum",
    description:
      "Velholdt enebolig på 220m² BRA på en flott tomt på 850m². 5 soverom, 3 bad, " +
      "lekent kjøkken, peisestue, vinkeldekkelet uthus med plass til 2 biler. " +
      "Hage med eldre frukttrær, sydvendt terrasse. Skoler og barnehage 5 min unna. " +
      "Familievennlig nabolag.",
    price: { amount: 12500000, currency: "NOK" },
    location: { country: "NO", region: "Akershus", city: "Sandvika", postalCode: "1338" },
    images: [
      img("1564013799919-ab600027ffc6", "modern house exterior"),
      img("1512917774080-9991f1c4c750", "house garden"),
      img("1583608205776-bfd35f0d9f83", "house interior"),
    ],
    details: { dealType: "sale", propertyType: "house", ownership: "freehold", livingAreaSqm: 220, plotAreaSqm: 850, bedrooms: 5, bathrooms: 3, rooms: 7, yearBuilt: 1985, energyRating: "C", hasGarden: true, hasParking: true, furnished: false },
  },
  {
    vertical: "realestate",
    title: "Klassisk hytte på Geilo, ski-in/ski-out",
    description:
      "Sjarmerende tømmerhytte på Geilo, 95m² BRA. 4 soverom, romslig stue med peis, " +
      "fullt utstyrt kjøkken. Ski-in/ski-out til Geilo Skisenter (Slaatta). " +
      "Vei helt frem året rundt. Innlagt vann/kloakk. Selges fullt møblert. Bortleid " +
      "12 uker i året via DanCenter — gir ca 180k i leieinntekt.",
    price: { amount: 3800000, currency: "NOK" },
    location: { country: "NO", region: "Buskerud", city: "Geilo", postalCode: "3580" },
    images: [
      img("1518780664697-55e3ad937233", "norwegian cabin winter"),
      img("1542718610-a1d656d1884c", "cabin interior cozy"),
    ],
    details: { dealType: "sale", propertyType: "cabin", ownership: "freehold", livingAreaSqm: 95, plotAreaSqm: 1200, bedrooms: 4, bathrooms: 1, rooms: 5, yearBuilt: 1992, hasParking: true, furnished: true },
  },
  {
    vertical: "realestate",
    title: "Møblert 2-roms i Sentrum, kort leie",
    description:
      "Lys 2-roms midt i Sentrum, 48m² BRA. Fullt møblert, klar for innflytting. " +
      "Inkluderer fiber, strøm opp til 1500/mnd, og felleskostnader. " +
      "Min. 6 mnd leie. Depositum tilsvarende 3 måneders leie. Ikke røyker, ikke kjæledyr. " +
      "Perfekt for ekspat eller pendler.",
    price: { amount: 18500, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0150" },
    images: [
      img("1522708323590-d24dbb6b0267", "furnished apartment"),
      img("1505691938895-1758d7feb511", "modern living room"),
    ],
    details: { dealType: "rent_long", propertyType: "apartment", livingAreaSqm: 48, bedrooms: 1, bathrooms: 1, rooms: 2, yearBuilt: 2015, energyRating: "B", floor: 3, hasElevator: true, hasBalcony: true, furnished: true, depositAmount: { amount: 55500, currency: "NOK" }, minimumStayMonths: 6 },
  },
  {
    vertical: "realestate",
    title: "Rekkehus med 4 soverom, Stavanger",
    description:
      "Rekkehus over 3 plan, 165m² BRA. 4 soverom, 2 bad, peis. Inngjerdet hage med " +
      "boblebad. Garasje med plass til 1 bil + sykler. Stille gate i barnevennlig nabolag. " +
      "Skoler innen gangavstand. Solgt som-er; bygd 2008, vedlikeholdt jevnlig.",
    price: { amount: 6800000, currency: "NOK" },
    location: { country: "NO", region: "Rogaland", city: "Stavanger", postalCode: "4046" },
    images: [
      img("1523217582562-09d0def993a6", "townhouse exterior"),
      img("1560185007-cde436f6a4d0", "townhouse interior"),
    ],
    details: { dealType: "sale", propertyType: "townhouse", ownership: "freehold", livingAreaSqm: 165, bedrooms: 4, bathrooms: 2, rooms: 6, yearBuilt: 2008, energyRating: "C", hasGarden: true, hasParking: true, furnished: false },
  },
  {
    vertical: "realestate",
    title: "Familieleilighet med utsikt, Holmenkollen",
    description:
      "Eksklusiv 4-roms leilighet på 138m² BRA i ny bygning på Holmenkollen. Panoramautsikt " +
      "mot fjorden. Romslig terrasse, walk-in closet, designerkjøkken med Miele-utstyr. " +
      "2 garasjeplasser i kjeller. Bygget 2020, BREEAM-godkjent.",
    price: { amount: 14500000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0787" },
    images: [
      img("1600596542815-ffad4c1539a9", "luxury apartment"),
      img("1600585154340-be6161a56a0c", "modern living luxury"),
    ],
    details: { dealType: "sale", propertyType: "apartment", ownership: "freehold", livingAreaSqm: 138, bedrooms: 3, bathrooms: 2, rooms: 4, yearBuilt: 2020, energyRating: "A", floor: 5, hasElevator: true, hasBalcony: true, hasParking: true, furnished: false, monthlyCosts: { amount: 9800, currency: "NOK" } },
  },
  {
    vertical: "realestate",
    title: "Hyggelig 1-roms i Bergen sentrum, leies ut",
    description:
      "Liten, men kompakt 1-roms midt i Bergen sentrum. 26m². Fullt møblert. Strøm og " +
      "internett inkludert. Min. 3 mnd leie. Depositum tilsvarende 2 måneders leie. " +
      "Ikke røyk, ikke kjæledyr. Studenter velkomne.",
    price: { amount: 12500, currency: "NOK" },
    location: { country: "NO", region: "Vestland", city: "Bergen", postalCode: "5003" },
    images: [
      img("1502672260266-1c1ef2d93688", "small studio bergen"),
    ],
    details: { dealType: "rent_long", propertyType: "apartment", livingAreaSqm: 26, bedrooms: 1, bathrooms: 1, rooms: 1, yearBuilt: 1960, floor: 2, furnished: true, depositAmount: { amount: 25000, currency: "NOK" }, minimumStayMonths: 3 },
  },

  // ---------- JOBS ----------
  {
    vertical: "jobs",
    title: "Senior Software Engineer (Backend, Go)",
    description:
      "Cognite is hiring a Senior Software Engineer to join our Industrial Data Platform team. " +
      "You'll build the backbone services that ingest, transform, and serve sensor data from " +
      "the world's largest industrial customers. We work in Go, Kubernetes, and Postgres. " +
      "Hybrid (3 days in Oslo office). 5+ years backend experience required.",
    price: { amount: 950000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0166" },
    images: [
      img("1497366216548-37526070297c", "modern office"),
    ],
    details: { companyName: "Cognite", employmentType: "full_time", workArrangement: "hybrid", experienceLevel: "senior", industry: "Software", function: "Engineering", salaryMin: { amount: 850000, currency: "NOK" }, salaryMax: { amount: 1100000, currency: "NOK" }, salaryPeriod: "year", applicationUrl: "https://cognite.com/careers", requirements: ["5+ years backend experience", "Strong Go skills", "Kubernetes & cloud-native", "Postgres at scale"], benefits: ["Stock options", "Hybrid working", "Learning budget", "Annual ski trip"] },
  },
  {
    vertical: "jobs",
    title: "Product Manager — Energy Trading",
    description:
      "Tibber is looking for a Product Manager to lead our energy trading product. You'll work " +
      "directly with our trading desk, data scientists, and customer-facing teams to build " +
      "products that help our 500k+ customers save money and reduce their carbon footprint. " +
      "Fully remote, occasional team weeks in Bergen or Stockholm.",
    price: { amount: 850000, currency: "NOK" },
    location: { country: "NO", region: "Vestland", city: "Bergen", postalCode: "5006" },
    images: [
      img("1551836022-d5d88e9218df", "team working remote"),
    ],
    details: { companyName: "Tibber", employmentType: "full_time", workArrangement: "remote", experienceLevel: "mid", industry: "Energy", function: "Product", salaryMin: { amount: 750000, currency: "NOK" }, salaryMax: { amount: 950000, currency: "NOK" }, salaryPeriod: "year", applicationUrl: "https://tibber.com/careers", requirements: ["3-5 years PM experience", "Quantitative background", "Experience in energy or fintech a plus"], benefits: ["Equity", "Fully remote", "Wellness budget", "Annual offsite"] },
  },
  {
    vertical: "jobs",
    title: "Marketing Lead — Solar B2C",
    description:
      "Otovo is the Nordics' leading rooftop solar marketplace. We're hiring a Marketing Lead " +
      "to own our B2C growth across Norway. You'll lead a team of 4 across paid acquisition, " +
      "lifecycle, and content. Hybrid (Oslo office, 2-3 days/week).",
    price: { amount: 800000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0185" },
    images: [
      img("1551434678-e076c223a692", "marketing team meeting"),
    ],
    details: { companyName: "Otovo", employmentType: "full_time", workArrangement: "hybrid", experienceLevel: "senior", industry: "Energy", function: "Marketing", salaryMin: { amount: 700000, currency: "NOK" }, salaryMax: { amount: 900000, currency: "NOK" }, salaryPeriod: "year", applicationUrl: "https://otovo.com/jobs", requirements: ["5+ years B2C growth", "Performance marketing", "Team leadership", "Nordic market experience"], benefits: ["Stock options", "Hybrid", "30 days vacation"] },
  },
  {
    vertical: "jobs",
    title: "Senior Frontend Developer (React, TypeScript)",
    description:
      "Schibsted is hiring a Senior Frontend Developer to work on FINN.no, Norway's " +
      "largest classifieds marketplace. You'll work on high-traffic consumer products " +
      "used by millions. Modern stack: React, TypeScript, Next.js, GraphQL. " +
      "Hybrid working from our Oslo office.",
    price: { amount: 850000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0107" },
    images: [
      img("1517245386807-bb43f82c33c4", "developer screen"),
    ],
    details: { companyName: "Schibsted", employmentType: "full_time", workArrangement: "hybrid", experienceLevel: "senior", industry: "Media", function: "Engineering", salaryMin: { amount: 750000, currency: "NOK" }, salaryMax: { amount: 950000, currency: "NOK" }, salaryPeriod: "year", applicationUrl: "https://schibsted.com/career", requirements: ["5+ years React", "TypeScript", "Performance optimization", "Accessibility"], benefits: ["Pension", "Insurance", "Hybrid", "Learning budget"] },
  },
  {
    vertical: "jobs",
    title: "Senior Product Designer",
    description:
      "Vipps is hiring a Senior Product Designer to join our consumer payments team. " +
      "You'll shape how millions of Norwegians (and soon, all Nordics) pay each other and " +
      "businesses. We're a tight design team obsessed with simplicity and Norwegian aesthetic. " +
      "Hybrid, Oslo HQ.",
    price: { amount: 880000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0103" },
    images: [
      img("1531403009284-440f080d1e12", "designer at desk"),
    ],
    details: { companyName: "Vipps", employmentType: "full_time", workArrangement: "hybrid", experienceLevel: "senior", industry: "Fintech", function: "Design", salaryMin: { amount: 800000, currency: "NOK" }, salaryMax: { amount: 1000000, currency: "NOK" }, salaryPeriod: "year", applicationUrl: "https://vipps.no/jobb", requirements: ["6+ years product design", "Mobile-first portfolio", "Design systems", "Strong Norwegian or English"], benefits: ["Phantom shares", "Hybrid", "Sabbatical after 5 years"] },
  },
  {
    vertical: "jobs",
    title: "Data Scientist — Risk Modelling",
    description:
      "DNB is hiring a Data Scientist to join our Risk Modelling team. You'll build " +
      "models that drive credit decisions across DNB's retail and corporate portfolios. " +
      "Python, PySpark, Databricks. PhD or MSc in quantitative field required. " +
      "Onsite at our Bjørvika headquarters.",
    price: { amount: 900000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0191" },
    images: [
      img("1551288049-bebda4e38f71", "data scientist working"),
    ],
    details: { companyName: "DNB", employmentType: "full_time", workArrangement: "onsite", experienceLevel: "mid", industry: "Banking", function: "Data Science", salaryMin: { amount: 800000, currency: "NOK" }, salaryMax: { amount: 1050000, currency: "NOK" }, salaryPeriod: "year", applicationUrl: "https://dnb.no/karriere", requirements: ["MSc in quantitative field", "Python + PySpark", "Statistics & ML", "Banking domain a plus"], benefits: ["Pension", "Subsidized loans", "30 days vacation"] },
  },
  {
    vertical: "jobs",
    title: "iOS Engineer — Audiobooks",
    description:
      "Storytel is the Nordics' leading audiobook platform. We're hiring an iOS Engineer " +
      "to work on our flagship app, used by millions across 25+ countries. Swift, SwiftUI, " +
      "Combine. Fully remote within Norway, occasional travel to Stockholm HQ.",
    price: { amount: 800000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0150" },
    images: [
      img("1512941937669-90a1b58e7e9c", "iphone app development"),
    ],
    details: { companyName: "Storytel", employmentType: "full_time", workArrangement: "remote", experienceLevel: "mid", industry: "Media", function: "Engineering", salaryMin: { amount: 700000, currency: "NOK" }, salaryMax: { amount: 900000, currency: "NOK" }, salaryPeriod: "year", applicationUrl: "https://storytel.com/careers", requirements: ["3+ years Swift", "SwiftUI experience", "Published apps in App Store", "API integration"], benefits: ["Stock options", "Fully remote", "Audiobook subscription", "Annual team trip"] },
  },
  {
    vertical: "jobs",
    title: "Backend Engineer — Logistics",
    description:
      "Oda (formerly Kolonial) is rebuilding online grocery for the Nordics. We're hiring " +
      "Backend Engineers across our logistics platform — the systems that route 30,000+ " +
      "deliveries per week. Python + Django, PostgreSQL, GCP. Hybrid in Oslo.",
    price: { amount: 820000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0581" },
    images: [
      img("1486312338219-ce68d2c6f44d", "developer office"),
    ],
    details: { companyName: "Oda", employmentType: "full_time", workArrangement: "hybrid", experienceLevel: "mid", industry: "Logistics", function: "Engineering", salaryMin: { amount: 720000, currency: "NOK" }, salaryMax: { amount: 920000, currency: "NOK" }, salaryPeriod: "year", applicationUrl: "https://oda.com/careers", requirements: ["3+ years Python", "PostgreSQL", "Distributed systems", "Microservices"], benefits: ["Stock options", "Hybrid", "Annual team trip", "Free Oda groceries"] },
  },

  // ---------- SERVICES ----------
  {
    vertical: "services",
    title: "Erfaren rørlegger — Oslo og Bærum",
    description:
      "Mester-rørlegger med 12 års erfaring tilbyr alle typer rørleggerarbeid. " +
      "Bad, kjøkken, lekkasjer, varmtvannsberedere, gulvvarme. Sentralgodkjenning, " +
      "ansvarsforsikring inkl. Gratis befaring i Oslo og Bærum. Garanti på alt arbeid. " +
      "Akutthjelp samme dag innenfor Ring 3.",
    price: { amount: 1200, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0184" },
    images: [
      img("1581578731548-c64695cc6952", "plumber at work"),
    ],
    details: { category: "home_repair", pricingModel: "hourly", rate: { amount: 1200, currency: "NOK" }, remoteAvailable: false, serviceArea: ["Oslo", "Bærum"], responseTimeHours: 4, yearsOfExperience: 12, credentials: ["Sentralgodkjenning", "Ansvarsforsikring", "Mesterbrev"] },
  },
  {
    vertical: "services",
    title: "Hjemmevask og rengjøring — fast eller engangs",
    description:
      "Profesjonell hjemmerengjøring i Oslo. Vi bruker miljøvennlige midler og er " +
      "registrert i renholdsregisteret. Tilbyr ukentlig, annenhver uke, eller " +
      "engangsvask (innflytting/utflytting). Forsikret. Erfarne, snille folk. " +
      "Skattefradrag tilgjengelig (vask hjemme).",
    price: { amount: 450, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0271" },
    images: [
      img("1527515545081-5db817172677", "house cleaning"),
    ],
    details: { category: "cleaning", pricingModel: "hourly", rate: { amount: 450, currency: "NOK" }, remoteAvailable: false, serviceArea: ["Oslo"], responseTimeHours: 24, yearsOfExperience: 8, credentials: ["Renholdsregisteret", "Ansvarsforsikring"] },
  },
  {
    vertical: "services",
    title: "Personlig trener — 1-til-1 trening i Bergen",
    description:
      "Sertifisert PT (NSF) med 6 års erfaring. Spesialisering i styrketrening, " +
      "vekttap og rehabilitering. Tilbyr 1-til-1 timer på SATS Lagunen eller hjemme " +
      "hos deg. Første time er gratis. Jeg lager personlige programmer og kostholdsplaner. " +
      "Snakker norsk og engelsk.",
    price: { amount: 800, currency: "NOK" },
    location: { country: "NO", region: "Vestland", city: "Bergen", postalCode: "5063" },
    images: [
      img("1571019613454-1cb2f99b2d8b", "personal trainer gym"),
    ],
    details: { category: "health_wellness", pricingModel: "fixed", rate: { amount: 800, currency: "NOK" }, remoteAvailable: false, serviceArea: ["Bergen"], responseTimeHours: 12, yearsOfExperience: 6, credentials: ["NSF Personlig Trener", "Førstehjelp"] },
  },
  {
    vertical: "services",
    title: "Bryllupsfotograf — naturlig dokumentar-stil",
    description:
      "Bryllupsfotograf med 10+ års erfaring og 200+ bryllup i porteføljen. " +
      "Min stil er naturlig dokumentar — jeg fanger ekte øyeblikk fremfor stiv posing. " +
      "Pakke inkluderer 8 timer dekning, 600+ redigerte bilder levert digitalt, " +
      "og en privat online galleri. Reiser i hele Norge.",
    price: { amount: 28000, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0454" },
    images: [
      img("1519741497674-611481863552", "wedding photography"),
      img("1465495976277-4387d4b0b4c6", "wedding couple"),
    ],
    details: { category: "events", pricingModel: "project", rate: { amount: 28000, currency: "NOK" }, remoteAvailable: false, serviceArea: ["Oslo", "Akershus", "Vestfold", "Norge"], responseTimeHours: 48, yearsOfExperience: 10, credentials: ["Norges Fotografforbund"] },
  },
  {
    vertical: "services",
    title: "Oversettelse engelsk ⇄ norsk — fag- og markedsføringstekst",
    description:
      "Statsautorisert oversetter med 15 års erfaring. Spesialfelt: jus, finans, " +
      "teknisk dokumentasjon, og markedsføring. Levering 24-72 timer avhengig av lengde. " +
      "Pris fra 1.80 NOK/ord, men ta kontakt for tilbud — jeg gir alltid fast pris " +
      "før vi starter.",
    price: { amount: 0, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0150" },
    images: [
      img("1455390582262-044cdead277a", "translator working"),
    ],
    details: { category: "writing", pricingModel: "quote_only", remoteAvailable: true, serviceArea: ["Norge", "Online"], responseTimeHours: 4, yearsOfExperience: 15, credentials: ["Statsautorisert translatør"] },
  },
  {
    vertical: "services",
    title: "Skatterådgivning for selvstendig næringsdrivende",
    description:
      "Autorisert regnskapsfører som hjelper små bedrifter og enkeltmannsforetak med " +
      "skattemelding, MVA, og løpende regnskap. 200+ klienter siden 2018. Fast månedspris " +
      "fra 2500 NOK avhengig av volum. Første samtale er gratis. Sentrum i Oslo eller online.",
    price: { amount: 1500, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0150" },
    images: [
      img("1554224155-6726b3ff858f", "accountant desk"),
    ],
    details: { category: "consulting", pricingModel: "hourly", rate: { amount: 1500, currency: "NOK" }, remoteAvailable: true, serviceArea: ["Oslo", "Online"], responseTimeHours: 24, yearsOfExperience: 6, credentials: ["Autorisert regnskapsfører", "Bachelor i økonomi"] },
  },
  {
    vertical: "services",
    title: "Frisør — kommer hjem til deg",
    description:
      "Erfaren frisør med 9 års salongbakgrunn tilbyr klipp og farging hjemme hos deg " +
      "i Oslo og nære områder. Klipp dame fra 600 NOK, herre 450 NOK, farging fra 1200 NOK. " +
      "Bruker kun profesjonelle merker (L'Oréal, Wella). Fleksibel kveld og helg.",
    price: { amount: 600, currency: "NOK" },
    location: { country: "NO", region: "Oslo", city: "Oslo", postalCode: "0560" },
    images: [
      img("1522337360788-8b13dee7a37e", "hairdresser at work"),
    ],
    details: { category: "health_wellness", pricingModel: "fixed", rate: { amount: 600, currency: "NOK" }, remoteAvailable: false, serviceArea: ["Oslo", "Bærum"], responseTimeHours: 12, yearsOfExperience: 9, credentials: ["Fagbrev frisør"] },
  },
  {
    vertical: "services",
    title: "Web design og utvikling — frilanser",
    description:
      "Frilans webdesigner og utvikler med 8 års erfaring. Bygger raske, vakre nettsider " +
      "for små bedrifter og enkeltpersoner. Jobber i Webflow, Next.js, og Tailwind. " +
      "Pakke fra 25k for en enkel landingsside, fra 80k for komplette nettsider. " +
      "Tilbyr også løpende vedlikehold.",
    price: { amount: 0, currency: "NOK" },
    location: { country: "NO", region: "Trøndelag", city: "Trondheim", postalCode: "7012" },
    images: [
      img("1467232004584-a241de8bcf5d", "web designer mockup"),
      img("1542744173-8e7e53415bb0", "design workspace"),
    ],
    details: { category: "design", pricingModel: "quote_only", remoteAvailable: true, serviceArea: ["Norge", "Online"], responseTimeHours: 24, yearsOfExperience: 8, credentials: ["Bachelor digital design"] },
  },
];

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

let ok = 0;
let failed = 0;
const failures = [];

console.log(`Seeding ${LISTINGS.length} listings to ${API_URL} …\n`);

for (const [i, listing] of LISTINGS.entries()) {
  const body = { ...listing, status: "active" };

  try {
    const r = await fetch(`${API_URL}/v1/listings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      failed++;
      failures.push({ idx: i, title: listing.title, status: r.status, error: text });
      console.log(`  ✗ [${i + 1}/${LISTINGS.length}] ${listing.vertical} · ${listing.title} — ${r.status}`);
      continue;
    }

    const json = await r.json();
    ok++;
    console.log(`  ✓ [${i + 1}/${LISTINGS.length}] ${listing.vertical} · ${listing.title} → ${json.id}`);
  } catch (e) {
    failed++;
    failures.push({ idx: i, title: listing.title, error: String(e) });
    console.log(`  ✗ [${i + 1}/${LISTINGS.length}] ${listing.vertical} · ${listing.title} — ${e.message ?? e}`);
  }
}

console.log(`\nDone: ${ok} created, ${failed} failed.`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(JSON.stringify(f, null, 2));
  process.exit(1);
}
