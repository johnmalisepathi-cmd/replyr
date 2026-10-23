// Every industry OpportunityIQ understands. Each one has its own vocabulary
// (capabilities, certifications) so the AI can match in that trade's language.
// `pilot: true` marks the industries live in the WA pilot; `keywords` help
// the offline matcher recognise the industry from a plain description.

export const INDUSTRY_GROUPS = [
  "Building & trades",
  "Manufacturing",
  "Resources & energy",
  "Transport & logistics",
  "Food & agriculture",
  "Facilities & services",
  "Technology & professional",
  "Health, education & community",
  "Creative & supplies",
];

const ind = (group, label, capabilities, certifications, examples, factors, keywords = [], pilot = false) => ({
  group,
  label,
  capabilities,
  certifications,
  examples,
  factors,
  keywords,
  pilot,
});

export const INDUSTRIES = {
  // Building & trades
  steel: ind(
    "Building & trades",
    "Steel fabrication",
    ["Laser cutting", "CNC folding", "Welding", "Rolling", "Structural fabrication", "Installation", "Machining", "Galvanising / coating"],
    ["AS/NZS 5131", "ISO 9001", "AS/NZS 1554 welding", "ISO 45001"],
    "Structural packages, brackets, platforms",
    "Machinery, materials, welding capability",
    ["steel", "fabricat", "metal", "workshop"],
    true
  ),
  construction: ind(
    "Building & trades",
    "Building & construction",
    ["Carpentry", "Concrete & formwork", "Commercial fit-out", "Roofing & cladding", "Demolition", "Civil works"],
    ["Builder registration", "ISO 45001", "White Card", "ISO 9001"],
    "Fit-outs, civil works, trade packages",
    "Licences, crew size, project value",
    ["builder", "construction", "carpent", "concrete", "civil", "fit-out", "fitout"]
  ),
  electrical: ind(
    "Building & trades",
    "Electrical & solar",
    ["Electrical installation", "Solar PV", "Battery storage", "Data cabling", "Switchboards", "Electrical maintenance"],
    ["Electrical contractor licence", "CEC accreditation", "ACMA cabling registration", "ISO 45001"],
    "School solar, fit-out wiring, maintenance",
    "Licences, crew size, regional reach",
    ["electric", "solar", "sparky", "cabling"]
  ),
  plumbing: ind(
    "Building & trades",
    "Plumbing & HVAC",
    ["Plumbing", "Gas fitting", "HVAC installation", "Fire services", "Refrigeration", "Plumbing maintenance"],
    ["Plumbing licence", "Gas fitting licence", "ARCtick refrigerant licence", "ISO 45001"],
    "Air-conditioning upgrades, hydraulics",
    "Licences, service area, response times",
    ["plumb", "hvac", "air con", "aircon", "gas fit", "refrigerat"]
  ),
  painting: ind(
    "Building & trades",
    "Painting & decorating",
    ["Commercial painting", "Residential repaints", "Protective coatings", "Line marking", "Graffiti removal", "Wallpaper & finishes"],
    ["Painting contractor licence", "ISO 45001", "Working at heights", "SSPC / ACA coatings inspector"],
    "Building repaints, protective coatings, line marking",
    "Crew size, access equipment, coating systems",
    ["paint", "decorat", "coating", "line mark", "graffiti"]
  ),
  landscaping: ind(
    "Building & trades",
    "Landscaping & grounds",
    ["Grounds maintenance", "Tree services", "Irrigation", "Landscape construction", "Weed control"],
    ["Arborist qualification", "ChemCert", "ISO 14001"],
    "Parks maintenance, streetscapes",
    "Fleet, crew size, chemical licences",
    ["landscap", "garden", "mowing", "arborist", "tree", "grounds"]
  ),

  // Manufacturing
  engineering: ind(
    "Technology & professional",
    "Engineering services",
    ["Structural design", "Mechanical design", "Electrical design", "Drafting / BIM", "Project management", "Inspection & certification"],
    ["Engineers Australia (CPEng)", "NER registration", "ISO 9001", "ISO 45001"],
    "Design and consulting contracts",
    "Disciplines, licences, technical expertise",
    ["engineer", "design", "consultan"],
    true
  ),
  furniture: ind(
    "Manufacturing",
    "Furniture & joinery",
    ["Office furniture", "Custom joinery", "School furniture", "Upholstery", "Shopfitting"],
    ["AFRDI certification", "FSC chain of custody", "ISO 9001"],
    "Office fit-outs, school furniture panels",
    "Production volume, lead times, materials",
    ["furniture", "joinery", "cabinet", "upholster", "shopfit"]
  ),
  textiles: ind(
    "Manufacturing",
    "Textiles & uniforms",
    ["Workwear", "Hi-vis garments", "Embroidery", "Screen printing", "Linen supply"],
    ["AS/NZS 4602 hi-vis", "OEKO-TEX"],
    "Uniforms, workwear, linen contracts",
    "Fabrics, quantities, lead times",
    ["textile", "uniform", "garment", "clothing", "apparel"]
  ),
  defence: ind(
    "Manufacturing",
    "Defence & aerospace",
    ["Precision manufacturing", "Maintenance & repair", "Composites", "Secure IT", "Training & simulation"],
    ["DISP membership", "AS9100", "ISO 9001"],
    "Defence supply chain packages",
    "Security clearances, quality systems",
    ["defence", "defense", "aerospace", "military"]
  ),
  chemicals: ind(
    "Manufacturing",
    "Chemicals & plastics",
    ["Chemical supply", "Plastic moulding", "Packaging manufacture", "Laboratory supplies"],
    ["ISO 9001", "ISO 14001", "Dangerous goods licence"],
    "Packaging, lab and chemical supply panels",
    "Product range, safety data, volumes",
    ["chemical", "plastic", "moulding", "packaging"]
  ),

  // Resources & energy
  mining: ind(
    "Resources & energy",
    "Mining services",
    ["Equipment maintenance", "Shutdown labour", "Conveyor repair", "Hydraulics", "Site services"],
    ["ISO 45001", "Site inductions", "ISO 14001"],
    "Equipment maintenance, shutdown work",
    "Certifications, workforce, equipment",
    ["mining", "mine ", "shutdown", "conveyor", "pilbara"]
  ),
  oilgas: ind(
    "Resources & energy",
    "Oil & gas",
    ["Shutdown maintenance", "Pipeline services", "Inspection & testing", "Rope access", "Corrosion protection"],
    ["ISO 45001", "Offshore survival (TBOSIET)", "IRATA rope access"],
    "Shutdown packages, inspection contracts",
    "Safety record, crew tickets, mobilisation",
    ["oil", "gas", "offshore", "lng", "pipeline"]
  ),
  energy: ind(
    "Resources & energy",
    "Renewable energy",
    ["Solar farm construction", "Wind services", "Battery systems", "Hydrogen", "High-voltage electrical"],
    ["CEC accreditation", "ISO 45001", "HV switching authorisation"],
    "Solar farms, battery projects, grid works",
    "Project scale, HV capability, safety",
    ["renewable", "wind", "solar farm", "hydrogen", "battery"]
  ),
  environmental: ind(
    "Resources & energy",
    "Environmental & waste",
    ["Waste collection", "Recycling", "Environmental assessment", "Remediation", "Revegetation"],
    ["ISO 14001", "EPA licence", "Controlled waste licence"],
    "Waste contracts, site remediation",
    "Licences, fleet, disposal facilities",
    ["waste", "recycl", "environment", "remediat", "rubbish"]
  ),

  // Transport & logistics
  logistics: ind(
    "Transport & logistics",
    "Logistics & freight",
    ["Road freight", "Warehousing", "Oversize transport", "Last-mile delivery", "Cold storage"],
    ["NHVAS accreditation", "ISO 9001"],
    "Freight and warehousing contracts",
    "Fleet, routes, storage capacity",
    ["logistic", "freight", "transport", "warehous", "truck", "courier"]
  ),
  automotive: ind(
    "Transport & logistics",
    "Automotive & fleet",
    ["Fleet maintenance", "Vehicle supply", "Tyres", "Auto electrical", "Panel repair"],
    ["Motor vehicle repairer licence", "ISO 9001"],
    "Fleet servicing, vehicle supply panels",
    "Service locations, brands, turnaround",
    ["automotive", "mechanic", "vehicle", "fleet", "tyre", "car "]
  ),
  marine: ind(
    "Transport & logistics",
    "Marine & maritime",
    ["Vessel maintenance", "Boat building", "Marine engineering", "Port services", "Diving services"],
    ["AMSA certification", "ISO 9001", "ADAS diver accreditation"],
    "Vessel refits, port maintenance",
    "Slipway access, vessel size, crew tickets",
    ["marine", "boat", "vessel", "port", "maritime", "diving"]
  ),

  // Food & agriculture
  food: ind(
    "Food & agriculture",
    "Food manufacturing",
    ["Bulk meals", "Packaged goods", "Cold chain", "Contract packing", "Bakery"],
    ["HACCP", "SQF", "ISO 22000"],
    "Institutional food supply, packaging",
    "Food safety, production volume, delivery",
    ["food", "meal", "bakery", "packing"]
  ),
  agriculture: ind(
    "Food & agriculture",
    "Agriculture & farming",
    ["Fresh produce", "Livestock", "Farm contracting", "Irrigation supply", "Grain & fodder"],
    ["Freshcare", "Organic certification", "HACCP"],
    "Produce supply, farm services",
    "Seasonality, volume, delivery reach",
    ["farm", "agricultur", "produce", "livestock", "grain", "crop"]
  ),
  hospitality: ind(
    "Food & agriculture",
    "Hospitality & catering",
    ["Event catering", "Staff canteens", "Accommodation", "Venue hire", "Coffee carts"],
    ["Food safety supervisor", "HACCP", "Liquor licence"],
    "Canteen contracts, event catering",
    "Kitchen capacity, staff, food safety",
    ["catering", "hospitality", "cafe", "restaurant", "canteen", "hotel"]
  ),

  // Facilities & services
  cleaning: ind(
    "Facilities & services",
    "Cleaning & facilities",
    ["Commercial cleaning", "Window cleaning", "Pest control", "Facilities maintenance", "Washroom services"],
    ["ISO 9001", "ISO 14001", "Police clearance"],
    "Office and school cleaning contracts",
    "Staff numbers, sites, security checks",
    ["clean", "janitor", "pest", "facilit"]
  ),
  security: ind(
    "Facilities & services",
    "Security services",
    ["Static guarding", "Event security", "CCTV installation", "Alarm monitoring", "Access control"],
    ["Security agent licence", "Security installer licence", "ISO 9001"],
    "Event and site security, CCTV upgrades",
    "Licensed staff, monitoring centre, response",
    ["security", "guard", "cctv", "alarm"]
  ),
  labour: ind(
    "Facilities & services",
    "Labour hire & staffing",
    ["Trades labour", "Admin staffing", "Traffic control", "Warehouse staff", "Executive recruitment"],
    ["Labour hire licence", "Traffic management accreditation", "ISO 9001"],
    "Labour panels, traffic management",
    "Workforce pool, licences, response time",
    ["labour hire", "staffing", "recruit", "traffic control"]
  ),

  // Technology & professional
  it: ind(
    "Technology & professional",
    "IT & software",
    ["Software development", "Cloud services", "Cybersecurity", "IT support", "Data & analytics", "AI & automation"],
    ["ISO 27001", "Essential Eight", "IRAP assessment", "SOC 2"],
    "Software builds, cyber uplift, IT support",
    "Tech stack, security clearances, team size",
    ["software", "it ", "cyber", "cloud", "developer", "tech", "app ", "data"]
  ),
  telecoms: ind(
    "Technology & professional",
    "Telecommunications",
    ["Fibre installation", "Tower services", "Network maintenance", "Radio systems"],
    ["ACMA cabling registration", "ISO 45001", "Working at heights"],
    "Fibre rollouts, tower maintenance",
    "Crew tickets, regional coverage",
    ["telecom", "fibre", "fiber", "tower", "network"]
  ),
  professional: ind(
    "Technology & professional",
    "Professional services",
    ["Accounting & audit", "Legal services", "HR consulting", "Management consulting", "Translation"],
    ["CPA / CA membership", "Practising certificate", "ISO 9001"],
    "Audit, legal and advisory panels",
    "Qualifications, panel membership, insurance",
    ["accountant", "accounting", "legal", "lawyer", "consult", "audit", "advis"]
  ),

  // Health, education & community
  healthcare: ind(
    "Health, education & community",
    "Healthcare & medical",
    ["Medical consumables", "Medical equipment", "Allied health", "Aged care services", "Pathology"],
    ["TGA registration", "ISO 13485", "NDIS registration"],
    "Consumables panels, allied health services",
    "Registrations, product range, coverage",
    ["medical", "health", "hospital", "aged care", "physio", "clinic"]
  ),
  education: ind(
    "Health, education & community",
    "Education & training",
    ["Accredited training", "Corporate training", "eLearning content", "Tutoring", "Safety training"],
    ["RTO registration", "Working with Children Check"],
    "Training panels, eLearning builds",
    "Accreditation, trainers, delivery mode",
    ["training", "education", "school", "tutor", "rto", "elearning"]
  ),
  community: ind(
    "Health, education & community",
    "Community & disability services",
    ["Disability support", "Youth services", "Housing support", "Employment services"],
    ["NDIS registration", "Working with Children Check", "Police clearance"],
    "Funded community service programs",
    "Registrations, staff, service regions",
    ["ndis", "disability", "community", "youth", "not-for-profit"]
  ),

  // Creative & supplies
  marketing: ind(
    "Creative & supplies",
    "Marketing & creative",
    ["Branding & design", "Digital marketing", "Video production", "Printing", "Signage"],
    ["Government marketing panel", "ISO 9001"],
    "Campaigns, video, signage packages",
    "Portfolio, capacity, panel membership",
    ["marketing", "design", "video", "agency", "print", "signage", "brand"]
  ),
  supplies: ind(
    "Creative & supplies",
    "Wholesale & supplies",
    ["Office supplies", "PPE supply", "Janitorial supplies", "Hardware supply", "Promotional products"],
    ["ISO 9001", "Indigenous business certification (Supply Nation)"],
    "Supply panels for PPE, stationery, hardware",
    "Product range, pricing, delivery reach",
    ["wholesale", "supplier", "ppe", "stationery", "distribut"]
  ),
};
