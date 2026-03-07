// ============================================================================
// astro-engine.js - Astronomical Calculation Engine
// Pure vanilla JavaScript, no dependencies.
// Implements natal birth chart calculations for ecliptic longitudes of
// Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Ascendant, Houses,
// and inter-planet aspects.
//
// References:
//   Jean Meeus, "Astronomical Algorithms", 2nd ed.
//   Chapront-Touze & Chapront, lunar theory (simplified)
// ============================================================================

// ---------------------------------------------------------------------------
// 1. Utility Functions
// ---------------------------------------------------------------------------

function degToRad(deg) {
    return deg * (Math.PI / 180);
}

function radToDeg(rad) {
    return rad * (180 / Math.PI);
}

function normalize360(deg) {
    var result = deg % 360;
    if (result < 0) result += 360;
    return result;
}

// ---------------------------------------------------------------------------
// 2. Julian Day Conversion (Meeus Chapter 7)
// ---------------------------------------------------------------------------

/**
 * Converts a calendar date/time (UT) to Julian Day Number.
 * Valid for dates after the Gregorian reform (15 Oct 1582).
 *
 * @param {number} year  - Full year (e.g. 2000)
 * @param {number} month - Month 1-12
 * @param {number} day   - Day 1-31
 * @param {number} hour  - Hour 0-23
 * @param {number} minute - Minute 0-59
 * @returns {number} Julian Day Number (fractional)
 */
function dateToJD(year, month, day, hour, minute) {
    var y = year;
    var m = month;
    if (m <= 2) {
        y = y - 1;
        m = m + 12;
    }
    var dayFrac = day + (hour + minute / 60.0) / 24.0;
    var A = Math.floor(y / 100);
    var B = 2 - A + Math.floor(A / 4);
    var jd = Math.floor(365.25 * (y + 4716))
           + Math.floor(30.6001 * (m + 1))
           + dayFrac + B - 1524.5;
    return jd;
}

// ---------------------------------------------------------------------------
// Helper: Julian centuries from J2000.0
// ---------------------------------------------------------------------------

function julianCenturies(jd) {
    return (jd - 2451545.0) / 36525.0;
}

// ---------------------------------------------------------------------------
// 3. Sun Position (Meeus Chapter 25 - low accuracy, ~0.01 deg)
// ---------------------------------------------------------------------------

/**
 * Returns the apparent ecliptic longitude of the Sun in degrees (0-360).
 *
 * Uses the geometric mean longitude, mean anomaly, equation of center,
 * and a first-order nutation correction.
 *
 * @param {number} jd - Julian Day Number
 * @returns {number} Ecliptic longitude in degrees
 */
function sunLongitude(jd) {
    var T = julianCenturies(jd);

    // Geometric mean longitude of the Sun (degrees), referred to the mean equinox of date
    var L0 = normalize360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);

    // Mean anomaly of the Sun (degrees)
    var M = normalize360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    var Mrad = degToRad(M);

    // Equation of center (degrees)
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);

    // Sun's true longitude
    var sunTrue = L0 + C;

    // Longitude of the ascending node of the Moon's mean orbit (for nutation)
    var omega = normalize360(125.04 - 1934.136 * T);
    var omegaRad = degToRad(omega);

    // Apparent longitude (nutation + aberration correction)
    var apparent = sunTrue - 0.00569 - 0.00478 * Math.sin(omegaRad);

    return normalize360(apparent);
}

// ---------------------------------------------------------------------------
// 4. Moon Position (Simplified Chapront, ~15 periodic terms)
// ---------------------------------------------------------------------------

/**
 * Returns the ecliptic longitude of the Moon in degrees (0-360).
 * Uses approximately 15 of the largest periodic terms from the
 * Chapront ELP theory, yielding accuracy of roughly 0.5-1 degree.
 *
 * @param {number} jd - Julian Day Number
 * @returns {number} Ecliptic longitude in degrees
 */
function moonLongitude(jd) {
    var T = julianCenturies(jd);

    // Fundamental arguments (degrees)
    // Moon's mean longitude, referred to the mean equinox of date
    var Lp = normalize360(218.3165 + 481267.8813 * T);

    // Moon's mean elongation
    var D = normalize360(297.8502 + 445267.1115 * T);

    // Sun's mean anomaly
    var M = normalize360(357.5291 + 35999.0503 * T);

    // Moon's mean anomaly
    var Mp = normalize360(134.9634 + 477198.8676 * T);

    // Moon's argument of latitude
    var F = normalize360(93.2720 + 483202.0175 * T);

    // Convert to radians for trig
    var Dr  = degToRad(D);
    var Mr  = degToRad(M);
    var Mpr = degToRad(Mp);
    var Fr  = degToRad(F);

    // Sum of longitude periodic terms (in degrees)
    // Coefficients: [D_mult, M_mult, Mp_mult, F_mult, sin_coeff (degrees)]
    // These are the largest terms from the ELP/MPP02 series.
    var terms = [
        [0,  0,  1,  0,  6.289],
        [2,  0, -1,  0,  1.274],
        [2,  0,  0,  0,  0.658],
        [0,  0,  2,  0,  0.214],
        [0,  1,  0,  0, -0.186],
        [0,  0,  0,  2, -0.114],
        [2,  0, -2,  0, -0.059],
        [2, -1, -1,  0,  0.057],
        [2,  0,  1,  0,  0.053],
        [2, -1,  0,  0,  0.046],
        [0,  1, -1,  0, -0.041],
        [1,  0,  0,  0, -0.035],
        [0,  1,  1,  0, -0.030],
        [2,  0,  0, -2, -0.015],
        [0,  0,  1,  2, -0.012]
    ];

    var sumL = 0;
    for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        var arg = t[0] * Dr + t[1] * Mr + t[2] * Mpr + t[3] * Fr;
        sumL += t[4] * Math.sin(arg);
    }

    var moonLon = Lp + sumL;

    return normalize360(moonLon);
}

// ---------------------------------------------------------------------------
// 5. Planetary Positions (Meeus simplified method)
// ---------------------------------------------------------------------------

/**
 * Orbital elements at J2000.0 and their rates (per Julian century).
 * L0 = mean longitude at epoch (degrees)
 * Lrate = rate of mean longitude (degrees per Julian century)
 * perihelion_L = longitude of perihelion at epoch (degrees)
 * e = eccentricity
 * a = semi-major axis (AU)
 * node = longitude of ascending node (degrees, not used in longitude calc)
 */
var ORBITAL_ELEMENTS = {
    mercury: {
        a: 0.387098,
        e: 0.205635,
        L0: 252.2509,
        Lrate: 149472.6746,
        perihelion_L: 77.4561,
        perihelion_rate: 0.1588,
        node: 48.3309
    },
    venus: {
        a: 0.723332,
        e: 0.006773,
        L0: 181.9798,
        Lrate: 58517.8157,
        perihelion_L: 131.5637,
        perihelion_rate: 0.0048,
        node: 76.6799
    },
    earth: {
        a: 1.000001,
        e: 0.016709,
        L0: 100.4665,
        Lrate: 35999.3728,
        perihelion_L: 102.9373,
        perihelion_rate: 0.3225
    },
    mars: {
        a: 1.523679,
        e: 0.093400,
        L0: 355.4330,
        Lrate: 19140.2993,
        perihelion_L: 336.0602,
        perihelion_rate: 0.4439,
        node: 49.5581
    },
    jupiter: {
        a: 5.202887,
        e: 0.048498,
        L0: 34.3515,
        Lrate: 3034.9057,
        perihelion_L: 14.3312,
        perihelion_rate: 0.2155,
        node: 100.4644
    },
    saturn: {
        a: 9.536676,
        e: 0.055509,
        L0: 50.0774,
        Lrate: 1222.1138,
        perihelion_L: 93.0572,
        perihelion_rate: 0.7756,
        node: 113.6655
    }
};

/**
 * Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly E.
 * Uses Newton-Raphson iteration.
 *
 * @param {number} M_deg - Mean anomaly in degrees
 * @param {number} e     - Eccentricity
 * @returns {number} Eccentric anomaly in degrees
 */
function solveKepler(M_deg, e) {
    var M = degToRad(normalize360(M_deg));
    var E = M; // initial guess
    for (var i = 0; i < 15; i++) {
        var dE = (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
        E += dE;
        if (Math.abs(dE) < 1e-12) break;
    }
    return radToDeg(E);
}

/**
 * Compute heliocentric ecliptic longitude and radius vector for a planet.
 *
 * @param {number} jd         - Julian Day Number
 * @param {string} planetName - Key into ORBITAL_ELEMENTS
 * @returns {{ lon: number, r: number }} Heliocentric longitude (deg) and distance (AU)
 */
function heliocentricPosition(jd, planetName) {
    var T = julianCenturies(jd);
    var el = ORBITAL_ELEMENTS[planetName];

    // Mean longitude
    var L = normalize360(el.L0 + el.Lrate * T);

    // Longitude of perihelion
    var w = el.perihelion_L + (el.perihelion_rate || 0) * T;

    // Mean anomaly
    var M = normalize360(L - w);

    // Eccentric anomaly via Kepler's equation
    var E_deg = solveKepler(M, el.e);
    var E_rad = degToRad(E_deg);

    // True anomaly
    var sinV = Math.sqrt(1 - el.e * el.e) * Math.sin(E_rad) / (1 - el.e * Math.cos(E_rad));
    var cosV = (Math.cos(E_rad) - el.e) / (1 - el.e * Math.cos(E_rad));
    var v = radToDeg(Math.atan2(sinV, cosV));

    // Heliocentric longitude
    var helioLon = normalize360(v + w);

    // Radius vector (distance from Sun in AU)
    var r = el.a * (1 - el.e * el.e) / (1 + el.e * Math.cos(degToRad(v)));

    return { lon: helioLon, r: r };
}

/**
 * Compute the geocentric ecliptic longitude of a planet.
 *
 * For inner planets (Mercury, Venus) and outer planets (Mars, Jupiter, Saturn),
 * we convert from heliocentric to geocentric coordinates using the Earth's
 * heliocentric position.
 *
 * @param {number} jd         - Julian Day Number
 * @param {string} planetName - 'mercury', 'venus', 'mars', 'jupiter', 'saturn'
 * @returns {number} Geocentric ecliptic longitude in degrees (0-360)
 */
function planetLongitude(jd, planetName) {
    // Earth's heliocentric position
    var earth = heliocentricPosition(jd, 'earth');
    var lE = degToRad(earth.lon);
    var rE = earth.r;

    // Planet's heliocentric position
    var planet = heliocentricPosition(jd, planetName);
    var lP = degToRad(planet.lon);
    var rP = planet.r;

    // Convert heliocentric to geocentric ecliptic longitude.
    // The geocentric position vector in the ecliptic plane is:
    //   x = rP * cos(lP) - rE * cos(lE)
    //   y = rP * sin(lP) - rE * sin(lE)
    // geocentric longitude = atan2(y, x)
    var x = rP * Math.cos(lP) - rE * Math.cos(lE);
    var y = rP * Math.sin(lP) - rE * Math.sin(lE);
    var geoLon = radToDeg(Math.atan2(y, x));

    return normalize360(geoLon);
}

// ---------------------------------------------------------------------------
// 6. Ascendant Calculation
// ---------------------------------------------------------------------------

/**
 * Compute the obliquity of the ecliptic (degrees).
 * @param {number} jd - Julian Day Number
 * @returns {number} Obliquity in degrees
 */
function obliquityEcliptic(jd) {
    var T = julianCenturies(jd);
    // Meeus eq. 22.2 (simplified)
    return 23.4393 - 0.0130 * T;
}

/**
 * Compute Greenwich Mean Sidereal Time in degrees.
 * Meeus Chapter 12.
 *
 * @param {number} jd - Julian Day Number (UT)
 * @returns {number} GMST in degrees (0-360)
 */
function greenwichMeanSiderealTime(jd) {
    var T = julianCenturies(jd);
    // Meeus eq. 12.4 gives GMST in degrees
    var gmst = 280.46061837
             + 360.98564736629 * (jd - 2451545.0)
             + 0.000387933 * T * T
             - (T * T * T) / 38710000.0;
    return normalize360(gmst);
}

/**
 * Compute Local Sidereal Time in degrees.
 *
 * @param {number} jd        - Julian Day Number (UT)
 * @param {number} longitude - Geographic longitude in degrees (east positive)
 * @returns {number} LST in degrees (0-360)
 */
function localSiderealTime(jd, longitude) {
    var gmst = greenwichMeanSiderealTime(jd);
    return normalize360(gmst + longitude);
}

/**
 * Compute the Ascendant (ecliptic longitude of the eastern horizon).
 *
 * Formula (Meeus / standard):
 *   tan(ASC) = -cos(LST) / (sin(eps)*tan(lat) + cos(eps)*sin(LST))
 *   ASC = atan2(-cos(LST), sin(eps)*tan(lat) + cos(eps)*sin(LST))
 *
 * @param {number} jd        - Julian Day Number (UT)
 * @param {number} latitude  - Geographic latitude in degrees (north positive)
 * @param {number} longitude - Geographic longitude in degrees (east positive)
 * @returns {number} Ascendant ecliptic longitude in degrees (0-360)
 */
function calcAscendant(jd, latitude, longitude) {
    var eps = degToRad(obliquityEcliptic(jd));
    var lst = degToRad(localSiderealTime(jd, longitude));
    var lat = degToRad(latitude);

    var y = -Math.cos(lst);
    var x = Math.sin(eps) * Math.tan(lat) + Math.cos(eps) * Math.sin(lst);
    var asc = radToDeg(Math.atan2(y, x));

    return normalize360(asc);
}

// ---------------------------------------------------------------------------
// 7. House Cusps (Equal House System)
// ---------------------------------------------------------------------------

/**
 * Compute 12 house cusps using the Equal House system.
 * Each house spans exactly 30 degrees starting from the Ascendant.
 *
 * @param {number} ascendant - Ascendant longitude in degrees
 * @returns {number[]} Array of 12 house cusp longitudes
 */
function calcHouses(ascendant) {
    var houses = [];
    for (var i = 0; i < 12; i++) {
        houses.push(normalize360(ascendant + i * 30));
    }
    return houses;
}

// ---------------------------------------------------------------------------
// 8. Aspect Calculation
// ---------------------------------------------------------------------------

/**
 * Aspect definitions: name, exact angle, default orb, display color.
 */
var ASPECT_DEFS = [
    { name: 'Kavusma',   angle: 0,   orb: 8, color: '#f0c040' },  // Conjunction
    { name: 'Sekstil',   angle: 60,  orb: 6, color: '#4de8e0' },  // Sextile
    { name: 'Kare',      angle: 90,  orb: 7, color: '#ff6b9d' },  // Square
    { name: 'Ucgen',     angle: 120, orb: 8, color: '#4de8e0' },  // Trine
    { name: 'Karsilik',  angle: 180, orb: 8, color: '#ff6b9d' }   // Opposition
];

/**
 * Compute the angular separation between two ecliptic longitudes,
 * measured as the shortest arc (0 to 180).
 */
function angularSeparation(lon1, lon2) {
    var diff = Math.abs(lon1 - lon2) % 360;
    if (diff > 180) diff = 360 - diff;
    return diff;
}

/**
 * Calculate aspects between all pairs of planets.
 *
 * @param {Object} planets - Object mapping planet key to ecliptic longitude
 *                           e.g. { gunes: 280.5, ay: 45.2, ... }
 * @returns {Array} Array of aspect objects:
 *   { planet1, planet2, type, angle, exactDiff, color }
 *   - planet1, planet2: planet keys
 *   - type: aspect name (Turkish)
 *   - angle: exact aspect angle (0, 60, 90, 120, 180)
 *   - exactDiff: actual angular separation
 *   - color: hex color string
 */
function calcAspects(planets) {
    var keys = Object.keys(planets);
    var aspects = [];

    for (var i = 0; i < keys.length; i++) {
        for (var j = i + 1; j < keys.length; j++) {
            var p1 = keys[i];
            var p2 = keys[j];
            var sep = angularSeparation(planets[p1], planets[p2]);

            for (var a = 0; a < ASPECT_DEFS.length; a++) {
                var asp = ASPECT_DEFS[a];
                var diff = Math.abs(sep - asp.angle);
                if (diff <= asp.orb) {
                    aspects.push({
                        planet1: p1,
                        planet2: p2,
                        type: asp.name,
                        angle: asp.angle,
                        exactDiff: Math.round(sep * 100) / 100,
                        color: asp.color
                    });
                    break; // only one aspect per pair
                }
            }
        }
    }

    return aspects;
}

// ---------------------------------------------------------------------------
// 9. Zodiac Sign Data
// ---------------------------------------------------------------------------

var ZODIAC_SIGNS = [
    { index: 0,  name: "Koç",      symbol: "\u2648", english: "Aries",       element: "Ateş"   },
    { index: 1,  name: "Boğa",    symbol: "\u2649", english: "Taurus",      element: "Toprak" },
    { index: 2,  name: "İkizler", symbol: "\u264A", english: "Gemini",      element: "Hava"   },
    { index: 3,  name: "Yengeç",  symbol: "\u264B", english: "Cancer",      element: "Su"     },
    { index: 4,  name: "Aslan",   symbol: "\u264C", english: "Leo",         element: "Ateş"   },
    { index: 5,  name: "Başak",   symbol: "\u264D", english: "Virgo",       element: "Toprak" },
    { index: 6,  name: "Terazi",  symbol: "\u264E", english: "Libra",       element: "Hava"   },
    { index: 7,  name: "Akrep",   symbol: "\u264F", english: "Scorpio",     element: "Su"     },
    { index: 8,  name: "Yay",     symbol: "\u2650", english: "Sagittarius", element: "Ateş"   },
    { index: 9,  name: "Oğlak",   symbol: "\u2651", english: "Capricorn",   element: "Toprak" },
    { index: 10, name: "Kova",    symbol: "\u2652", english: "Aquarius",    element: "Hava"   },
    { index: 11, name: "Balık",   symbol: "\u2653", english: "Pisces",      element: "Su"     }
];

var PLANET_SYMBOLS = {
    gunes:   "\u2609",  // Sun
    ay:      "\u263D",  // Moon
    merkur:  "\u263F",  // Mercury
    venus:   "\u2640",  // Venus
    mars:    "\u2642",  // Mars
    jupiter: "\u2643",  // Jupiter
    saturn:  "\u2644"   // Saturn
};

/**
 * Determine which zodiac sign a given ecliptic longitude falls in.
 *
 * @param {number} longitude - Ecliptic longitude in degrees (0-360)
 * @returns {Object} The matching ZODIAC_SIGNS element
 */
function getZodiacSign(longitude) {
    var lon = normalize360(longitude);
    var idx = Math.floor(lon / 30);
    if (idx >= 12) idx = 11; // safety clamp
    return ZODIAC_SIGNS[idx];
}

/**
 * Return the degree within the zodiac sign (0-30) for a given longitude.
 *
 * @param {number} longitude - Ecliptic longitude in degrees
 * @returns {number} Degree within the sign (0 to <30)
 */
function getSignDegree(longitude) {
    var lon = normalize360(longitude);
    return lon % 30;
}

// ---------------------------------------------------------------------------
// 10. Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Calculate a complete natal birth chart.
 *
 * @param {number} year      - Birth year
 * @param {number} month     - Birth month (1-12)
 * @param {number} day       - Birth day (1-31)
 * @param {number} hour      - Birth hour (0-23, UT)
 * @param {number} minute    - Birth minute (0-59)
 * @param {number} latitude  - Birth latitude in degrees (north positive)
 * @param {number} longitude - Birth longitude in degrees (east positive)
 * @returns {Object} Chart data:
 *   {
 *     planets:   { gunes, ay, merkur, venus, mars, jupiter, saturn },
 *     ascendant: number,
 *     houses:    number[12],
 *     aspects:   Array<{ planet1, planet2, type, angle, exactDiff, color }>
 *   }
 */
function calculateBirthChart(year, month, day, hour, minute, latitude, longitude) {
    var jd = dateToJD(year, month, day, hour, minute);

    var planets = {
        gunes:   sunLongitude(jd),
        ay:      moonLongitude(jd),
        merkur:  planetLongitude(jd, 'mercury'),
        venus:   planetLongitude(jd, 'venus'),
        mars:    planetLongitude(jd, 'mars'),
        jupiter: planetLongitude(jd, 'jupiter'),
        saturn:  planetLongitude(jd, 'saturn')
    };

    var ascendant = calcAscendant(jd, latitude, longitude);
    var houses = calcHouses(ascendant);
    var aspects = calcAspects(planets);

    return {
        planets: planets,
        ascendant: ascendant,
        houses: houses,
        aspects: aspects
    };
}

// ---------------------------------------------------------------------------
// Test Function
// ---------------------------------------------------------------------------

function testAstroEngine() {
    console.log('=== Astro Engine Test Suite ===');
    console.log('');

    // -----------------------------------------------------------------------
    // Test 1: Julian Day at J2000.0 epoch
    // J2000.0 = Jan 1.5, 2000 UT = JD 2451545.0
    // -----------------------------------------------------------------------
    var jd_j2000 = dateToJD(2000, 1, 1, 12, 0);
    console.log('Test 1: J2000.0 Julian Day');
    console.log('  Expected: 2451545.0');
    console.log('  Got:      ' + jd_j2000);
    console.log('  Pass:     ' + (Math.abs(jd_j2000 - 2451545.0) < 0.0001));
    console.log('');

    // -----------------------------------------------------------------------
    // Test 2: JD for a known date
    // 1999 Dec 31 0h UT => JD 2451543.5 (Meeus example)
    // -----------------------------------------------------------------------
    var jd_test2 = dateToJD(1999, 12, 31, 0, 0);
    console.log('Test 2: JD for 1999-12-31 0h UT');
    console.log('  Expected: 2451543.5');
    console.log('  Got:      ' + jd_test2);
    console.log('  Pass:     ' + (Math.abs(jd_test2 - 2451543.5) < 0.0001));
    console.log('');

    // -----------------------------------------------------------------------
    // Test 3: Sun longitude at J2000.0
    // On Jan 1.5, 2000 the Sun should be near ~280.5 deg (Capricorn ~10)
    // -----------------------------------------------------------------------
    var sunJ2000 = sunLongitude(jd_j2000);
    console.log('Test 3: Sun longitude at J2000.0');
    console.log('  Expected: ~280.5 deg (Capricorn ~10)');
    console.log('  Got:      ' + sunJ2000.toFixed(4) + ' deg');
    console.log('  Sign:     ' + getZodiacSign(sunJ2000).name + ' ' + getSignDegree(sunJ2000).toFixed(2) + ' deg');
    console.log('  Pass:     ' + (Math.abs(sunJ2000 - 280.5) < 1.0));
    console.log('');

    // -----------------------------------------------------------------------
    // Test 4: Sun longitude on March 20, 2000 (near vernal equinox)
    // Sun should be near 0 deg (Aries 0)
    // -----------------------------------------------------------------------
    var jd_equinox = dateToJD(2000, 3, 20, 7, 30);
    var sunEquinox = sunLongitude(jd_equinox);
    console.log('Test 4: Sun near Vernal Equinox (2000-03-20 ~07:30 UT)');
    console.log('  Expected: ~0 deg (Aries 0)');
    console.log('  Got:      ' + sunEquinox.toFixed(4) + ' deg');
    console.log('  Pass:     ' + (sunEquinox < 1.0 || sunEquinox > 359.0));
    console.log('');

    // -----------------------------------------------------------------------
    // Test 5: Moon longitude at J2000.0
    // Approx ~218 deg expected
    // -----------------------------------------------------------------------
    var moonJ2000 = moonLongitude(jd_j2000);
    console.log('Test 5: Moon longitude at J2000.0');
    console.log('  Expected: approx 218 deg area');
    console.log('  Got:      ' + moonJ2000.toFixed(4) + ' deg');
    console.log('  Sign:     ' + getZodiacSign(moonJ2000).name + ' ' + getSignDegree(moonJ2000).toFixed(2) + ' deg');
    console.log('');

    // -----------------------------------------------------------------------
    // Test 6: Planetary longitudes at J2000.0
    // Approximate expected values (geocentric ecliptic):
    //   Mercury: ~271 deg (Capricorn area)
    //   Venus:   ~241 deg (Sagittarius area)
    //   Mars:    ~327 deg (Pisces area / Aquarius area)
    //   Jupiter: ~025 deg (Aries area)
    //   Saturn:  ~040 deg (Taurus area)
    // -----------------------------------------------------------------------
    console.log('Test 6: Planet longitudes at J2000.0 (geocentric)');
    var planetTests = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    for (var i = 0; i < planetTests.length; i++) {
        var pname = planetTests[i];
        var plon = planetLongitude(jd_j2000, pname);
        var psign = getZodiacSign(plon);
        var pdeg = getSignDegree(plon);
        console.log('  ' + pname + ': ' + plon.toFixed(4) + ' deg (' + psign.name + ' ' + pdeg.toFixed(2) + ')');
    }
    console.log('');

    // -----------------------------------------------------------------------
    // Test 7: GMST at J2000.0
    // At J2000.0 (2000 Jan 1.5 UT), GMST should be ~280.46 deg (= 18h 41m)
    // -----------------------------------------------------------------------
    var gmstJ2000 = greenwichMeanSiderealTime(jd_j2000);
    console.log('Test 7: GMST at J2000.0');
    console.log('  Expected: ~280.46 deg');
    console.log('  Got:      ' + gmstJ2000.toFixed(4) + ' deg');
    console.log('  Pass:     ' + (Math.abs(gmstJ2000 - 280.46) < 0.5));
    console.log('');

    // -----------------------------------------------------------------------
    // Test 8: Ascendant for a known birth (Istanbul, 2000-01-01 12:00 UT)
    // Istanbul: lat=41.0082, lon=28.9784
    // -----------------------------------------------------------------------
    var ascIstanbul = calcAscendant(jd_j2000, 41.0082, 28.9784);
    console.log('Test 8: Ascendant for Istanbul at J2000.0 noon');
    console.log('  Got:  ' + ascIstanbul.toFixed(4) + ' deg');
    console.log('  Sign: ' + getZodiacSign(ascIstanbul).name + ' ' + getSignDegree(ascIstanbul).toFixed(2) + ' deg');
    console.log('');

    // -----------------------------------------------------------------------
    // Test 9: Houses from Ascendant
    // -----------------------------------------------------------------------
    var houses = calcHouses(ascIstanbul);
    console.log('Test 9: Equal House cusps from Ascendant ' + ascIstanbul.toFixed(2) + ' deg');
    for (var h = 0; h < 12; h++) {
        console.log('  House ' + (h + 1) + ': ' + houses[h].toFixed(2) + ' deg (' + getZodiacSign(houses[h]).name + ')');
    }
    console.log('');

    // -----------------------------------------------------------------------
    // Test 10: Full birth chart
    // Test person: 1990-08-15 14:30 UT, Istanbul
    // -----------------------------------------------------------------------
    console.log('Test 10: Full birth chart (1990-08-15 14:30 UT, Istanbul)');
    var chart = calculateBirthChart(1990, 8, 15, 14, 30, 41.0082, 28.9784);
    console.log('  Planets:');
    var pkeys = Object.keys(chart.planets);
    for (var k = 0; k < pkeys.length; k++) {
        var pk = pkeys[k];
        var pv = chart.planets[pk];
        console.log('    ' + PLANET_SYMBOLS[pk] + ' ' + pk + ': '
            + pv.toFixed(4) + ' deg ('
            + getZodiacSign(pv).name + ' '
            + getSignDegree(pv).toFixed(2) + ')');
    }
    console.log('  Ascendant: ' + chart.ascendant.toFixed(4) + ' deg ('
        + getZodiacSign(chart.ascendant).name + ' '
        + getSignDegree(chart.ascendant).toFixed(2) + ')');
    console.log('  Houses:');
    for (var h2 = 0; h2 < 12; h2++) {
        console.log('    ' + (h2 + 1) + ': ' + chart.houses[h2].toFixed(2)
            + ' (' + getZodiacSign(chart.houses[h2]).symbol + ' '
            + getZodiacSign(chart.houses[h2]).name + ')');
    }
    console.log('  Aspects (' + chart.aspects.length + '):');
    for (var ai = 0; ai < chart.aspects.length; ai++) {
        var asp = chart.aspects[ai];
        console.log('    ' + asp.planet1 + ' ' + asp.type + ' ' + asp.planet2
            + ' (exact: ' + asp.exactDiff + ' deg, aspect: ' + asp.angle + ' deg)');
    }
    console.log('');

    // -----------------------------------------------------------------------
    // Test 11: Kepler's equation
    // For e=0, E should equal M
    // For small e, E should be close to M
    // -----------------------------------------------------------------------
    console.log('Test 11: Kepler equation solver');
    var kepler1 = solveKepler(45, 0.0);
    console.log('  M=45, e=0 => E=' + kepler1.toFixed(6) + ' (expect 45)');
    console.log('  Pass: ' + (Math.abs(kepler1 - 45) < 0.001));
    var kepler2 = solveKepler(45, 0.1);
    // Verify: M = E - e*sin(E)
    var M_check = kepler2 - radToDeg(0.1 * Math.sin(degToRad(kepler2)));
    console.log('  M=45, e=0.1 => E=' + kepler2.toFixed(6) + ', verify M=' + M_check.toFixed(6));
    console.log('  Pass: ' + (Math.abs(M_check - 45) < 0.001));
    console.log('');

    // -----------------------------------------------------------------------
    // Test 12: normalize360 edge cases
    // -----------------------------------------------------------------------
    console.log('Test 12: normalize360 edge cases');
    console.log('  -30   => ' + normalize360(-30)   + ' (expect 330)  Pass: ' + (normalize360(-30) === 330));
    console.log('  370   => ' + normalize360(370)   + ' (expect 10)   Pass: ' + (normalize360(370) === 10));
    console.log('  0     => ' + normalize360(0)     + ' (expect 0)    Pass: ' + (normalize360(0) === 0));
    console.log('  360   => ' + normalize360(360)   + ' (expect 0)    Pass: ' + (normalize360(360) === 0));
    console.log('  720   => ' + normalize360(720)   + ' (expect 0)    Pass: ' + (normalize360(720) === 0));
    console.log('  -360  => ' + normalize360(-360)  + ' (expect 0)    Pass: ' + (normalize360(-360) === 0));
    console.log('');

    console.log('=== Tests complete ===');
}
