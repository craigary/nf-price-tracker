'use client'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/table'
import { Tooltip } from '@nextui-org/tooltip'
import { useAsyncList } from '@react-stately/data'
import Image from 'next/image'
import { useCallback } from 'react'

export default function DataTable({ data, columns }) {
  let list = useAsyncList({
    load() {
      return {
        items: data
      }
    },
    sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
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
    }
  })

  const renderCell = useCallback((row, columnKey) => {
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
  }, [])

  return (
    <Table
      sortDescriptor={list.sortDescriptor}
      onSortChange={list.sort}
      aria-label="Example table with dynamic content"
    >
      <TableHeader columns={columns}>
        {column => {
          return (
            <TableColumn
              key={column.key}
              allowsSorting={['label', 'localPriceCny', 'localPriceUsd'].includes(column.key)}
            >
              {column.label}
            </TableColumn>
          )
        }}
      </TableHeader>
      <TableBody items={list.items} emptyContent={'获取信息失败，请坐和放宽。'}>
        {item => (
          <TableRow key={item.countryCode}>
            {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}