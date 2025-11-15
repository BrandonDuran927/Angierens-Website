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
  proof_of_payment_url: string | null
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
  order_item_add_on?: OrderItemAddOn[]
}

export interface OrderItemAddOn {
  order_item_add_on_id: string
  quantity: number
  subtotal_price: number
  add_on: {
    add_on: string
    name: string
    price: number
  }
}

export interface Menu {
  menu_id: string
  name: string
  price: string
  inclusion: string
}

export interface Review {
  review_id: string
  customerName: string
  status_type: 'Food' | 'Staff' | 'Rider' | 'Delivery'
  rating: number
  comment: string
  is_hidden: boolean
  order_id: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalMenu: number
  totalEmployees: number
}

export interface MonthlyData {
  month: string
  value: number
}

export interface ChartData {
  revenueData: MonthlyData[]
  ordersData: MonthlyData[]
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
      payment_date,
      proof_of_payment_url
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
      ),
      order_item_add_on (
        order_item_add_on_id,
        quantity,
        subtotal_price,
        add_on:add_on_id (
          add_on,
          name,
          price
        )
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
        proof_of_payment_url: paymentObj?.proof_of_payment_url ?? null,
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
        order_item_add_on: (item.order_item_add_on || []).map((addon: any) => ({
          order_item_add_on_id: addon.order_item_add_on_id,
          quantity: addon.quantity,
          subtotal_price: addon.subtotal_price,
          add_on: {
            add_on: addon.add_on?.add_on ?? '',
            name: addon.add_on?.name ?? '',
            price: addon.add_on?.price ?? 0,
          },
        })),
      })),
    }
  })

  return formatted
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    // Fetch total revenue from completed orders
    const { data: revenueData, error: revenueError } = await supabase
      .from('order')
      .select('total_price')
      .eq('order_status', 'Completed')

    if (revenueError) {
      console.error('Revenue error:', revenueError)
      throw revenueError
    }

    const totalRevenue =
      revenueData?.reduce((sum, order) => sum + Number(order.total_price), 0) ||
      0

    const { count: totalOrders, error: ordersError } = await supabase
      .from('order')
      .select('order_id', { count: 'exact', head: true })

    if (ordersError) {
      console.error('Orders error:', ordersError)
      throw ordersError
    }

    const { count: totalMenu, error: menuError } = await supabase
      .from('menu')
      .select('menu_id', { count: 'exact', head: true })

    if (menuError) {
      console.error('Menu error:', menuError)
      throw menuError
    }

    const { count: totalEmployees, error: employeesError } = await supabase
      .from('users')
      .select('user_uid', { count: 'exact', head: true })
      .in('user_role', ['staff', 'chef', 'rider'])

    if (employeesError) {
      console.error('Employees error:', employeesError)
      throw employeesError
    }

    console.log('Dashboard stats fetched:', {
      totalRevenue,
      totalOrders,
      totalMenu,
      totalEmployees,
    })

    return {
      totalRevenue: totalRevenue,
      totalOrders: totalOrders || 0,
      totalMenu: totalMenu || 0,
      totalEmployees: totalEmployees || 0,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

export async function fetchChartData(
  monthsBack: number = 12,
): Promise<ChartData> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - monthsBack)

    // Fetch all orders within the date range
    const { data: ordersData, error: ordersError } = await supabase
      .from('order')
      .select('total_price, created_at, order_status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (ordersError) {
      console.error('Chart data error:', ordersError)
      throw ordersError
    }

    // Generate month labels based on the range
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const monthLabels: string[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      monthLabels.push(months[currentDate.getMonth()])
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Initialize revenue and orders count by month
    const revenueByMonth: { [key: string]: number } = {}
    const ordersByMonth: { [key: string]: number } = {}

    monthLabels.forEach((month) => {
      revenueByMonth[month] = 0
      ordersByMonth[month] = 0
    })

    // Process orders data
    ordersData?.forEach((order) => {
      const orderDate = new Date(order.created_at)
      const monthIndex = orderDate.getMonth()
      const monthName = months[monthIndex]

      // Only count if the month is in our range
      if (monthLabels.includes(monthName)) {
        // Count all orders
        ordersByMonth[monthName]++

        // Sum revenue only for completed orders
        if (order.order_status === 'Completed') {
          revenueByMonth[monthName] += Number(order.total_price)
        }
      }
    })

    // Convert to array format for charts
    const revenueData: MonthlyData[] = monthLabels.map((month) => ({
      month,
      value: Math.round(revenueByMonth[month]),
    }))

    const ordersDataFormatted: MonthlyData[] = monthLabels.map((month) => ({
      month,
      value: ordersByMonth[month],
    }))

    console.log('Chart data fetched:', {
      revenueData,
      ordersDataFormatted,
      monthsBack,
    })

    return {
      revenueData,
      ordersData: ordersDataFormatted,
    }
  } catch (error) {
    console.error('Error fetching chart data:', error)
    throw error
  }
}
