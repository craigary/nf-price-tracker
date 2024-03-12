import { getCurrency } from '@/lib/currency'
import { kv } from '@/lib/kv'
import { load } from 'cheerio'

const pricingPage = 'https://help.netflix.com/en/node/24926'

const expTtl = 60 * 60 * 12

export const fetchPrice = async data => {
  const { value, label } = data
  const response = await fetch(`${pricingPage}/${value}`)
  const htmlStr = await response.text()
  const $ = load(htmlStr)

  const pricingDetails = {}
  pricingDetails.label = label
  pricingDetails.countryCode = value.toLowerCase()

  try {
    // 获取货币单位
    const currencyText = $('.kb-article ul li strong')
      .parent()
      .parent()
      .parent()
      .parent()
      .find('h3')
      .text()
    const currency = currencyText.includes('(')
      ? currencyText.split('(')[1].split(')')[0]
      : currencyText.split(' ')[1]
    pricingDetails.currency = currency
  } catch (error) {
    pricingDetails.currency = null
  }
  try {
    pricingDetails.plan = {}

    // 获取不同计划的价格
    $($('.kb-article ul li strong').get().reverse()).each((i, el) => {
      const plan = $(el).text().trim()
      let price = $(el)
        .parentsUntil('li')
        .text()
        .replaceAll(plan, '')
        .trim()
        .replace(/\*?:\s?/, '')
        .trim()

      price = price.split('month')[0].trim().replace('/', '')
      // Special Proccess for Liechtenstein,Switzerland,Czechia,Brazil

      switch (pricingDetails.countryCode) {
        case 'li':
          price = price.replace(',', '.').trim()
          break
        case 'ch':
          price = price.replace(',', '.').trim()
          break
        case 'cz':
          price = price.replace(',', '.').trim()
          break
        case 'br':
          price = price.replace(',', '.').trim()
          break
        default:
          break
      }

      pricingDetails.plan[plan] = price
    })
  } catch (error) {
    pricingDetails.plan = null
  }

  // Process Pricing Info
  if (pricingDetails?.currency) {
    if (pricingDetails.currency?.endsWith('Dollars')) {
      pricingDetails.currency = pricingDetails.currency.replace('Dollars', 'Dollar')
    }
    if (pricingDetails.currency === 'Czech Crowns') {
      pricingDetails.currency = 'Czech Crown'
    }
    const currencyInfo = getCurrency(pricingDetails.currency)
    pricingDetails.currency = {
      ...currencyInfo
    }
  }
  return pricingDetails
}

export const fetchAllPrice = async info => {
  // Get All Price from KV
  // const regionalPricing = await kv.get('regionalPricing')
  // if (regionalPricing) {
  //   return JSON.parse(regionalPricing)
  // }
  const response = await Promise.allSettled(info.map(fetchPrice))
  // date to timestamp
  const time = new Date().getTime()
  const data = response
    .filter(i => {
      return (
        i.status === 'fulfilled' &&
        'currency' in i.value &&
        i.value?.currency !== null &&
        'plan' in i.value
      )
    })
    .map(item => item.value)
    .filter(p => {
      // 删除 currency 为 null 的元素
      return p?.currency && p?.currency !== null
    })

  const regionalPricingData = { time, data }
  // Update KV
  kv.set('regionalPricing', JSON.stringify(regionalPricingData), {
    expirationTtl: expTtl
  })
  return regionalPricingData
}
