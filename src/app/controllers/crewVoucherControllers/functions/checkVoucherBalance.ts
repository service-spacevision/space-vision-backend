import axios from 'axios'
import { CREW_VOUCHER_CONFIG } from '../../../constants/constants'

interface CheckVoucherBalanceInput {
  router_serial?: string | null
  hotspot_user?: string | null
}

export async function checkVoucherBalance_func({
  data,
  authorization,
}: {
  data: CheckVoucherBalanceInput
  authorization?: string
}) {
  try {
    const rawRouterSerial = data.router_serial
    const routerSerial = String(rawRouterSerial ?? '').trim().toUpperCase()
    const hotspotUser = String(data.hotspot_user ?? '').trim()

    if (!routerSerial || ['UNDEFINED', 'NULL', 'NAN'].includes(routerSerial)) {
      return {
        success: false,
        status: 400,
        error: 'router_serial is required',
      }
    }

    const upstreamUrl = `${CREW_VOUCHER_CONFIG.PI_API_BASE_URL}/api/crew-voucher/balance`
    const requestAuthorization = authorization?.trim()
    const envAuthorization = CREW_VOUCHER_CONFIG.PI_BEARER_TOKEN
      ? `Bearer ${CREW_VOUCHER_CONFIG.PI_BEARER_TOKEN}`
      : undefined
    const authHeader = requestAuthorization || envAuthorization

    const upstreamResponse = await axios.post(
      upstreamUrl,
      {
        router_serial: routerSerial,
        ...(hotspotUser ? { hotspot_user: hotspotUser } : {}),
      },
      {
        timeout: 15000,
        validateStatus: () => true,
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
      },
    )

    if (upstreamResponse.status >= 400) {
      const upstreamError =
        typeof upstreamResponse.data?.error === 'string'
          ? upstreamResponse.data.error
          : 'Upstream service returned an error'
      return {
        success: false,
        status: upstreamResponse.status,
        error: upstreamError,
      }
    }

    const payload =
      upstreamResponse.data && typeof upstreamResponse.data === 'object'
        ? upstreamResponse.data
        : { data: upstreamResponse.data }

    if (payload?.error) {
      return {
        success: false,
        status: upstreamResponse.status || 500,
        error: String(payload.error),
      }
    }

    return {
      success: true,
      status: upstreamResponse.status || 200,
      data: Array.isArray(payload.data) ? payload.data : [],
    }
  } catch (error) {
    console.error('Error checking crew voucher balance from upstream:', error)
    return {
      success: false,
      status: 502,
      error: 'Failed to contact upstream crew voucher service',
    }
  }
}
