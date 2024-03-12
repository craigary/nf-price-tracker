import { columns } from '@/components/columns'
import DataTable from '@/components/data-table'
import { getRatings } from '@/lib/currency'
import { fetchAllPrice } from '@/lib/fetch-price'
import { fetchRegions } from '@/lib/fetch-regions'
import { calculateLocalPricing } from '@/lib/local-price'

export default async function Home() {
  const countries = await fetchRegions()
  const queue = await Promise.all([fetchAllPrice(countries), getRatings()])
  const localPricing = queue[0].data
  const ratingInfo = queue[1].data

  const data = calculateLocalPricing(localPricing, ratingInfo)

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="max-w-xl text-center justify-center">
        <h1 className="text-2xl md:text-4xl font-medium text-center">
          Netflix Pricing Comparison Table
        </h1>
        <h2 className="mt-4">Beautiful, fast and modern React UI library.</h2>
      </div>

      <div className="flex flex-col">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  )
}
