import { kv } from '@/lib/kv'
import { load } from 'cheerio'
const expTtl = 90 * 24 * 60 * 60

const fetchGiftCardInfoByRegion = async region => {
  const response = await fetch(
    'https://help.netflix.com/en/node/32950/' + region.value.toLowerCase()
  )
  const htmlStr = await response.text()
  const $ = load(htmlStr)
  const section = $('.accordion')
  return [region.value.toLowerCase(), !(section.length === 0)]
}

export const fetchGiftCardInfo = async regions => {
  // Get All Price from KV
  const giftCardInfo = await kv.get('giftCardInfo')
  if (giftCardInfo) {
    return JSON.parse(giftCardInfo)
  }

  const result = await Promise.all(regions.map(fetchGiftCardInfoByRegion))
  const time = new Date().getTime()
  const data = result.reduce((acc, [region, available]) => {
    acc[region] = available
    return acc
  }, {})

  // Update KV
  kv.set('giftCardInfo', JSON.stringify({ time, data }), {
    expirationTtl: expTtl
  })
  return { time, data }
}
