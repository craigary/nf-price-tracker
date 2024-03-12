function convertPriceToNumber(priceString) {
  // 使用正则表达式匹配数字和小数点
  const numberRegex = /[\d,.]+/
  const match = priceString.match(numberRegex)

  if (match) {
    // 如果匹配到数字,则去掉非数字字符和逗号
    const numberString = match[0].replace(/,/g, '')
    return parseFloat(numberString)
  } else {
    // 如果没有匹配到数字,则返回NaN
    return NaN
  }
}

export const calculateLocalPricing = (data, rating) => {
  const pricingData = data.map(item => {
    const planInfo = item.plan // {'Standard: '$10.00', 'Premium': '$20.00'}
    const code = item.currency.code

    const localPrice = Object.entries(rating).reduce((acc, cur) => {
      const [key, value] = cur // ['USD',{CNY: 6.5, USD: 1}]

      const price = {}
      for (let i in planInfo) {
        const regionalPrice = convertPriceToNumber(planInfo[i])
        const rate = value[code]
        price[i] = Math.round((regionalPrice / rate) * 100) / 100
      }

      acc[key] = price
      return acc
    }, {})

    return {
      ...item,
      localPrice
    }
  })
  return pricingData
}
