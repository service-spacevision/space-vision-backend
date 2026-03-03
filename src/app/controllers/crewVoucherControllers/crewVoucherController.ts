import { validateRouterSerial_func } from './functions/validateRouterSerial';

function maskAuthHeader(value?: string) {
  if (!value) return 'none';
  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length <= 20) return `${compact.slice(0, 6)}...`;
  return `${compact.slice(0, 16)}...${compact.slice(-6)}`;
}

function pickValidSerial(...candidates: Array<unknown>) {
  const invalid = new Set(['', 'undefined', 'null', 'nan']);
  for (const candidate of candidates) {
    const value = String(candidate ?? '').trim();
    if (!invalid.has(value.toLowerCase())) {
      return value;
    }
  }
  return '';
}

export class CrewVoucherController {
  static async validateRouterSerial(ctx: any) {
    try {
      const paramSerial = ctx.params?.serial;
      const querySerial = ctx.query?.serial ?? ctx.request?.query?.serial;
      const serial = pickValidSerial(paramSerial, querySerial);
      const authorizationHeader =
        ctx.headers?.authorization ||
        ctx.headers?.Authorization ||
        ctx.request?.headers?.get?.('authorization') ||
        undefined;
      console.log('[CrewVoucher][RouterLookup] Incoming request', {
        serial,
        paramSerial: String(paramSerial ?? ''),
        querySerial: String(querySerial ?? ''),
        hasAuthorizationHeader: Boolean(authorizationHeader),
        authPreview: maskAuthHeader(authorizationHeader),
      });
      const result = await validateRouterSerial_func({
        serial,
        authorization: authorizationHeader,
      });

      ctx.set.status = result.status as any;

      if (!result.success) {
        return { error: result.error ?? 'Internal server error' };
      }

      if (!result.data) {
        ctx.set.status = 500;
        return { error: 'Internal server error' };
      }

      return { data: result.data };
    } catch {
      ctx.set.status = 500;
      return { error: 'Internal server error' };
    }
  }
}
