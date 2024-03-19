'use client'
import { Chip } from '@nextui-org/chip'
import { Pagination } from '@nextui-org/pagination'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/table'
import { Tooltip } from '@nextui-org/tooltip'
import { CircleCheck, CircleX } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export default function DataTable({ data, columns }) {
  const [sortDescriptor, setSortDescriptor] = useState({ column: 'label', direction: 'ascending' })
  const [page, setPage] = useState(1)
  const itemsPerPage = 15

  const sortData = (items, sortDescriptor) => {
    return items.sort((a, b) => {
      let first, second
      switch (sortDescriptor.column) {
        case 'localPriceCny':
          first = Object.values(a.localPrice['CNY'])[0]
          second = Object.values(b.localPrice['CNY'])[0]
          break
        case 'localPriceUsd':
          first = Object.values(a.localPrice['USD'])[0]
          second = Object.values(b.localPrice['USD'])[0]
          break
        case 'giftCard':
          first = a.giftCard
          second = b.giftCard
          // IF the first is true and the second is false, the first should come first if both are the same, sort by label
          if (first === true && second === false) {
            return -1
          }
          if (first === false && second === true) {
            return 1
          }
          if (first === second) {
            first = a.label
            second = b.label
            let cmp = first.localeCompare(second)
            if (sortDescriptor.direction === 'descending') {
              cmp *= -1
            }
            return cmp
          }
          break
        default:
          first = a.label
          second = b.label
          let cmp = first.localeCompare(second)
          if (sortDescriptor.direction === 'descending') {
            cmp *= -1
          }
          return cmp
      }

      let cmp = first < second ? -1 : 1
      if (sortDescriptor.direction === 'descending') {
        cmp *= -1
      }
      return cmp
    })
  }

  const sortedData = sortData(data, sortDescriptor)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedData = sortedData.slice(startIndex, endIndex)

  const renderCell = (row, columnKey) => {
    const cellValue = row[columnKey]
    const usdLocalPrice = row.localPrice.USD
    const cnyLocalPrice = row.localPrice.CNY

    switch (columnKey) {
      case 'label':
        const countryCode = row.countryCode
        return (
          <div className="flex items-center gap-4">
            <Image
              src={`https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg`}
              width={24}
              height={24}
              alt={cellValue}
            />
            <p>{cellValue}</p>
          </div>
        )
      case 'giftCard':
        const giftCard = row.giftCard
        return (
          <Chip
            startContent={giftCard ? <CircleCheck size={18} /> : <CircleX size={18} />}
            variant="flat"
            color={giftCard ? 'success' : 'danger'}
          >
            {giftCard ? 'Yes' : 'No'}
          </Chip>
        )

      case 'plan':
        const plan = Object.entries(cellValue)
        return (
          <Tooltip
            content={
              <div>
                {plan.map((item, index) => (
                  <p key={index} className="font-mono">
                    {item[0] + ': ' + item[1]}
                  </p>
                ))}
              </div>
            }
          >
            <span>{plan[0][1]}</span>
          </Tooltip>
        )

      case 'localPriceCny':
        const cnyLocalPriceArr = Object.entries(cnyLocalPrice)
        return (
          <Tooltip
            content={
              <div>
                {cnyLocalPriceArr.map((item, index) => (
                  <p key={index} className="font-mono">
                    {item[0] + ': ¥' + item[1]}
                  </p>
                ))}
              </div>
            }
          >
            <span>{'¥' + cnyLocalPriceArr[0][1]}</span>
          </Tooltip>
        )
      case 'localPriceUsd':
        const usdLocalPriceArr = Object.entries(usdLocalPrice)
        return (
          <Tooltip
            content={
              <div>
                {usdLocalPriceArr.map((item, index) => (
                  <p key={index} className="font-mono">
                    {item[0] + ': $' + item[1]}
                  </p>
                ))}
              </div>
            }
          >
            <span>{'$' + usdLocalPriceArr[0][1]}</span>
          </Tooltip>
        )
      default:
        return cellValue
    }
  }

  const handleSortChange = descriptor => {
    setSortDescriptor(descriptor)
    setPage(1) // Reset to first page when sorting changes
  }

  return (
    <>
      <Table
        bottomContent={
          totalPages > 1 && (
            <div className="flex w-full justify-center mt-4">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          )
        }
        className="w-full"
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
      >
        <TableHeader columns={columns}>
          {column => {
            return (
              <TableColumn
                key={column.key}
                allowsSorting={['label', 'localPriceCny', 'localPriceUsd', 'giftCard'].includes(
                  column.key
                )}
              >
                {column.label}
              </TableColumn>
            )
          }}
        </TableHeader>
        <TableBody items={displayedData} emptyContent={'获取信息失败，请坐和放宽。'}>
          {item => (
            <TableRow key={item.countryCode}>
              {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
}
