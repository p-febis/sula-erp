import type { ColumnDef } from '@tanstack/react-table'
import type { Customer } from './customer'

export const customerListColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone number',
  },
]
