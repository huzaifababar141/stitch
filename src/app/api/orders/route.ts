import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { validateBody } from '@/lib/utils/validation'
import { createOrderSchema } from '@/lib/validations/orders'
import { createOrder, getCustomerOrders } from '@/lib/services/orders.service'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    
    // Default: return customer's own orders. (Admin listing would be in a separate admin module)
    const result = await getCustomerOrders(user.id, { status }, { page, limit })

    return apiSuccess({
      orders: result.orders,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const validatedData = await validateBody(request, createOrderSchema)

    const order = await createOrder(user.id, validatedData)

    return apiSuccess(order, 201, { message: 'Order created successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
