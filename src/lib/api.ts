import { supabase } from '@/lib/supabaseClient'

export interface Order {
  order_id: string
  order_status: 'New Orders' | 'In Process' | 'Completed'
  order_type: 'Delivery' | 'Pick-up'
  total_price: string
  failed_delivery_reason: string | null
  additional_information: string | null
  user: User
  schedule: Schedule
  order_number: string
  order_cooked: string | null
  date: string
  time: string
  payment: Payment
  delivery: Delivery
  order_item: OrderItem[]
}

export interface User {
  user_uid: string
  customer_name: string
  phone_number: string
}

export interface Schedule {
  schedule_id: string
  schedule_time: string
  schedule_date: string
}

export interface Payment {
  payment_id: string
  paymentMethod: string | null
  payment_date: string
}

export interface Address {
  address_id: string
  address_type: string
  region: string
  city: string
  barangay: string
  postal_code: string
  address_line: string
}

export interface Delivery {
  delivery_id: string
  address: Address
  delivery_fee: string
}

export interface OrderItem {
  order_item_id: string
  quantity: number
  subtotal_price: number
  order_id: string
  menu: Menu
}

export interface Menu {
  menu_id: string
  name: string
  price: string
  inclusion: string
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('order')
    .select(
      `
    order_id,
    order_status,
    order_type,
    total_price,
    failed_delivery_reason,
    additional_information,
    order_number,
    order_cooked,
    created_at,

    users!customer_uid (
      user_uid,
      first_name,
      middle_name,
      last_name,
      phone_number
    ),

    schedule:schedule_id (
      schedule_id,
      schedule_time,
      schedule_date
    ),

    payment:payment_id (
      payment_id,
      payment_method,
      payment_date
    ),

    delivery:delivery_id (
      delivery_id,
      delivery_fee,
      address:address_id (
        address_id,
        address_type,
        region,
        city,
        barangay,
        postal_code,
        address_line
      )
    ),

    order_item (
      order_item_id,
      quantity,
      subtotal_price,
      order_id,
      menu:menu_id (
         menu_id,
         name,
         price,
         inclusion
      )
    )
  `,
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  if (!data) {
    return []
  }

  const unwrap = <T>(val: T | T[] | null | undefined): T | null =>
    Array.isArray(val) ? (val[0] ?? null) : (val ?? null)

  const formatted: Order[] = data.map((order: any) => {
    const userObj = unwrap(order.users)
    const scheduleObj = unwrap(order.schedule)
    const paymentObj = unwrap(order.payment)
    const deliveryObj = unwrap(order.delivery)
    const addressObj = deliveryObj ? unwrap(deliveryObj.address) : null

    return {
      order_id: order.order_id,
      order_status: order.order_status,
      order_type: order.order_type,
      total_price: order.total_price,
      failed_delivery_reason: order.failed_delivery_reason ?? null,
      additional_information: order.additional_information ?? null,
      order_number: order.order_number?.toString() ?? '',
      order_cooked: order.order_cooked ?? null,
      date: new Date(order.created_at).toLocaleDateString(),
      time: new Date(order.created_at).toLocaleTimeString(),

      user: {
        user_uid: userObj?.user_uid ?? '',
        customer_name:
          `${userObj?.first_name ?? ''} ${userObj?.middle_name ? userObj.middle_name + ' ' : ''}${userObj?.last_name ?? ''}`.trim(),
        phone_number: userObj?.phone_number ?? '',
      },

      schedule: {
        schedule_id: scheduleObj?.schedule_id ?? '',
        schedule_time: scheduleObj?.schedule_time ?? '',
        schedule_date: scheduleObj?.schedule_date ?? '',
      },

      payment: {
        payment_id: paymentObj?.payment_id ?? '',
        paymentMethod: paymentObj?.payment_method ?? null,
        payment_date: paymentObj?.payment_date ?? '',
      },

      delivery: {
        delivery_id: deliveryObj?.delivery_id ?? '',
        delivery_fee: deliveryObj?.delivery_fee ?? '',
        address: {
          address_id: addressObj?.address_id ?? '',
          address_type: addressObj?.address_type ?? '',
          region: addressObj?.region ?? '',
          city: addressObj?.city ?? '',
          barangay: addressObj?.barangay ?? '',
          postal_code: addressObj?.postal_code ?? '',
          address_line: addressObj?.address_line ?? '',
        },
      },

      order_item: (order.order_item || []).map((item: any) => ({
        order_item_id: item.order_item_id,
        quantity: item.quantity,
        subtotal_price: item.subtotal_price,
        order_id: item.order_id,
        menu: {
          menu_id: item.menu?.menu_id ?? '',
          name: item.menu?.name ?? '',
          price: item.menu?.price ?? 0,
          inclusion: item.menu?.inclusion ?? '',
        },
      })),
    }
  })

  return formatted
}
