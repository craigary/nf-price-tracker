import { kv } from '@/lib/kv'

const expTtl = 60 * 60 * 6

export const getCurrency = name => {
  const currencies = new Map([
    ['US Dollar', { code: 'USD', symbol: '$' }],
    ['Euro', { code: 'EUR', symbol: '€' }],
    ['Argentine Peso', { code: 'ARS', symbol: '$' }],
    ['Australian Dollar', { code: 'AUD', symbol: '$' }],
    ['Norwegian Krone', { code: 'NOK', symbol: 'kr' }],
    ['Brazilian Real', { code: 'BRL', symbol: 'R$' }],
    ['Canadian Dollar', { code: 'CAD', symbol: '$' }],
    ['Chilean Peso', { code: 'CLP', symbol: '$' }],
    ['Colombian Peso', { code: 'COP', symbol: '$' }],
    ['New Zealand Dollar', { code: 'NZD', symbol: '$' }],
    ['Czech Crown', { code: 'CZK', symbol: 'Kč' }],
    ['Danish Krone', { code: 'DKK', symbol: 'kr' }],
    ['Egyptian Pound', { code: 'EGP', symbol: '£' }],
    ['British Pound', { code: 'GBP', symbol: '£' }],
    ['Hong Kong Dollar', { code: 'HKD', symbol: '$' }],
    ['Hungarian Forint', { code: 'HUF', symbol: 'Ft' }],
    ['Indian Rupee', { code: 'INR', symbol: '₹' }],
    ['Indonesian Rupiah', { code: 'IDR', symbol: 'Rp' }],
    ['Israeli Shekel', { code: 'ILS', symbol: '₪' }],
    ['Japanese Yen', { code: 'JPY', symbol: '¥' }],
    ['Kenyan Shilling', { code: 'KES', symbol: 'KSh' }],
    ['Swiss Franc', { code: 'CHF', symbol: 'CHF' }],
    ['Malaysian Ringgit', { code: 'MYR', symbol: 'RM' }],
    ['Mexican Peso', { code: 'MXN', symbol: '$' }],
    ['Moroccan Dirham', { code: 'MAD', symbol: 'MAD' }],
    ['Nigerian Naira', { code: 'NGN', symbol: '₦' }],
    ['Pakistani Rupee', { code: 'PKR', symbol: 'Rs' }],
    ['Peruvian Sole', { code: 'PEN', symbol: 'S/' }],
    ['Philippine Peso', { code: 'PHP', symbol: '₱' }],
    ['Polish Zloty', { code: 'PLN', symbol: 'zł' }],
    ['Saudi Riyal', { code: 'SAR', symbol: 'SR' }],
    ['Singapore Dollar', { code: 'SGD', symbol: '$' }],
    ['South African Rand', { code: 'ZAR', symbol: 'R' }],
    ['Korean Won', { code: 'KRW', symbol: '₩' }],
    ['Swedish Krona', { code: 'SEK', symbol: 'kr' }],
    ['New Taiwan Dollar', { code: 'TWD', symbol: 'NT$' }],
    ['Thai Baht', { code: 'THB', symbol: '฿' }],
    ['Turkish Lira', { code: 'TRY', symbol: '₺' }],
    ['Arab Emirates Dirham', { code: 'AED', symbol: 'AED' }],
    ['Vietnamese Dong', { code: 'VND', symbol: '₫' }]
  ])
  const data = currencies.get(name)
  return {
    name,
    ...data
  }
}

export const getRatings = async () => {
  // Get ratings from KV

  const ratings = await kv.get('currency-ratings')

  if (ratings) {
    return JSON.parse(ratings)
  }

  const currency = process.env.LOCAL_CURRENCIES.split(',').map(i => i.trim())
  const fetchCurrencyRate = async code => {
    const response = await fetch(
      `https://api.currencybeacon.com/v1/latest?base=${code}&api_key=${process.env.CURRENCYBEACON_API_KEY}`,
      { next: { revalidate: 21600 } }
    )
    const { base, rates } = await response.json()
    return { base, rates }
  }

  const result = await Promise.all(currency.map(code => fetchCurrencyRate(code)))
  // refacture the result to {CNY: {...rates}, usd: {...rates}}
  const data = result.reduce((acc, item) => {
    const { base, rates } = item
    acc[base] = rates
    return acc
  }, {})

  const time = new Date().getTime()

  // Update to KV
  kv.put('currency-ratings', JSON.stringify({ time, data }), {
    expirationTtl: expTtl
  })
  return { data, time }
}
