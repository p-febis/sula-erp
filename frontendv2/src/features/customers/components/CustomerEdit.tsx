import type { Customer } from '../types/customer'

export const CustomerEdit = ({ customer }: { customer: Customer }) => {
  return JSON.stringify(customer)
}
