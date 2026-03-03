import axios from 'axios'
import { CREW_VOUCHER_CONFIG } from '../../../constants/constants'

interface CreateOrUpdateCrewProfileInput {
  vessel_id?: number | string | null
  full_name?: string | null
  email?: string
  phone?: string
  cabin_number?: string
  rank?: string
}

export async function createOrUpdateCrewProfile_func({
  data,
  authorization,
}: {
  data: CreateOrUpdateCrewProfileInput
  authorization?: string
}) {
  try {
    const rawVesselId = data.vessel_id
    const rawFullName = data.full_name
    const fullName = String(rawFullName ?? '').trim()
    const hasFullName =
      rawFullName !== undefined &&
      rawFullName !== null &&
      String(rawFullName).trim() !== ''

    const hasVesselId =
      rawVesselId !== undefined &&
      rawVesselId !== null &&
      String(rawVesselId).trim() !== ''
    const vesselId = hasVesselId ? Number(rawVesselId) : NaN

    if (!hasVesselId) {
      return {
        success: false,
        status: 400,
        error: 'vessel_id is required',
      }
    }

    if (!Number.isFinite(vesselId) || vesselId <= 0) {
      return {
        success: false,
        status: 400,
        error: 'vessel_id must be a positive number',
      }
    }

    if (!hasFullName || !fullName) {
      return {
        success: false,
        status: 400,
        error: 'full_name is required',
      }
    }

    const upstreamUrl = `${CREW_VOUCHER_CONFIG.PI_API_BASE_URL}/api/crew-voucher/profiles`
    const requestAuthorization = authorization?.trim()
    const envAuthorization = CREW_VOUCHER_CONFIG.PI_BEARER_TOKEN
      ? `Bearer ${CREW_VOUCHER_CONFIG.PI_BEARER_TOKEN}`
      : undefined
    const authHeader = requestAuthorization || envAuthorization

    const upstreamResponse = await axios.post(
      upstreamUrl,
      {
        vessel_id: vesselId,
        full_name: fullName,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        cabin_number: data.cabin_number ?? undefined,
        rank: data.rank ?? undefined,
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
      status: upstreamResponse.status || 201,
      data: payload.data ?? payload,
    }
  } catch (error) {
    console.error('Error creating/updating crew profile from upstream:', error)
    return {
      success: false,
      status: 502,
      error: 'Failed to contact upstream crew voucher service',
    }
  }
}
