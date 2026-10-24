// OpportunityIQ Personal: the kinds of goals the assistant can watch, and
// the SAMPLE "finds" it shows in the demo. Every find is fictional and
// labelled sample data in the UI; prices, rates and grants are illustrative.

export const GOAL_TYPES = {
  holiday: {
    label: "Holiday & travel",
    watches: ["Flight prices", "Hotel and villa deals", "Weather and seasons", "Travel advice"],
    example: "Bali for 7 days in 6 months, 2 people, under $4,000, villa with a pool",
    keywords: ["holiday", "trip", "travel", "flight", "vacation", "getaway", "bali", "honeymoon", "resort"],
  },
  tech: {
    label: "Phones & tech",
    watches: ["Prices across stores", "Sales and cashback", "New releases", "Reviews"],
    example: "A new phone with a great camera, under $1,200",
    keywords: ["phone", "iphone", "pixel", "galaxy", "laptop", "tv", "tablet", "camera", "headphones", "mobile"],
  },
  home: {
    label: "Buying a home",
    watches: ["Interest rates", "New listings", "Suburb prices", "First-home grants"],
    example: "A 3-bedroom house in Perth, under $750k, near a train line",
    keywords: ["house", "home", "apartment", "unit", "property", "mortgage", "bedroom"],
  },
  dining: {
    label: "Eating out",
    watches: ["Restaurants near you", "Ratings and reviews", "Opening hours", "Specials"],
    example: "Spicy Thai near me tonight, about $40 each",
    keywords: ["dinner", "lunch", "breakfast", "eat", "restaurant", "food", "thai", "pizza", "sushi", "cafe", "brunch"],
  },
  car: {
    label: "Cars",
    watches: ["Dealer and private listings", "Price history", "Running costs", "EV rebates"],
    example: "A used hybrid SUV under $35k",
    keywords: ["car", "suv", "ute", "hybrid", "ev", "vehicle"],
  },
  events: {
    label: "Events & tickets",
    watches: ["Ticket releases", "Presales", "Resale prices", "Best seats"],
    example: "Two tickets to a big concert in Perth",
    keywords: ["concert", "tickets", "show", "festival", "match", "game", "gig"],
  },
  career: {
    label: "Jobs & courses",
    watches: ["Job listings", "Salary data", "Courses and scholarships"],
    example: "A remote UX design job paying $120k or more",
    keywords: ["job", "career", "course", "study", "promotion", "salary", "scholarship"],
  },
  money: {
    label: "Money & bills",
    watches: ["Energy plans", "Insurance renewals", "Savings rates", "Rebates and grants"],
    example: "Cheaper electricity and a better savings rate",
    keywords: ["bill", "bills", "electricity", "energy", "insurance", "savings", "save money", "rebate"],
  },
};

const d = (days) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

// The demo profile: a Perth couple with four goals (the user's examples).
export const DEMO_GOALS = [
  { id: "g-holiday", type: "holiday", title: "Bali holiday for 2", wish: "7 days in Bali in about 6 months, villa with a pool, under $4,000 all up", budget: 4000, when: d(182), location: "Bali", prefs: ["villa", "pool", "beach"] },
  { id: "g-tech", type: "tech", title: "New phone", wish: "A phone with a great camera and long battery, under $1,200", budget: 1200, when: d(30), location: "Perth", prefs: ["camera", "battery"] },
  { id: "g-home", type: "home", title: "First home in Perth", wish: "3-bedroom house in Perth's eastern suburbs, under $750k, near a train line", budget: 750000, when: d(365), location: "Perth", prefs: ["3-bed", "train"] },
  { id: "g-dining", type: "dining", title: "Dinner tonight", wish: "Spicy Thai near the city tonight, about $40 each", budget: 40, when: d(0), location: "Perth CBD", prefs: ["thai", "spicy"] },
];

// kind: "option" = available now. "watch" = something the AI is tracking
// for you (a price drop, a rate decision, a sale coming).
const f = (o) => ({ rating: null, priceLabel: null, facts: {}, tags: [], ...o });

export const FINDS = [
  // Holiday
  f({ id: "f-h1", type: "holiday", kind: "option", title: "Perth ⇄ Bali return flights for 2", location: "Denpasar", region: "Indonesia", lat: -8.65, lng: 115.22, value: 980, tag: "Price down 22%", tags: ["bali", "flights"], facts: { Airline: "Sample Air", Dates: "7 nights, flexible", Trend: "Lowest price in 60 days" } }),
  f({ id: "f-h2", type: "holiday", kind: "option", title: "Ubud villa with private pool, 7 nights", location: "Ubud", region: "Indonesia", lat: -8.506, lng: 115.262, value: 1420, rating: 4.8, tag: "Free cancellation", tags: ["bali", "villa", "pool"], facts: { Sleeps: "2", Includes: "Breakfast, airport pickup", Cancel: "Free up to 14 days before" } }),
  f({ id: "f-h3", type: "holiday", kind: "option", title: "Seminyak beachfront hotel, 7 nights", location: "Seminyak", region: "Indonesia", lat: -8.691, lng: 115.168, value: 1180, rating: 4.6, tag: "Breakfast included", tags: ["bali", "beach", "hotel"], facts: { Room: "Ocean view", Includes: "Breakfast", Walk: "Beach 1 min" } }),
  f({ id: "f-h4", type: "holiday", kind: "watch", title: "Best time to book: in the next 3–5 weeks", location: "Bali", region: "Indonesia", lat: -8.4, lng: 115.19, value: null, priceLabel: "Price watch", tag: "Prices usually rise after this", tags: ["bali", "flights"], facts: { Why: "School-holiday demand pushes fares up about 15%", "We'll alert you": "If fares drop another 10%" } }),
  f({ id: "f-h5", type: "holiday", kind: "option", title: "Phuket alternative: flights + 7 nights", location: "Phuket", region: "Thailand", lat: 7.88, lng: 98.39, value: 2650, rating: 4.5, tag: "$600 cheaper than Bali", tags: ["beach", "pool", "resort"], facts: { Includes: "Flights, resort, pool", Weather: "Dry season in your dates" } }),

  // Phones & tech
  f({ id: "f-t1", type: "tech", kind: "option", title: "Sample Pixel Pro 9, 256 GB", location: "Perth CBD store", region: "Western Australia", lat: -31.952, lng: 115.858, value: 1099, rating: 4.7, tag: "Price drop $200", tags: ["camera", "battery", "phone"], facts: { Camera: "Best night photos in its class", Battery: "About 2 days", Warranty: "2 years" } }),
  f({ id: "f-t2", type: "tech", kind: "option", title: "Sample Galaxy S26, 256 GB", location: "Morley store", region: "Western Australia", lat: -31.889, lng: 115.904, value: 1149, rating: 4.6, tag: "Free earbuds", tags: ["camera", "phone"], facts: { Camera: "Great zoom", Battery: "About 1.5 days", Bonus: "Free earbuds worth $199" } }),
  f({ id: "f-t3", type: "tech", kind: "option", title: "Sample iPhone 17, 128 GB", location: "Online, ships to Perth", region: "Western Australia", lat: -31.9, lng: 115.83, value: 1299, rating: 4.7, tag: "$99 over budget", tags: ["camera", "phone"], facts: { Camera: "Excellent video", Battery: "About 1.5 days", Delivery: "2 days" } }),
  f({ id: "f-t4", type: "tech", kind: "watch", title: "Big sales in 29 days: prices often fall 10–15%", location: "Perth stores", region: "Western Australia", lat: -31.96, lng: 115.87, value: null, priceLabel: "Sale watch", tag: "Worth waiting?", tags: ["phone", "camera"], facts: { Why: "Last year this model dropped $150 in the same sale", Tip: "Buy now if you need it this month" } }),
  f({ id: "f-t5", type: "tech", kind: "option", title: "Refurbished Pixel Pro 8, like new", location: "Online, ships to Perth", region: "Western Australia", lat: -31.94, lng: 115.88, value: 699, rating: 4.4, tag: "Save $400", tags: ["camera", "battery", "phone"], facts: { Condition: "Like new, 12-month warranty", Camera: "Still excellent" } }),

  // Buying a home
  f({ id: "f-r1", type: "home", kind: "watch", title: "Interest rates: next decision in 12 days", location: "Australia", region: "Western Australia", lat: -31.95, lng: 115.86, value: null, priceLabel: "Rate watch", tag: "Sample rate 6.1%", tags: ["mortgage", "rate"], facts: { "Typical variable rate (sample)": "6.1%", Forecast: "Most economists expect no change (sample)", Tip: "Get pre-approval before you bid" } }),
  f({ id: "f-r2", type: "home", kind: "option", title: "3-bed house, Morley", location: "Morley", region: "Western Australia", lat: -31.889, lng: 115.907, value: 720000, tag: "New listing today", tags: ["3-bed", "bus"], facts: { Land: "450 m²", "To the city": "25 min by bus", Open: "Saturday 10am" } }),
  f({ id: "f-r3", type: "home", kind: "option", title: "3-bed house, Bayswater", location: "Bayswater", region: "Western Australia", lat: -31.917, lng: 115.917, value: 745000, tag: "4 min walk to train", tags: ["3-bed", "train"], facts: { Land: "510 m²", Train: "Bayswater station, 4 min walk", Open: "Sunday 1pm" } }),
  f({ id: "f-r4", type: "home", kind: "option", title: "4-bed house, Ellenbrook", location: "Ellenbrook", region: "Western Australia", lat: -31.774, lng: 115.968, value: 640000, tag: "$110k under budget", tags: ["4-bed", "train"], facts: { Land: "420 m²", Train: "New line opening nearby", Built: "2019" } }),
  f({ id: "f-r5", type: "home", kind: "watch", title: "Suburb watch: Midland prices up 8% this year", location: "Midland", region: "Western Australia", lat: -31.888, lng: 116.01, value: 610000, priceLabel: "Median $610k", tag: "Growing fast", tags: ["3-bed", "train"], facts: { "Median house (sample)": "$610k", "12-month change (sample)": "+8%", Train: "Midland line" } }),
  f({ id: "f-r6", type: "home", kind: "watch", title: "First-home buyer grant: you may qualify", location: "Western Australia", region: "Western Australia", lat: -31.98, lng: 115.9, value: null, priceLabel: "Grant check", tag: "Check eligibility", tags: ["grant", "first home"], facts: { What: "Government help for first-home buyers (amount and rules vary)", Next: "Check the official government site before you buy" } }),

  // Eating out
  f({ id: "f-d1", type: "dining", kind: "option", title: "Sample Thai Kitchen, Northbridge", location: "Northbridge", region: "Western Australia", lat: -31.947, lng: 115.857, value: 35, priceLabel: "~$35 each", rating: 4.7, tag: "Open till 10pm", tags: ["thai", "spicy"], facts: { Famous: "Jungle curry (very spicy)", Distance: "1.2 km", Booking: "Tables free at 7pm" } }),
  f({ id: "f-d2", type: "dining", kind: "option", title: "Spice Street Thai, Perth CBD", location: "Perth CBD", region: "Western Australia", lat: -31.954, lng: 115.861, value: 28, priceLabel: "~$28 each", rating: 4.5, tag: "Table for 2 at 7:30", tags: ["thai", "spicy", "cheap"], facts: { Famous: "Pad kra pao", Distance: "0.6 km", Booking: "Walk-ins welcome" } }),
  f({ id: "f-d3", type: "dining", kind: "option", title: "Bangkok Night Noodles, Leederville", location: "Leederville", region: "Western Australia", lat: -31.936, lng: 115.841, value: 25, priceLabel: "~$25 each", rating: 4.6, tag: "Spiciest in town", tags: ["thai", "spicy", "noodles"], facts: { Famous: "Boat noodles", Distance: "3.5 km", Booking: "No bookings" } }),
  f({ id: "f-d4", type: "dining", kind: "option", title: "Lemongrass & Lime, Subiaco", location: "Subiaco", region: "Western Australia", lat: -31.948, lng: 115.826, value: 45, priceLabel: "~$45 each", rating: 4.8, tag: "Date-night pick", tags: ["thai"], facts: { Famous: "Duck red curry", Distance: "4 km", Booking: "Book ahead" } }),
  f({ id: "f-d5", type: "dining", kind: "watch", title: "Happy hour 5–6pm at 2 Thai places near you", location: "Northbridge", region: "Western Australia", lat: -31.944, lng: 115.862, value: null, priceLabel: "Deal watch", tag: "Save 20%", tags: ["thai", "deal"], facts: { Where: "Sample Thai Kitchen and one more nearby", Tip: "Arrive by 5:45pm" } }),

  // Cars
  f({ id: "f-c1", type: "car", kind: "option", title: "2022 Sample RAV4 Hybrid, 38,000 km", location: "Osborne Park", region: "Western Australia", lat: -31.9, lng: 115.81, value: 34900, rating: 4.6, tag: "Fair price", tags: ["hybrid", "suv"], facts: { Fuel: "About 4.8 L/100 km", Service: "Full history" } }),
  f({ id: "f-c2", type: "car", kind: "option", title: "2021 Sample Corolla Cross Hybrid", location: "Cannington", region: "Western Australia", lat: -32.017, lng: 115.935, value: 31500, rating: 4.5, tag: "$3,400 under budget", tags: ["hybrid", "suv"], facts: { Fuel: "About 4.3 L/100 km", Km: "52,000" } }),
  f({ id: "f-c3", type: "car", kind: "watch", title: "End-of-year dealer sales in 5 weeks", location: "Perth", region: "Western Australia", lat: -31.97, lng: 115.85, value: null, priceLabel: "Sale watch", tag: "Prices often drop", tags: ["suv", "hybrid"], facts: { Why: "Dealers clear stock before new models" } }),

  // Events
  f({ id: "f-e1", type: "events", kind: "watch", title: "Big stadium concert: presale opens Tuesday 9am", location: "Perth Stadium", region: "Western Australia", lat: -31.951, lng: 115.889, value: null, priceLabel: "Presale alert", tag: "Set a reminder", tags: ["concert", "tickets"], facts: { Tip: "Join the presale list today", "We'll remind you": "Monday night and 8:50am Tuesday" } }),
  f({ id: "f-e2", type: "events", kind: "option", title: "2 seats, Level 1, side view", location: "Perth Stadium", region: "Western Australia", lat: -31.953, lng: 115.888, value: 298, priceLabel: "$298 for 2", rating: null, tag: "Good view", tags: ["concert", "tickets"], facts: { Seller: "Official resale", Guarantee: "Valid tickets guaranteed" } }),

  // Jobs & courses
  f({ id: "f-j1", type: "career", kind: "option", title: "Senior UX Designer (remote)", location: "Sydney (remote)", region: "New South Wales", lat: -33.87, lng: 151.21, value: 125000, priceLabel: "$125k + super", rating: null, tag: "Matches 8 of 9 skills", tags: ["ux", "remote", "design"], facts: { Company: "Sample Fintech", Closes: "In 9 days" } }),
  f({ id: "f-j2", type: "career", kind: "watch", title: "Scholarship: UX master's, 50% off", location: "Melbourne (online)", region: "Victoria", lat: -37.81, lng: 144.96, value: null, priceLabel: "Scholarship", tag: "Applications open", tags: ["course", "ux", "scholarship"], facts: { Closes: "In 3 weeks" } }),

  // Money & bills
  f({ id: "f-m1", type: "money", kind: "option", title: "Switch energy plan: save about $310 a year", location: "Perth", region: "Western Australia", lat: -31.93, lng: 115.87, value: 310, priceLabel: "Save ~$310/yr", rating: null, tag: "5-minute switch", tags: ["electricity", "energy", "bills"], facts: { Based: "Your sample usage", "No exit fee": "Yes" } }),
  f({ id: "f-m2", type: "money", kind: "option", title: "Savings account at 5.1% (sample rate)", location: "Online", region: "Western Australia", lat: -31.96, lng: 115.84, value: 5.1, priceLabel: "5.1% p.a. (sample)", rating: null, tag: "Higher than yours", tags: ["savings", "rate"], facts: { Conditions: "Deposit $1,000 a month (sample)" } }),
];

export const PLAN_STAGES = ["Saved", "Comparing", "Booked / bought", "Done"];

export const goalIcon = (type) => (GOAL_TYPES[type] ? type : "money");
