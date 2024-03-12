import { CloudflareKV } from 'cloudflare-kv-storage'
export const kv = new CloudflareKV({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  namespaceId: process.env.CLOUDFLARE_NAMESPACE_ID,
  accessToken: process.env.CLOUDFLARE_ACCESS_TOKEN
})
