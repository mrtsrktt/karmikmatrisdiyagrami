// cities-data.js
// Curated city database with search functionality for Turkish esoteric website
// Includes all 81 Turkish provinces and ~150 major world cities

const CITIES = [
  // ============================================================
  // TURKISH PROVINCES (81 il merkezi) - Alphabetically sorted
  // ============================================================
  { name: "Adana", lat: 37.0000, lng: 35.3213, country: "TR" },
  { name: "Adiyaman", lat: 37.7648, lng: 38.2786, country: "TR" },
  { name: "Afyonkarahisar", lat: 38.7507, lng: 30.5567, country: "TR" },
  { name: "Agri", lat: 39.7191, lng: 43.0503, country: "TR" },
  { name: "Aksaray", lat: 38.3687, lng: 34.0370, country: "TR" },
  { name: "Amasya", lat: 40.6499, lng: 35.8353, country: "TR" },
  { name: "Ankara", lat: 39.9334, lng: 32.8597, country: "TR" },
  { name: "Antalya", lat: 36.8969, lng: 30.7133, country: "TR" },
  { name: "Ardahan", lat: 41.1105, lng: 42.7022, country: "TR" },
  { name: "Artvin", lat: 41.1828, lng: 41.8183, country: "TR" },
  { name: "Aydin", lat: 37.8560, lng: 27.8416, country: "TR" },
  { name: "Balikesir", lat: 39.6484, lng: 27.8826, country: "TR" },
  { name: "Bartin", lat: 41.6344, lng: 32.3375, country: "TR" },
  { name: "Batman", lat: 37.8812, lng: 41.1351, country: "TR" },
  { name: "Bayburt", lat: 40.2552, lng: 40.2249, country: "TR" },
  { name: "Bilecik", lat: 40.0567, lng: 30.0165, country: "TR" },
  { name: "Bingol", lat: 38.8854, lng: 40.4966, country: "TR" },
  { name: "Bitlis", lat: 38.4010, lng: 42.1095, country: "TR" },
  { name: "Bolu", lat: 40.7360, lng: 31.6061, country: "TR" },
  { name: "Burdur", lat: 37.7203, lng: 30.2908, country: "TR" },
  { name: "Bursa", lat: 40.1826, lng: 29.0665, country: "TR" },
  { name: "Canakkale", lat: 40.1553, lng: 26.4142, country: "TR" },
  { name: "Cankiri", lat: 40.6013, lng: 33.6134, country: "TR" },
  { name: "Corum", lat: 40.5506, lng: 34.9556, country: "TR" },
  { name: "Denizli", lat: 37.7765, lng: 29.0864, country: "TR" },
  { name: "Diyarbakir", lat: 37.9144, lng: 40.2306, country: "TR" },
  { name: "Duzce", lat: 40.8438, lng: 31.1565, country: "TR" },
  { name: "Edirne", lat: 41.6818, lng: 26.5623, country: "TR" },
  { name: "Elazig", lat: 38.6810, lng: 39.2264, country: "TR" },
  { name: "Erzincan", lat: 39.7500, lng: 39.5000, country: "TR" },
  { name: "Erzurum", lat: 39.9000, lng: 41.2700, country: "TR" },
  { name: "Eskisehir", lat: 39.7767, lng: 30.5206, country: "TR" },
  { name: "Gaziantep", lat: 37.0662, lng: 37.3833, country: "TR" },
  { name: "Giresun", lat: 40.9128, lng: 38.3895, country: "TR" },
  { name: "Gumushane", lat: 40.4386, lng: 39.5086, country: "TR" },
  { name: "Hakkari", lat: 37.5833, lng: 43.7408, country: "TR" },
  { name: "Hatay", lat: 36.4018, lng: 36.3498, country: "TR" },
  { name: "Igdir", lat: 39.9167, lng: 44.0500, country: "TR" },
  { name: "Isparta", lat: 37.7648, lng: 30.5566, country: "TR" },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784, country: "TR" },
  { name: "Izmir", lat: 38.4192, lng: 27.1287, country: "TR" },
  { name: "Kahramanmaras", lat: 37.5858, lng: 36.9371, country: "TR" },
  { name: "Karabuk", lat: 41.2061, lng: 32.6204, country: "TR" },
  { name: "Karaman", lat: 37.1759, lng: 33.2287, country: "TR" },
  { name: "Kars", lat: 40.6167, lng: 43.0975, country: "TR" },
  { name: "Kastamonu", lat: 41.3887, lng: 33.7827, country: "TR" },
  { name: "Kayseri", lat: 38.7312, lng: 35.4787, country: "TR" },
  { name: "Kilis", lat: 36.7184, lng: 37.1212, country: "TR" },
  { name: "Kirikkale", lat: 39.8468, lng: 33.5153, country: "TR" },
  { name: "Kirklareli", lat: 41.7333, lng: 27.2167, country: "TR" },
  { name: "Kirsehir", lat: 39.1425, lng: 34.1709, country: "TR" },
  { name: "Kocaeli", lat: 40.8533, lng: 29.8815, country: "TR" },
  { name: "Konya", lat: 37.8746, lng: 32.4932, country: "TR" },
  { name: "Kutahya", lat: 39.4167, lng: 29.9833, country: "TR" },
  { name: "Malatya", lat: 38.3552, lng: 38.3095, country: "TR" },
  { name: "Manisa", lat: 38.6191, lng: 27.4289, country: "TR" },
  { name: "Mardin", lat: 37.3212, lng: 40.7245, country: "TR" },
  { name: "Mersin", lat: 36.8121, lng: 34.6415, country: "TR" },
  { name: "Mugla", lat: 37.2153, lng: 28.3636, country: "TR" },
  { name: "Mus", lat: 38.9462, lng: 41.7539, country: "TR" },
  { name: "Nevsehir", lat: 38.6939, lng: 34.6857, country: "TR" },
  { name: "Nigde", lat: 37.9667, lng: 34.6833, country: "TR" },
  { name: "Ordu", lat: 40.9839, lng: 37.8764, country: "TR" },
  { name: "Osmaniye", lat: 37.0746, lng: 36.2464, country: "TR" },
  { name: "Rize", lat: 41.0201, lng: 40.5234, country: "TR" },
  { name: "Sakarya", lat: 40.6940, lng: 30.4358, country: "TR" },
  { name: "Samsun", lat: 41.2928, lng: 36.3313, country: "TR" },
  { name: "Sanliurfa", lat: 37.1591, lng: 38.7969, country: "TR" },
  { name: "Siirt", lat: 37.9333, lng: 41.9500, country: "TR" },
  { name: "Sinop", lat: 42.0231, lng: 35.1531, country: "TR" },
  { name: "Sirnak", lat: 37.4187, lng: 42.4918, country: "TR" },
  { name: "Sivas", lat: 39.7477, lng: 37.0179, country: "TR" },
  { name: "Tekirdag", lat: 41.0000, lng: 27.5167, country: "TR" },
  { name: "Tokat", lat: 40.3167, lng: 36.5500, country: "TR" },
  { name: "Trabzon", lat: 41.0027, lng: 39.7168, country: "TR" },
  { name: "Tunceli", lat: 39.1079, lng: 39.5401, country: "TR" },
  { name: "Usak", lat: 38.6823, lng: 29.4082, country: "TR" },
  { name: "Van", lat: 38.4891, lng: 43.4089, country: "TR" },
  { name: "Yalova", lat: 40.6500, lng: 29.2667, country: "TR" },
  { name: "Yozgat", lat: 39.8181, lng: 34.8147, country: "TR" },
  { name: "Zonguldak", lat: 41.4564, lng: 31.7987, country: "TR" },

  // ============================================================
  // EUROPE
  // ============================================================
  { name: "London", lat: 51.5074, lng: -0.1278, country: "GB" },
  { name: "Paris", lat: 48.8566, lng: 2.3522, country: "FR" },
  { name: "Berlin", lat: 52.5200, lng: 13.4050, country: "DE" },
  { name: "Rome", lat: 41.9028, lng: 12.4964, country: "IT" },
  { name: "Madrid", lat: 40.4168, lng: -3.7038, country: "ES" },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041, country: "NL" },
  { name: "Vienna", lat: 48.2082, lng: 16.3738, country: "AT" },
  { name: "Brussels", lat: 50.8503, lng: 4.3517, country: "BE" },
  { name: "Stockholm", lat: 59.3293, lng: 18.0686, country: "SE" },
  { name: "Oslo", lat: 59.9139, lng: 10.7522, country: "NO" },
  { name: "Helsinki", lat: 60.1699, lng: 24.9384, country: "FI" },
  { name: "Copenhagen", lat: 55.6761, lng: 12.5683, country: "DK" },
  { name: "Zurich", lat: 47.3769, lng: 8.5417, country: "CH" },
  { name: "Prague", lat: 50.0755, lng: 14.4378, country: "CZ" },
  { name: "Warsaw", lat: 52.2297, lng: 21.0122, country: "PL" },
  { name: "Budapest", lat: 47.4979, lng: 19.0402, country: "HU" },
  { name: "Athens", lat: 37.9838, lng: 23.7275, country: "GR" },
  { name: "Lisbon", lat: 38.7223, lng: -9.1393, country: "PT" },
  { name: "Dublin", lat: 53.3498, lng: -6.2603, country: "IE" },
  { name: "Moscow", lat: 55.7558, lng: 37.6173, country: "RU" },
  { name: "St Petersburg", lat: 59.9343, lng: 30.3351, country: "RU" },
  { name: "Bucharest", lat: 44.4268, lng: 26.1025, country: "RO" },
  { name: "Sofia", lat: 42.6977, lng: 23.3219, country: "BG" },
  { name: "Zagreb", lat: 45.8150, lng: 15.9819, country: "HR" },
  { name: "Belgrade", lat: 44.7866, lng: 20.4489, country: "RS" },
  { name: "Sarajevo", lat: 43.8563, lng: 18.4131, country: "BA" },
  { name: "Tirana", lat: 41.3275, lng: 19.8187, country: "AL" },
  { name: "Skopje", lat: 41.9973, lng: 21.4280, country: "MK" },
  { name: "Podgorica", lat: 42.4304, lng: 19.2594, country: "ME" },
  { name: "Ljubljana", lat: 46.0569, lng: 14.5058, country: "SI" },
  { name: "Bratislava", lat: 48.1486, lng: 17.1077, country: "SK" },
  { name: "Vilnius", lat: 54.6872, lng: 25.2797, country: "LT" },
  { name: "Riga", lat: 56.9496, lng: 24.1052, country: "LV" },
  { name: "Tallinn", lat: 59.4370, lng: 24.7536, country: "EE" },
  { name: "Kiev", lat: 50.4501, lng: 30.5234, country: "UA" },
  { name: "Minsk", lat: 53.9006, lng: 27.5590, country: "BY" },
  { name: "Chisinau", lat: 47.0105, lng: 28.8638, country: "MD" },
  { name: "Tbilisi", lat: 41.7151, lng: 44.8271, country: "GE" },
  { name: "Yerevan", lat: 40.1792, lng: 44.4991, country: "AM" },
  { name: "Baku", lat: 40.4093, lng: 49.8671, country: "AZ" },
  { name: "Nicosia", lat: 35.1856, lng: 33.3823, country: "CY" },

  // ============================================================
  // AMERICAS
  // ============================================================
  { name: "New York", lat: 40.7128, lng: -74.0060, country: "US" },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, country: "US" },
  { name: "Chicago", lat: 41.8781, lng: -87.6298, country: "US" },
  { name: "Houston", lat: 29.7604, lng: -95.3698, country: "US" },
  { name: "Miami", lat: 25.7617, lng: -80.1918, country: "US" },
  { name: "Toronto", lat: 43.6532, lng: -79.3832, country: "CA" },
  { name: "Vancouver", lat: 49.2827, lng: -123.1207, country: "CA" },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332, country: "MX" },
  { name: "Sao Paulo", lat: -23.5505, lng: -46.6333, country: "BR" },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816, country: "AR" },
  { name: "Santiago", lat: -33.4489, lng: -70.6693, country: "CL" },
  { name: "Bogota", lat: 4.7110, lng: -74.0721, country: "CO" },
  { name: "Lima", lat: -12.0464, lng: -77.0428, country: "PE" },
  { name: "Havana", lat: 23.1136, lng: -82.3666, country: "CU" },

  // ============================================================
  // ASIA
  // ============================================================
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, country: "JP" },
  { name: "Beijing", lat: 39.9042, lng: 116.4074, country: "CN" },
  { name: "Shanghai", lat: 31.2304, lng: 121.4737, country: "CN" },
  { name: "Seoul", lat: 37.5665, lng: 126.9780, country: "KR" },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018, country: "TH" },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, country: "SG" },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694, country: "HK" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, country: "IN" },
  { name: "Delhi", lat: 28.7041, lng: 77.1025, country: "IN" },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, country: "AE" },
  { name: "Riyadh", lat: 24.7136, lng: 46.6753, country: "SA" },
  { name: "Tehran", lat: 35.6892, lng: 51.3890, country: "IR" },
  { name: "Baghdad", lat: 33.3152, lng: 44.3661, country: "IQ" },
  { name: "Damascus", lat: 33.5138, lng: 36.2765, country: "SY" },
  { name: "Beirut", lat: 33.8938, lng: 35.5018, country: "LB" },
  { name: "Amman", lat: 31.9454, lng: 35.9284, country: "JO" },
  { name: "Jerusalem", lat: 31.7683, lng: 35.2137, country: "IL" },
  { name: "Doha", lat: 25.2854, lng: 51.5310, country: "QA" },
  { name: "Kuwait City", lat: 29.3759, lng: 47.9774, country: "KW" },
  { name: "Muscat", lat: 23.5880, lng: 58.3829, country: "OM" },
  { name: "Islamabad", lat: 33.6844, lng: 73.0479, country: "PK" },
  { name: "Kabul", lat: 34.5553, lng: 69.2075, country: "AF" },
  { name: "Tashkent", lat: 41.2995, lng: 69.2401, country: "UZ" },
  { name: "Almaty", lat: 43.2220, lng: 76.8512, country: "KZ" },
  { name: "Jakarta", lat: -6.2088, lng: 106.8456, country: "ID" },
  { name: "Manila", lat: 14.5995, lng: 120.9842, country: "PH" },
  { name: "Hanoi", lat: 21.0278, lng: 105.8342, country: "VN" },
  { name: "Kuala Lumpur", lat: 3.1390, lng: 101.6869, country: "MY" },

  // ============================================================
  // AFRICA
  // ============================================================
  { name: "Cairo", lat: 30.0444, lng: 31.2357, country: "EG" },
  { name: "Johannesburg", lat: -26.2041, lng: 28.0473, country: "ZA" },
  { name: "Lagos", lat: 6.5244, lng: 3.3792, country: "NG" },
  { name: "Nairobi", lat: -1.2921, lng: 36.8219, country: "KE" },
  { name: "Casablanca", lat: 33.5731, lng: -7.5898, country: "MA" },
  { name: "Tunis", lat: 36.8065, lng: 10.1815, country: "TN" },
  { name: "Algiers", lat: 36.7538, lng: 3.0588, country: "DZ" },
  { name: "Addis Ababa", lat: 9.0250, lng: 38.7469, country: "ET" },
  { name: "Accra", lat: 5.6037, lng: -0.1870, country: "GH" },
  { name: "Dakar", lat: 14.7167, lng: -17.4677, country: "SN" },

  // ============================================================
  // OCEANIA
  // ============================================================
  { name: "Sydney", lat: -33.8688, lng: 151.2093, country: "AU" },
  { name: "Melbourne", lat: -37.8136, lng: 144.9631, country: "AU" },
  { name: "Auckland", lat: -36.8485, lng: 174.7633, country: "NZ" },
  { name: "Wellington", lat: -41.2865, lng: 174.7762, country: "NZ" }
];


// ============================================================
// Turkish character normalization map
// Handles: İ->i, I->i, ı->i, Ş->s, ş->s, Ç->c, ç->c,
//          Ğ->g, ğ->g, Ö->o, ö->o, Ü->u, ü->u
// ============================================================
const TR_CHAR_MAP = {
  '\u00c7': 'c', // Ç
  '\u00e7': 'c', // ç
  '\u011e': 'g', // Ğ
  '\u011f': 'g', // ğ
  '\u0130': 'i', // İ
  '\u0131': 'i', // ı
  '\u00d6': 'o', // Ö
  '\u00f6': 'o', // ö
  '\u015e': 's', // Ş
  '\u015f': 's', // ş
  '\u00dc': 'u', // Ü
  '\u00fc': 'u', // ü
  'I': 'i',
  '\u0049': 'i' // I (standard uppercase I also maps to i)
};

/**
 * Normalize a string for Turkish-aware comparison.
 * Converts Turkish special characters to their ASCII equivalents
 * and lowercases the result.
 * @param {string} str - Input string
 * @returns {string} Normalized lowercase ASCII string
 */
function normalizeTurkish(str) {
  if (!str) return '';
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    result += TR_CHAR_MAP[ch] || ch.toLowerCase();
  }
  return result;
}

/**
 * Search cities by query string with Turkish character support.
 * Turkish cities are prioritized in results.
 *
 * @param {string} query - Search string (minimum 2 characters to return results)
 * @returns {Array} Array of matching city objects, max 10 results
 */
function searchCities(query) {
  if (!query || query.length < 2) return [];

  const normalizedQuery = normalizeTurkish(query.trim());
  if (normalizedQuery.length < 2) return [];

  const turkishMatches = [];
  const worldMatches = [];

  for (let i = 0; i < CITIES.length; i++) {
    const city = CITIES[i];
    const normalizedName = normalizeTurkish(city.name);

    if (normalizedName.indexOf(normalizedQuery) !== -1) {
      if (city.country === 'TR') {
        turkishMatches.push(city);
      } else {
        worldMatches.push(city);
      }
    }
  }

  // Sort each group: exact start-of-name matches first, then alphabetically
  const sortFn = function (a, b) {
    const aNorm = normalizeTurkish(a.name);
    const bNorm = normalizeTurkish(b.name);
    const aStarts = aNorm.indexOf(normalizedQuery) === 0 ? 0 : 1;
    const bStarts = bNorm.indexOf(normalizedQuery) === 0 ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return aNorm.localeCompare(bNorm);
  };

  turkishMatches.sort(sortFn);
  worldMatches.sort(sortFn);

  // Turkish cities first, then world cities, max 10 total
  const combined = turkishMatches.concat(worldMatches);
  return combined.slice(0, 10);
}

/**
 * Get a city object by its exact name.
 * Comparison is Turkish-character-aware (case and diacritic insensitive).
 *
 * @param {string} name - City name to look up
 * @returns {Object|null} The city object or null if not found
 */
function getCityByName(name) {
  if (!name) return null;
  const normalizedInput = normalizeTurkish(name.trim());

  for (let i = 0; i < CITIES.length; i++) {
    if (normalizeTurkish(CITIES[i].name) === normalizedInput) {
      return CITIES[i];
    }
  }
  return null;
}
