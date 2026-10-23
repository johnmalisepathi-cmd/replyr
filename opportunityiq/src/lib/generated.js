import { INDUSTRIES } from "./industries.js";

// A worldwide set of SAMPLE opportunities so every industry shows jobs around
// the world in the demo. Built deterministically (same jobs on every load)
// from four job types per industry, each placed in an Australian city and in
// an international one. All buyers are fictional ("Sample ...").

const AU_CITIES = [
  ["Perth", "Western Australia", -31.95, 115.86],
  ["Sydney", "New South Wales", -33.87, 151.21],
  ["Melbourne", "Victoria", -37.81, 144.96],
  ["Brisbane", "Queensland", -27.47, 153.03],
  ["Adelaide", "South Australia", -34.93, 138.6],
  ["Darwin", "Northern Territory", -12.46, 130.84],
  ["Hobart", "Tasmania", -42.88, 147.33],
  ["Canberra", "ACT", -35.28, 149.13],
  ["Townsville", "Queensland", -19.26, 146.82],
  ["Newcastle", "New South Wales", -32.93, 151.78],
  ["Geelong", "Victoria", -38.15, 144.36],
  ["Bunbury", "Western Australia", -33.33, 115.64],
];

const WORLD_CITIES = [
  ["Auckland", "New Zealand", -36.85, 174.76],
  ["Wellington", "New Zealand", -41.29, 174.78],
  ["Singapore", "Singapore", 1.35, 103.82],
  ["Mumbai", "India", 19.08, 72.88],
  ["Delhi", "India", 28.61, 77.21],
  ["Bengaluru", "India", 12.97, 77.59],
  ["Dubai", "United Arab Emirates", 25.2, 55.27],
  ["Abu Dhabi", "United Arab Emirates", 24.45, 54.38],
  ["London", "United Kingdom", 51.51, -0.13],
  ["Manchester", "United Kingdom", 53.48, -2.24],
  ["Glasgow", "United Kingdom", 55.86, -4.25],
  ["Houston", "United States", 29.76, -95.37],
  ["New York", "United States", 40.71, -74.0],
  ["Los Angeles", "United States", 34.05, -118.24],
  ["Toronto", "Canada", 43.65, -79.38],
  ["Vancouver", "Canada", 49.28, -123.12],
];

// [title, capability indexes needed, buyer type, isEarlySignal]
const JOBS = {
  steel: [["Structural steel for a warehouse expansion", [4, 2, 5], "Logistics Park"], ["Laser-cut and folded brackets supply", [0, 1], "Rail Operator"], ["Machined and galvanised parts panel", [6, 7], "Water Utility"], ["New stadium approved — steel packages expected", [4, 2], "Stadium Trust", true]],
  construction: [["Library fit-out and refurbishment", [2, 0], "City Council"], ["School roofing replacement program", [3], "Education Department"], ["Road upgrade civil works", [5, 1], "Roads Authority"], ["Hospital redevelopment approved — trade packages likely", [1, 2], "Health Service", true]],
  electrical: [["Solar and battery for community centres", [1, 2], "City Council"], ["Office data cabling and switchboard upgrade", [3, 4], "Government Department"], ["Electrical maintenance for 40 sites", [5, 0], "Housing Agency"], ["EV charging rollout announced", [0, 4], "Energy Utility", true]],
  plumbing: [["HVAC replacement for a hospital wing", [2, 4], "Health Service"], ["Fire services maintenance contract", [3, 5], "University"], ["Public toilet plumbing upgrades", [0, 5], "City Council"], ["Water network upgrade funded — plumbing work expected", [0, 1], "Water Utility", true]],
  painting: [["Repaint of 30 school buildings", [0, 1], "Education Department"], ["Protective coatings for a steel bridge", [2], "Roads Authority"], ["Car park line marking program", [3], "Airport Corporation"], ["Graffiti removal and anti-graffiti coating", [4, 0], "Rail Operator"]],
  landscaping: [["Parks and reserves maintenance", [0, 4], "City Council"], ["Street tree pruning program", [1], "Roads Authority"], ["Campus landscape upgrade", [3, 2], "University"], ["New parklands approved — landscape works expected", [3, 2], "Development Authority", true]],
  engineering: [["Structural assessment of public buildings", [0, 5], "City Council"], ["Mechanical design for a pumping station", [1, 3], "Water Utility"], ["Electrical design for a rail depot", [2, 4], "Rail Operator"], ["Port expansion funded — design panel expected", [0, 4], "Ports Authority", true]],
  furniture: [["Office furniture for a new headquarters", [0], "Government Department"], ["School furniture supply panel", [2], "Education Department"], ["Custom joinery for a museum fit-out", [1, 4], "Museum Trust"], ["Hotel refurbishment upholstery package", [3], "Hotel Group"]],
  textiles: [["Staff uniforms 3-year supply", [0, 2], "Airline"], ["Hi-vis workwear panel", [1, 3], "Roads Authority"], ["Hospital linen supply", [4], "Health Service"], ["Event merchandise screen printing", [3], "Events Authority"]],
  defence: [["Precision parts for armoured vehicles", [0], "Defence Logistics Agency"], ["Aircraft maintenance support", [1, 2], "Air Force Base"], ["Secure IT network upgrade", [3], "Defence Department"], ["Naval base expansion announced", [1, 0], "Defence Estate", true]],
  chemicals: [["Water treatment chemicals supply", [0], "Water Utility"], ["Recycled plastic bins manufacture", [1], "City Council"], ["Laboratory consumables panel", [3], "University"], ["Food packaging supply contract", [2], "Food Manufacturer"]],
  mining: [["Processing plant shutdown crews", [1, 0], "Mining Company"], ["Conveyor maintenance contract", [2, 3], "Iron Ore Operations"], ["Mine site services and camp support", [4], "Gold Producer"], ["New lithium mine approved — services expected", [0, 4], "Lithium Developer", true]],
  oilgas: [["Refinery turnaround maintenance", [0, 2], "Energy Company"], ["Pipeline integrity inspection", [1, 2], "Gas Network"], ["Offshore platform rope access works", [3, 4], "Offshore Operator"], ["New LNG terminal approved", [0, 1], "LNG Developer", true]],
  energy: [["Solar farm civil and electrical works", [0, 4], "Renewables Developer"], ["Wind turbine servicing contract", [1], "Wind Farm Operator"], ["Grid battery installation", [2, 4], "Energy Utility"], ["Green hydrogen hub announced", [3], "Energy Department", true]],
  environmental: [["Kerbside waste and recycling collection", [0, 1], "City Council"], ["Contaminated site remediation", [3, 2], "Development Authority"], ["Environmental impact assessment", [2], "Roads Authority"], ["Wetland revegetation program", [4], "Parks Service"]],
  logistics: [["Warehousing and distribution contract", [1, 0], "Retail Group"], ["Cold-chain transport for vaccines", [4, 3], "Health Service"], ["Oversize transport for wind blades", [2], "Renewables Developer"], ["Last-mile delivery panel", [3], "Postal Service"]],
  automotive: [["Fleet servicing for 600 vehicles", [0, 3], "Government Fleet Agency"], ["Tyre supply and fitting panel", [2], "Bus Operator"], ["Light vehicle supply contract", [1], "Police Service"], ["Smash repair panel", [4], "Insurance Group"]],
  marine: [["Ferry maintenance and refit", [0, 2], "Ferry Operator"], ["Patrol boat build", [1], "Coastal Agency"], ["Port mooring and diving services", [3, 4], "Ports Authority"], ["New cruise terminal approved", [3], "Ports Authority", true]],
  food: [["Hospital patient meals supply", [0, 2], "Health Service"], ["School canteen packaged foods", [1], "Education Department"], ["Contract packing for a food brand", [3], "Food Brand"], ["Bakery supply for airline catering", [4], "Airline Caterer"]],
  agriculture: [["Fresh produce for school meals", [0], "Education Department"], ["Livestock supply contract", [1], "Meat Processor"], ["Farm contracting for research stations", [2, 3], "Agriculture Department"], ["Grain and fodder supply panel", [4], "Zoo Authority"]],
  hospitality: [["Conference catering panel", [0, 4], "Convention Centre"], ["Staff canteen operation", [1], "Hospital Network"], ["Crew accommodation contract", [2], "Mining Company"], ["Major sporting event catering", [0, 3], "Events Authority", true]],
  cleaning: [["Office cleaning for government buildings", [0, 4], "Government Department"], ["Airport terminal cleaning", [0, 1], "Airport Corporation"], ["Pest control for schools", [2], "Education Department"], ["Facilities maintenance for libraries", [3], "City Council"]],
  security: [["Static guarding for council sites", [0], "City Council"], ["Festival event security", [1], "Events Authority"], ["CCTV upgrade for transport hubs", [2, 4], "Transport Agency"], ["Alarm monitoring panel", [3], "Housing Agency"]],
  labour: [["Traffic control panel", [2], "Roads Authority"], ["Administrative staffing panel", [1], "Government Department"], ["Warehouse labour hire", [3], "Logistics Company"], ["Trades labour for a hospital build", [0], "Health Infrastructure", true]],
  it: [["Cybersecurity assessment and uplift", [2, 3], "Government Department"], ["Cloud migration of citizen services", [1, 0], "City Council"], ["IT support and service desk", [3], "University"], ["AI and data analytics platform", [4, 5], "Health Service"]],
  telecoms: [["Fibre rollout to regional towns", [0], "Broadband Agency"], ["Mobile tower maintenance", [1, 2], "Telecom Carrier"], ["Emergency radio network upgrade", [3], "Emergency Services"], ["Smart city network announced", [2, 0], "City Council", true]],
  professional: [["Internal audit services panel", [0], "Government Department"], ["Legal advisory panel", [1], "Transport Agency"], ["HR and workforce review", [2, 3], "Health Service"], ["Translation and interpreting services", [4], "Immigration Department"]],
  healthcare: [["Medical consumables supply", [0], "Hospital Network"], ["Imaging equipment replacement", [1], "Health Service"], ["Allied health services panel", [2], "Aged Care Provider"], ["New hospital approved — equipment needed", [1, 0], "Health Infrastructure", true]],
  education: [["Workplace safety training", [4, 0], "Mining Company"], ["Leadership training program", [1], "Government Department"], ["eLearning course development", [2], "University"], ["After-school tutoring program", [3], "Education Department"]],
  community: [["Disability support services", [0], "Disability Agency"], ["Youth outreach program", [1], "City Council"], ["Housing support services", [2], "Housing Agency"], ["Employment services contract", [3], "Employment Department"]],
  marketing: [["Tourism campaign creative", [0, 1], "Tourism Agency"], ["Video series for a public campaign", [2], "Health Department"], ["Wayfinding signage for a campus", [4, 0], "University"], ["Annual report printing", [3], "Government Department"]],
  supplies: [["Office supplies panel", [0], "Government Department"], ["PPE supply for hospitals", [1], "Health Service"], ["Janitorial supplies contract", [2], "Education Department"], ["Hardware supply for maintenance crews", [3], "Housing Agency"]],
};

const RISKS = [
  "Scope split not specified",
  "Short response window",
  "Local presence may be required",
  "Volumes not guaranteed",
  "Site access restrictions",
  "Insurance levels not specified",
];

// Small deterministic pseudo-random numbers, so every load looks the same.
function rand(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
}

const day = 86_400_000;
const isoIn = (days) => new Date(Date.now() + days * day).toISOString().slice(0, 10);

export function generateOpportunities() {
  const out = [];
  Object.entries(JOBS).forEach(([industryId, jobs], ii) => {
    const ind = INDUSTRIES[industryId];
    if (!ind) return;
    jobs.forEach(([title, needIdx, buyerType, signal], ji) => {
      const places = [AU_CITIES[(ii * 3 + ji) % AU_CITIES.length], WORLD_CITIES[(ii * 5 + ji * 3) % WORLD_CITIES.length]];
      places.forEach(([city, region, lat, lng], pi) => {
        const id = `g-${industryId}-${ji}${pi}`;
        const r = rand(id);
        const needs = needIdx.map((i) => ind.capabilities[i]).filter(Boolean);
        const certs = ind.certifications.slice(0, 1 + Math.floor(r * 2));
        const value = Math.round((60_000 * Math.pow(60, rand(id + "v"))) / 5_000) * 5_000;
        const isSignal = !!signal;
        const deadline = isSignal ? null : isoIn(6 + Math.floor(rand(id + "d") * 34));
        const risk = RISKS[Math.floor(r * RISKS.length)];
        out.push({
          id,
          kind: isSignal ? "signal" : "tender",
          industry: industryId,
          title,
          buyer: `Sample ${city} ${buyerType}${isSignal ? " (announcement)" : ""}`,
          region,
          location: city,
          lat: lat + (rand(id + "x") - 0.5) * 0.3,
          lng: lng + (rand(id + "y") - 0.5) * 0.3,
          distanceKm: 0,
          value,
          deadline,
          published: isoIn(-1 - Math.floor(r * 9)),
          needs,
          certifications: certs,
          summary: isSignal
            ? `An approval or funding announcement in ${city} suggests ${needs.join(", ").toLowerCase()} work will follow. No tender has been published yet.`
            : `The ${buyerType.toLowerCase()} in ${city} is seeking ${needs.join(", ").toLowerCase()}. ${risk}.`,
          extraction: {
            "Project type": ind.label,
            Location: `${city}, ${region}`,
            "Potential work": needs.join(", "),
            Materials: "Not specified",
            Requirements: isSignal ? "Not specified" : certs.join("; ") || "Not specified",
            Deadline: isSignal ? "No tender published yet" : "Verified submission date (see portal)",
            Contact: isSignal ? "Not specified" : "Published procurement contact",
            Risks: isSignal ? "Prediction only; timing may change" : risk,
          },
          sourceLabel: isSignal ? "Sample public announcement" : region === "Western Australia" || pi === 0 ? "Sample tender portal record" : "Sample government e-tender",
        });
      });
    });
  });
  return out;
}
