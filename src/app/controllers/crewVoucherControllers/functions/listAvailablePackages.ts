import axios from 'axios'
import { CREW_VOUCHER_CONFIG } from '../../../constants/constants'

export async function listAvailablePackages_func({
  vessel_id,
  authorization,
}: {
  vessel_id?: string | number | null
  authorization?: string
}) {
  try {
    const rawVesselId = vessel_id
    const hasVesselId =
      rawVesselId !== undefined &&
      rawVesselId !== null &&
      String(rawVesselId).trim() !== ''

    if (!hasVesselId) {
      return {
        success: false,
        status: 400,
        error: 'vessel_id is required',
      }
    }

    const vesselIdNumber = Number(rawVesselId)
    if (!Number.isFinite(vesselIdNumber) || vesselIdNumber <= 0) {
      return {
        success: false,
        status: 400,
        error: 'vessel_id must be a positive number',
      }
    }

    const upstreamUrl = `${CREW_VOUCHER_CONFIG.PI_API_BASE_URL}/api/crew-voucher/packages?vessel_id=${encodeURIComponent(
      String(vesselIdNumber),
    )}`
    const requestAuthorization = authorization?.trim()
    const envAuthorization = CREW_VOUCHER_CONFIG.PI_BEARER_TOKEN
      ? `Bearer ${CREW_VOUCHER_CONFIG.PI_BEARER_TOKEN}`
      : undefined
    const authHeader = requestAuthorization || envAuthorization

    const upstreamResponse = await axios.get(upstreamUrl, {
      timeout: 15000,
      validateStatus: () => true,
      headers: authHeader ? { Authorization: authHeader } : undefined,
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
      data: Array.isArray(payload.data) ? payload.data : [],
    }
  } catch (error) {
    console.error('Error listing crew voucher packages from upstream:', error)
    return {
      success: false,
      status: 502,
      error: 'Failed to contact upstream crew voucher service',
    }
  }
}
