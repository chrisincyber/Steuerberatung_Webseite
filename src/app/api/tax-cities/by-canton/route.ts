import { NextRequest, NextResponse } from 'next/server'

const ESTV_BASE =
  'https://swisstaxcalculator.estv.admin.ch/delegate/ost-integration/v1/lg-proxy/operation/c3b67379_ESTV'

interface EstvCity {
  TaxLocationID: number
  ZipCode: string
  BfsID: number
  CantonID: number
  BfsName: string
  City: string
  Canton: string
}

interface NormalizedCity {
  id: number
  zipCode: string
  name: string
  cantonCode: string
  bfsId: number
}

// Zip code prefix ranges for each canton (covers all municipalities)
const CANTON_ZIP_PREFIXES: Record<string, string[]> = {
  ZH: ['80', '81', '82', '83', '84', '85', '86', '87', '88'],
  BE: ['10', '12', '13', '14', '15', '16', '17', '18', '19', '25', '26', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39'],
  LU: ['60', '61', '62', '63'],
  UR: ['64'],
  SZ: ['64', '65', '66', '84'],
  OW: ['60', '61'],
  NW: ['63', '64'],
  GL: ['87'],
  ZG: ['63'],
  FR: ['16', '17', '31', '32', '33'],
  SO: ['25', '26', '32', '45', '46', '47'],
  BS: ['40'],
  BL: ['40', '41', '42', '43', '44', '45'],
  SH: ['82', '81'],
  AR: ['90', '91'],
  AI: ['90', '91'],
  SG: ['71', '72', '73', '74', '86', '87', '88', '89', '90', '91', '93', '94', '95'],
  GR: ['70', '71', '72', '73', '74', '75', '76'],
  AG: ['40', '42', '43', '46', '47', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '80'],
  TG: ['83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95'],
  TI: ['64', '65', '66', '67', '68', '69'],
  VD: ['10', '11', '12', '13', '14', '15', '18', '19', '13'],
  VS: ['19', '27', '29', '36', '37', '38', '39'],
  NE: ['20', '21', '22', '23', '24'],
  GE: ['12', '12', '12', '12'],
  JU: ['28', '29', '23', '24'],
}

// Fallback: named search terms for cantons where zip prefixes may miss some
const CANTON_SEARCH_TERMS: Record<string, string[]> = {
  AG: ['Aarau', 'Baden', 'Wettingen', 'Brugg', 'Lenzburg', 'Rheinfelden', 'Wohlen', 'Zofingen', 'Oftringen'],
  AI: ['Appenzell'],
  AR: ['Herisau', 'Teufen', 'Speicher', 'Heiden', 'Bühler'],
  BE: ['Bern', 'Thun', 'Biel', 'Burgdorf', 'Langenthal', 'Interlaken', 'Spiez', 'Köniz', 'Muri', 'Steffisburg', 'Worb', 'Münsingen', 'Lyss'],
  BL: ['Liestal', 'Allschwil', 'Reinach', 'Muttenz', 'Binningen', 'Pratteln', 'Oberwil', 'Münchenstein', 'Birsfelden', 'Aesch', 'Arlesheim', 'Laufen'],
  BS: ['Basel'],
  FR: ['Fribourg', 'Bulle', 'Murten', 'Düdingen', 'Villars', 'Marly', 'Tafers', 'Wünnewil'],
  GE: ['Genève', 'Carouge', 'Lancy', 'Vernier', 'Meyrin', 'Onex', 'Thônex', 'Plan-les-Ouates', 'Bernex', 'Grand-Saconnex', 'Chêne'],
  GL: ['Glarus', 'Näfels', 'Netstal', 'Ennenda', 'Elm'],
  GR: ['Chur', 'Davos', 'Ilanz', 'Thusis', 'Disentis', 'Domat', 'Landquart', 'Arosa', 'Klosters', 'Poschiavo', 'Scuol', 'Flims', 'Lenzerheide'],
  JU: ['Delémont', 'Porrentruy', 'Saignelégier', 'Courrendlin', 'Bassecourt', 'Fontenais', 'Courtételle'],
  LU: ['Luzern', 'Emmen', 'Kriens', 'Horw', 'Sursee', 'Meggen', 'Ebikon', 'Root', 'Adligenswil', 'Rothenburg', 'Hochdorf', 'Willisau', 'Buchrain', 'Malters'],
  NE: ['Neuchâtel', 'La Chaux-de-Fonds', 'Le Locle', 'Peseux', 'Boudry', 'Cortaillod', 'Val-de-Travers', 'Marin'],
  NW: ['Stans', 'Hergiswil', 'Buochs', 'Stansstad', 'Ennetbürgen', 'Beckenried', 'Wolfenschiessen', 'Emmetten', 'Dallenwil', 'Oberdorf'],
  OW: ['Sarnen', 'Engelberg', 'Kerns', 'Sachseln', 'Alpnach', 'Giswil', 'Lungern'],
  SG: ['St. Gallen', 'Rapperswil', 'Wil', 'Gossau', 'Rorschach', 'Buchs', 'Uzwil', 'Flawil', 'Altstätten', 'Wattwil', 'Goldach', 'Widnau'],
  SH: ['Schaffhausen', 'Neuhausen', 'Thayngen', 'Beringen', 'Hallau', 'Stein am Rhein'],
  SO: ['Solothurn', 'Olten', 'Grenchen', 'Zuchwil', 'Derendingen', 'Bellach', 'Biberist', 'Trimbach', 'Dornach', 'Balsthal'],
  SZ: ['Schwyz', 'Freienbach', 'Küssnacht', 'Wollerau', 'Einsiedeln', 'Arth', 'Brunnen', 'Lachen', 'Altendorf', 'Ingenbohl', 'Feusisberg'],
  TG: ['Frauenfeld', 'Kreuzlingen', 'Weinfelden', 'Arbon', 'Amriswil', 'Romanshorn', 'Bischofszell', 'Aadorf', 'Münchwilen', 'Sirnach', 'Sulgen'],
  TI: ['Lugano', 'Bellinzona', 'Locarno', 'Mendrisio', 'Chiasso', 'Giubiasco', 'Minusio', 'Massagno', 'Paradiso', 'Biasca', 'Muralto', 'Agno'],
  UR: ['Altdorf', 'Erstfeld', 'Bürglen', 'Schattdorf', 'Flüelen', 'Silenen', 'Seedorf', 'Attinghausen', 'Wassen', 'Göschenen', 'Andermatt'],
  VD: ['Lausanne', 'Montreux', 'Nyon', 'Morges', 'Vevey', 'Yverdon', 'Renens', 'Pully', 'Prilly', 'Lutry', 'Gland', 'Rolle', 'Aigle', 'Bex', 'Payerne', 'Moudon'],
  VS: ['Sion', 'Visp', 'Brig', 'Zermatt', 'Martigny', 'Sierre', 'Monthey', 'Naters', 'Saas-Fee', 'Leukerbad', 'Conthey', 'Fully'],
  ZG: ['Zug', 'Baar', 'Cham', 'Risch', 'Steinhausen', 'Hünenberg', 'Walchwil', 'Menzingen', 'Unterägeri', 'Oberägeri', 'Neuheim'],
  ZH: ['Zürich', 'Winterthur', 'Uster', 'Dübendorf', 'Dietikon', 'Bülach', 'Kloten', 'Horgen', 'Wädenswil', 'Thalwil', 'Adliswil', 'Volketswil', 'Wetzikon', 'Illnau', 'Opfikon', 'Wallisellen', 'Regensdorf', 'Rüti', 'Maur', 'Zollikon', 'Küsnacht', 'Meilen', 'Stäfa', 'Männedorf', 'Erlenbach', 'Herrliberg', 'Richterswil', 'Affoltern', 'Birmensdorf', 'Oberrieden', 'Rüschlikon', 'Kilchberg', 'Langnau', 'Bassersdorf', 'Nürensdorf', 'Fällanden', 'Greifensee', 'Oetwil', 'Egg', 'Gossau', 'Grüningen', 'Hinwil', 'Pfäffikon', 'Seegräben', 'Turbenthal', 'Elgg', 'Embrach', 'Rafz', 'Eglisau', 'Niederglatt', 'Oberglatt', 'Rümlang', 'Bachs', 'Stammheim', 'Andelfingen'],
}

// In-memory cache
const cache = new Map<string, { data: NormalizedCity[]; ts: number }>()
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const canton = searchParams.get('canton')?.toUpperCase()
  const year = parseInt(searchParams.get('year') || '2025', 10)

  if (!canton || !CANTON_SEARCH_TERMS[canton]) {
    return NextResponse.json({ error: 'Invalid canton code' }, { status: 400 })
  }

  const cacheKey = `canton:${canton}|${year}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  try {
    const allCities = new Map<number, NormalizedCity>()

    async function searchESTVBatch(terms: string[]): Promise<void> {
      const results = await Promise.allSettled(
        terms.map(async (term) => {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8000)

          const res = await fetch(`${ESTV_BASE}/API_searchLocation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Language: 1,
              Search: term,
              TaxYear: year,
            }),
            signal: controller.signal,
          })

          clearTimeout(timeout)

          if (!res.ok) return []
          const json = await res.json()
          return (json.response ?? json) as EstvCity[]
        })
      )

      for (const result of results) {
        if (result.status === 'fulfilled') {
          for (const city of result.value) {
            if (city.Canton === canton) {
              allCities.set(city.TaxLocationID, {
                id: city.TaxLocationID,
                zipCode: city.ZipCode,
                name: city.City,
                cantonCode: city.Canton,
                bfsId: city.BfsID,
              })
            }
          }
        }
      }
    }

    // Phase 1: Search by zip code prefixes (broad coverage)
    const zipPrefixes = CANTON_ZIP_PREFIXES[canton] ?? []
    if (zipPrefixes.length > 0) {
      // Search in batches of 10 to avoid too many parallel requests
      for (let i = 0; i < zipPrefixes.length; i += 10) {
        await searchESTVBatch(zipPrefixes.slice(i, i + 10))
      }
    }

    // Phase 2: Search by city names to catch anything zip prefixes missed
    const searchTerms = CANTON_SEARCH_TERMS[canton] ?? []
    if (searchTerms.length > 0) {
      for (let i = 0; i < searchTerms.length; i += 10) {
        await searchESTVBatch(searchTerms.slice(i, i + 10))
      }
    }

    const cities = Array.from(allCities.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'de')
    )

    cache.set(cacheKey, { data: cities, ts: Date.now() })

    // Evict old entries
    if (cache.size > 100) {
      const now = Date.now()
      for (const [key, val] of cache) {
        if (now - val.ts > CACHE_TTL) cache.delete(key)
      }
    }

    return NextResponse.json(cities)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return NextResponse.json({ error: 'ESTV API timeout' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Failed to reach ESTV API' }, { status: 502 })
  }
}
