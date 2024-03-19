import { kv } from '@/lib/kv'
import { load } from 'cheerio'
const expTtl = 90 * 24 * 60 * 60

export const fetchRegions = async () => {
  const regions = await kv.get('regions')
  if (regions) {
    return regions
  }

  // Fetch Regions from netflix
  const response = await fetch('https://help.netflix.com/zh/node/24926', {
    next: { revalidate: 86400 }
  })
  const htmlStr = await response.text()
  const $ = load(htmlStr)
  const section = $('body > script').first().html()
  const countriesString = section.match(/.*allCountries.*/)[0]
  const cleanedCountries = countriesString.replace('"allCountries": ', '').trim().replace(/,$/, '')
  const countries = JSON.parse(cleanedCountries)

  // Save to KV
  await kv.set('regions', JSON.stringify(countries), { expirationTtl: expTtl })
  return countries
}
