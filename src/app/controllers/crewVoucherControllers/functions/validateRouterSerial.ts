import axios from 'axios'
import { CREW_VOUCHER_CONFIG } from '../../../constants/constants'

function maskAuthHeader(value?: string) {
  if (!value) return 'none'
  const compact = value.replace(/\s+/g, ' ').trim()
  if (compact.length <= 20) return `${compact.slice(0, 6)}...`
  return `${compact.slice(0, 16)}...${compact.slice(-6)}`
}

export async function validateRouterSerial_func({
  serial,
  authorization,
}: {
  serial: string
  authorization?: string
}) {
  try {
    const normalizedSerial = serial.trim().toUpperCase()
    const invalidSerialValues = new Set(['', 'UNDEFINED', 'NULL', 'NAN'])

    if (invalidSerialValues.has(normalizedSerial)) {
      return {
        success: false,
        status: 400,
        error: 'Invalid serial number',
      }
    }

    const upstreamUrl = `${CREW_VOUCHER_CONFIG.PI_API_BASE_URL}/api/crew-voucher/router/${encodeURIComponent(
      normalizedSerial,
    )}`
    const requestAuthorization = authorization?.trim()
    const envAuthorization = CREW_VOUCHER_CONFIG.PI_BEARER_TOKEN
      ? `Bearer ${CREW_VOUCHER_CONFIG.PI_BEARER_TOKEN}`
      : undefined
    const authHeader = requestAuthorization || envAuthorization
    const authSource = requestAuthorization
      ? 'request'
      : envAuthorization
        ? 'env'
        : 'none'

    console.log('[CrewVoucher][RouterLookup] Upstream request', {
      serial: normalizedSerial,
      upstreamUrl,
      authSource,
      authPreview: maskAuthHeader(authHeader),
    })

    const upstreamResponse = await axios.get(upstreamUrl, {
      timeout: 15000,
      validateStatus: () => true,
      headers: authHeader
        ? {
            Authorization: authHeader,
          }
        : undefined,
    })

    console.log('[CrewVoucher][RouterLookup] Upstream response', {
      serial: normalizedSerial,
      status: upstreamResponse.status,
      hasData: upstreamResponse.data !== undefined,
      hasErrorField: Boolean(upstreamResponse.data?.error),
    })

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
      data: payload.data ?? payload,
    }
  } catch (error: any) {
    console.error('Error validating router serial from upstream:', error)
    return {
      success: false,
      status: 502,
      error: 'Failed to contact upstream crew voucher service',
    }
  }
}
