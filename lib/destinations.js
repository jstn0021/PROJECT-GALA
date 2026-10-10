// Curated dataset of famous Philippine and International destinations
// with high-resolution Unsplash travel photography and detailed metadata.

export const FEATURED_DESTINATIONS = [
  {
    id: "dest-elnido",
    name: "El Nido",
    location: "Palawan, Philippines",
    country: "Philippines",
    category: "Beaches & Islands",
    rating: 4.9,
    reviewsCount: 2450,
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/elnido.jpg",
    description: "Tanyag sa mga nakamamanghang limestone karst cliffs, mala-kristal na lagoons tulad ng Big Lagoon, at mga tagong white-sand beaches.",
    tags: ["Big Lagoon", "Island Hopping", "Kayaking", "Secret Beach"],
    highlights: ["Big & Small Lagoons", "Seven Commandos Beach", "Nacpan Beach Sunset"],
    bestTimeToVisit: "Nobyembre hanggang Mayo (Dry season)",
    coordinates: { lat: 11.1949, lng: 119.4013 }
  },
  {
    id: "dest-baguio",
    name: "Baguio City",
    location: "Benguet, Cordillera, Philippines",
    country: "Philippines",
    category: "Mountains & Nature",
    rating: 4.8,
    reviewsCount: 3120,
    image: "https://images.unsplash.com/photo-1579618218290-24a26f63a728?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/baguio.jpg",
    description: "Ang Summer Capital ng Pilipinas na may malamig na simoy ng hangin, matatayog na pine trees, strawberry picking, at masiglang arts scene.",
    tags: ["Pine Trees", "Strawberries", "Cool Climate", "Camp John Hay"],
    highlights: ["Mines View Park", "Burnham Park", "Camp John Hay", "BenCab Museum"],
    bestTimeToVisit: "Disyembre hanggang Pebrero (Panagbenga Festival)",
    coordinates: { lat: 16.4023, lng: 120.5960 }
  },
  {
    id: "dest-siargao",
    name: "Siargao Island",
    location: "Surigao del Norte, Philippines",
    country: "Philippines",
    category: "Beaches & Islands",
    rating: 4.9,
    reviewsCount: 1890,
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/siargao.webp",
    description: "Ang Surfing Capital ng Pilipinas na tahanan ng world-famous Cloud 9 wave, libu-libong coconut palm forests, at nakakarelaks na island vibe.",
    tags: ["Surfing", "Cloud 9", "Coconut Palm Road", "Sugba Lagoon"],
    highlights: ["Cloud 9 Boardwalk", "Magpupungko Rock Pools", "Sugba Lagoon", "Corregidor Island"],
    bestTimeToVisit: "Agosto hanggang Nobyembre para sa surfing; Marso hanggang Mayo para sa tahimik na dagat",
    coordinates: { lat: 9.8550, lng: 126.0460 }
  },
  {
    id: "dest-boracay",
    name: "Boracay Island",
    location: "Malay, Aklan, Philippines",
    country: "Philippines",
    category: "Beaches & Islands",
    rating: 4.8,
    reviewsCount: 4200,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/elnido.jpg",
    description: "Paborito sa buong mundo dahil sa 4-kilometrong pulbos na pinong White Beach, mahiwagang mga paglubog ng araw, at mga water sports activities.",
    tags: ["White Beach", "Paraw Sailing", "Sunset", "Puka Beach"],
    highlights: ["White Beach Stations 1-3", "Willy's Rock", "Puka Shell Beach", "Diniwid"],
    bestTimeToVisit: "Nobyembre hanggang Mayo (Amihan season)",
    coordinates: { lat: 11.9674, lng: 121.9248 }
  },
  {
    id: "dest-batanes",
    name: "Batanes",
    location: "Batanes, Cagayan Valley, Philippines",
    country: "Philippines",
    category: "Mountains & Nature",
    rating: 4.9,
    reviewsCount: 980,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/baguio.jpg",
    description: "Ang 'Home of the Winds' kung saan matatagpuan ang mga luntiang rolling hills, tradisyonal na Ivatan stone houses, at nakabibighaning lighthouses.",
    tags: ["Rolling Hills", "Ivatan Heritage", "Basco Lighthouse", "Marlboro Hills"],
    highlights: ["Marlboro Hills (Rakuh a Payaman)", "Tayid Lighthouse", "Honesty Coffee Shop", "Sabtang Island"],
    bestTimeToVisit: "Disyembre hanggang Mayo",
    coordinates: { lat: 20.4485, lng: 121.9708 }
  },
  {
    id: "dest-bohol",
    name: "Chocolate Hills",
    location: "Carmen, Bohol, Philippines",
    country: "Philippines",
    category: "Mountains & Nature",
    rating: 4.7,
    reviewsCount: 2150,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/cebu.jpg",
    description: "Kahanga-hangang heolohikal na monumento ng mahigit 1,200 hugis-tsokolateng burol, kasabay ng Loboc River cruise at Philippine Tarsier sanctuary.",
    tags: ["Geological Wonder", "Tarsier", "Loboc River", "Panglao"],
    highlights: ["Chocolate Hills Complex", "Philippine Tarsier Sanctuary", "Loboc River Cruise", "Panglao Beach"],
    bestTimeToVisit: "Enero hanggang Mayo para makita ang kulay tsokolate",
    coordinates: { lat: 9.9167, lng: 124.1667 }
  },
  {
    id: "dest-vigan",
    name: "Vigan Historic City",
    location: "Ilocos Sur, Philippines",
    country: "Philippines",
    category: "Heritage & Culture",
    rating: 4.8,
    reviewsCount: 1640,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/baguio.jpg",
    description: "Isang UNESCO World Heritage City na nagtataglay ng pinaka-preserved na Spanish colonial architecture sa Asya sa kahabaan ng Calle Crisologo.",
    tags: ["Calle Crisologo", "Kalesa", "Empanada", "Spanish Colonial"],
    highlights: ["Calle Crisologo Night Walk", "Bantay Bell Tower", "Syquia Mansion", "Pagburnayan Jar Factory"],
    bestTimeToVisit: "Nobyembre hanggang Pebrero para sa malamig na panahon",
    coordinates: { lat: 17.5747, lng: 120.3869 }
  },
  {
    id: "dest-mayon",
    name: "Mayon Volcano",
    location: "Legazpi, Albay, Philippines",
    country: "Philippines",
    category: "Mountains & Nature",
    rating: 4.9,
    reviewsCount: 1780,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/baguio.jpg",
    description: "Ang bulkan na tanyag sa kanyang perpektong hugis-kono (world's most symmetrical cone), sikat para sa lava trail ATV rides at makasaysayang Cagsawa Ruins.",
    tags: ["Perfect Cone", "ATV Lava Trail", "Cagsawa Ruins", "Bicol Express"],
    highlights: ["Cagsawa Ruins Viewpoint", "Mayon Lava Trail ATV", "Quitinday Green Hills", "Lignon Hill"],
    bestTimeToVisit: "Marso hanggang Mayo para sa maaliwalas na tanawin",
    coordinates: { lat: 13.2570, lng: 123.6850 }
  },
  {
    id: "dest-coron",
    name: "Coron",
    location: "Palawan, Philippines",
    country: "Philippines",
    category: "Beaches & Islands",
    rating: 4.9,
    reviewsCount: 2210,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/elnido.jpg",
    description: "Pantasya ng mga maninisid na may mga lumubog na barkong pandigma noong WWII, ang napakalinaw na Kayangan Lake, at Twin Lagoon.",
    tags: ["Kayangan Lake", "Twin Lagoon", "Shipwreck Diving", "Maquinit Springs"],
    highlights: ["Kayangan Lake Viewpoint", "Twin Lagoon", "Skeleton Wreck", "Barracuda Lake"],
    bestTimeToVisit: "Nobyembre hanggang Mayo",
    coordinates: { lat: 11.9986, lng: 120.2076 }
  },
  {
    id: "dest-sagada",
    name: "Sagada",
    location: "Mountain Province, Philippines",
    country: "Philippines",
    category: "Mountains & Nature",
    rating: 4.8,
    reviewsCount: 1420,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/baguio.jpg",
    description: "Mahiwagang bulubundukin kung saan masisilayan ang dagat ng mga ulap sa Marlboro Hills, Hanging Coffins sa Echo Valley, at Sumaguing Cave.",
    tags: ["Sea of Clouds", "Hanging Coffins", "Spelunking", "Sagada Coffee"],
    highlights: ["Kiltepan & Marlboro Sea of Clouds", "Echo Valley Hanging Coffins", "Sumaguing Cave", "Bomod-ok Falls"],
    bestTimeToVisit: "Nobyembre hanggang Pebrero",
    coordinates: { lat: 17.0833, lng: 120.9000 }
  },
  {
    id: "dest-cebu",
    name: "Cebu City & Moalboal",
    location: "Cebu, Philippines",
    country: "Philippines",
    category: "Cities & Food",
    rating: 4.8,
    reviewsCount: 3500,
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/cebu.jpg",
    description: "Buhay na sentro ng Visayas kung saan magkakasama ang Magellan's Cross, sardine run sa Moalboal, Kawasan Falls canyoneering, at malinamnam na Lechon.",
    tags: ["Kawasan Canyoneering", "Moalboal Sardine Run", "Magellan's Cross", "Cebu Lechon"],
    highlights: ["Kawasan Falls", "Pescador Island", "Temple of Leah", "Sirao Flower Garden"],
    bestTimeToVisit: "Disyembre hanggang Mayo (Sinulog Festival tuwing Enero)",
    coordinates: { lat: 10.3157, lng: 123.8854 }
  },
  {
    id: "dest-intramuros",
    name: "Intramuros, Manila",
    location: "Metro Manila, Philippines",
    country: "Philippines",
    category: "Heritage & Culture",
    rating: 4.7,
    reviewsCount: 2900,
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/baguio.jpg",
    description: "Ang makasaysayang 'Walled City' ng Maynila na may pader na bato mula ika-16 na siglo, Fort Santiago, San Agustin Church, at sunset sa Manila Bay.",
    tags: ["Walled City", "Fort Santiago", "San Agustin", "Bamboo Bike Tour"],
    highlights: ["Fort Santiago & Rizal Shrine", "San Agustin Church & Museum", "Bambike Ecotours", "Casa Manila"],
    bestTimeToVisit: "Disyembre hanggang Pebrero sa hapon para sa sunset",
    coordinates: { lat: 14.5895, lng: 120.9747 }
  },
  {
    id: "dest-kyoto",
    name: "Kyoto",
    location: "Kansai, Japan",
    country: "Japan",
    category: "Heritage & Culture",
    rating: 4.9,
    reviewsCount: 5400,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/baguio.jpg",
    description: "Puso ng tradisyunal na kultura ng Hapon na may libu-libong classical Shinto shrines, Arashiyama Bamboo Forest, at mga lumang Geisha tea houses.",
    tags: ["Fushimi Inari", "Arashiyama", "Cherry Blossoms", "Geisha Districts"],
    highlights: ["Fushimi Inari Taisha", "Kinkaku-ji (Golden Pavilion)", "Arashiyama Bamboo Grove", "Gion District"],
    bestTimeToVisit: "Marso hanggang Abril (Sakura) o Nobyembre (Autumn foliage)",
    coordinates: { lat: 35.0116, lng: 135.7681 }
  },
  {
    id: "dest-bali",
    name: "Bali",
    location: "Bali, Indonesia",
    country: "Indonesia",
    category: "Beaches & Islands",
    rating: 4.9,
    reviewsCount: 6100,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/elnido.jpg",
    description: "Pulo ng mga Diyos na tanyag sa luntiang Tegallalang rice terraces, iconic na Uluwatu temple cliffs, world-class yoga retreats, at surf beaches.",
    tags: ["Ubud", "Rice Terraces", "Uluwatu Sunset", "Spiritual Retreat"],
    highlights: ["Tegallalang Rice Terraces", "Uluwatu Cliff Temple", "Mount Batur Sunrise Hike", "Nusa Penida"],
    bestTimeToVisit: "Abril hanggang Oktubre (Dry season)",
    coordinates: { lat: -8.4095, lng: 115.1889 }
  },
  {
    id: "dest-santorini",
    name: "Santorini",
    location: "Cyclades, Greece",
    country: "Greece",
    category: "Beaches & Islands",
    rating: 4.9,
    reviewsCount: 4800,
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/elnido.jpg",
    description: "Iconic na whitewashed houses na may matingkad na blue domes sa talampas ng bulkan kung saan masisilayan ang pinakatanyag na sunset sa mundo.",
    tags: ["Oia Sunset", "Blue Domes", "Caldera", "Aegean Sea"],
    highlights: ["Oia Village", "Fira to Oia Hike", "Red Beach", "Akrotiri Archaeological Site"],
    bestTimeToVisit: "Mayo hanggang Oktubre",
    coordinates: { lat: 36.3932, lng: 25.4615 }
  },
  {
    id: "dest-swissalps",
    name: "Swiss Alps",
    location: "Bernese Oberland, Switzerland",
    country: "Switzerland",
    category: "Mountains & Nature",
    rating: 4.9,
    reviewsCount: 3950,
    image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/baguio.jpg",
    description: "Mala-panaginip na alpine peaks, turquoise glacial lakes tulad ng Oeschinensee, tahimik na mga nayon ng Zermatt, at mga scenic train rides.",
    tags: ["Matterhorn", "Glacial Lakes", "Hiking", "Scenic Trains"],
    highlights: ["Zermatt & Matterhorn", "Jungfraujoch Top of Europe", "Lauterbrunnen Valley", "Lake Brienz"],
    bestTimeToVisit: "Hunyo hanggang Setyembre para sa hiking; Disyembre hanggang Marso para sa snow",
    coordinates: { lat: 46.5772, lng: 7.9042 }
  },
  {
    id: "dest-tokyo",
    name: "Tokyo",
    location: "Kanto, Japan",
    country: "Japan",
    category: "Cities & Food",
    rating: 4.9,
    reviewsCount: 7800,
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/cebu.jpg",
    description: "Napakasiglang metropolis kung saan nagtatagpo ang futuristic neon architecture sa Shibuya at Shinjuku sa mga payapang dambana ng Meiji.",
    tags: ["Shibuya Crossing", "Ramen & Sushi", "Akihabara", "Futuristic"],
    highlights: ["Shibuya Crossing & Sky", "Senso-ji Asakusa", "Shinjuku Gyoen", "Tokyo Skytree"],
    bestTimeToVisit: "Oktubre hanggang Nobyembre at Marso hanggang Mayo",
    coordinates: { lat: 35.6762, lng: 139.6503 }
  },
  {
    id: "dest-paris",
    name: "Paris",
    location: "Île-de-France, France",
    country: "France",
    category: "Cities & Food",
    rating: 4.8,
    reviewsCount: 6900,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
    fallbackImage: "/destinations/cebu.jpg",
    description: "Lungsod ng Liwanag at Pag-ibig na naglalaman ng iconic na Eiffel Tower, world-class art sa Louvre, at mga kaakit-akit na sidewalk cafes.",
    tags: ["Eiffel Tower", "Louvre Museum", "Montmartre", "Pastries"],
    highlights: ["Eiffel Tower", "The Louvre", "Notre-Dame Cathedral", "Seine River Cruise"],
    bestTimeToVisit: "Abril hanggang Hunyo at Setyembre hanggang Nobyembre",
    coordinates: { lat: 48.8566, lng: 2.3522 }
  }
];

// Helper: Shuffles an array randomly using Fisher-Yates algorithm
export function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Helper: Retrieve featured places with filtering, shuffling, and limits

export function getFeaturedPlaces({
  random = false,
  limit = 16,
  category = "all",
} = {}) {
  // Philippine destinations only
  let list = FEATURED_DESTINATIONS.filter(
    (place) =>
      String(place.country || "").trim().toLowerCase() === "philippines"
  );

  const categoryMap = {
    beaches: "Beaches & Islands",
    mountains: "Mountains & Nature",
    heritage: "Heritage & Culture",
    cities: "Cities & Food",
  };

  // Filter by selected category
  if (category && category !== "all") {
    const selectedCategory = categoryMap[category.toLowerCase()];

    list = selectedCategory
      ? list.filter((place) => place.category === selectedCategory)
      : [];
  }

  // Shuffle only Philippine destinations
  if (random) {
    list = shuffleArray(list);
  }

  // Apply result limit
  if (Number(limit) > 0) {
    list = list.slice(0, Number(limit));
  }

  return list;
}


// Intelligent fallback photo match based on place name or type
const CATEGORY_PHOTOS = {
  beach: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80"
  ],
  mountain: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80"
  ],
  city: [
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=80"
  ],
  heritage: [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80"
  ],
  nature: [
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1579618218290-24a26f63a728?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80"
  ]
};

// Match photo for arbitrary Nominatim place
export function matchPhotoForPlace(name = "", type = "", address = {}) {
  const text = `${name} ${type} ${address.state || ""} ${address.country || ""}`.toLowerCase();

  // First check if it matches a curated place
  const matched = FEATURED_DESTINATIONS.find((p) =>
    text.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(name.toLowerCase())
  );
  if (matched) return matched.image;

  // Determine category based on keywords
  let category = "city";
  if (text.includes("beach") || text.includes("island") || text.includes("sea") || text.includes("ocean") || text.includes("bay") || text.includes("coast")) {
    category = "beach";
  } else if (text.includes("mountain") || text.includes("peak") || text.includes("volcano") || text.includes("hill") || text.includes("alps")) {
    category = "mountain";
  } else if (text.includes("temple") || text.includes("church") || text.includes("historic") || text.includes("heritage") || text.includes("fort") || text.includes("castle") || text.includes("museum")) {
    category = "heritage";
  } else if (text.includes("forest") || text.includes("lake") || text.includes("river") || text.includes("falls") || text.includes("nature") || text.includes("park")) {
    category = "nature";
  }

  const list = CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS.city;
  const hash = Math.abs(
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );
  return list[hash % list.length];
}
