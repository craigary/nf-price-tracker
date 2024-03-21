import CloudflareKV from 'remote-cloudflare-kv'

export const kv = new CloudflareKV({
  account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
  namespace_id: process.env.CLOUDFLARE_NAMESPACE_ID,
  api_token: process.env.CLOUDFLARE_ACCESS_TOKEN
})
