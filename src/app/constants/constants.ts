export const APP_CONFIG = {
  NAME: process.env.APP_NAME || 'ElysiaJS Backend',
  VERSION: '1.0.0',
  DESCRIPTION: 'ElysiaJS Backend API with PostgreSQL and Drizzle ORM',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export const DATABASE_CONFIG = {
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgresql://localhost:5432/elysia_db',
};

export const STARLINK_API = {
  API_KEY: process.env.STARLINK_API_KEY,
  URL: process.env.STARLINK_API_URL,
};

const crewVoucherApiBaseUrl =
  process.env.CREW_VOUCHER_API_BASE_URL || 'https://api.spacevisionapi.com';
const crewVoucherPiApiBaseUrl =
  process.env.CREW_VOUCHER_PI_API_BASE_URL || crewVoucherApiBaseUrl;
const crewVoucherAdminApiKey =
  process.env.CREW_VOUCHER_ADMIN_API_KEY ||
  'sv_admin_9f2b3d6e-8a7e-4a12-9c6b-6cbb5e0b9a91';
const crewVoucherPiBearerToken = process.env.CREW_VOUCHER_PI_BEARER_TOKEN || '';
const crewVoucherTestSerial =
  process.env.CREW_VOUCHER_TEST_ROUTER_SERIAL || 'B8570AED7C45';
const crewVoucherTestVesselId = Number(
  process.env.CREW_VOUCHER_TEST_VESSEL_ID || 184,
);
const crewVoucherTestCrewProfileId = Number(
  process.env.CREW_VOUCHER_TEST_CREW_PROFILE_ID || 1,
);
const crewVoucherTestPackageIdBasic = Number(
  process.env.CREW_VOUCHER_TEST_PACKAGE_ID_BASIC || 1,
);
const crewVoucherTestPackageIdPremium = Number(
  process.env.CREW_VOUCHER_TEST_PACKAGE_ID_PREMIUM || 2,
);
const crewVoucherTestPackageIdUnlimited = Number(
  process.env.CREW_VOUCHER_TEST_PACKAGE_ID_UNLIMITED || 3,
);

export const CREW_VOUCHER_CONFIG = {
  API_BASE_URL: crewVoucherApiBaseUrl,
  PI_API_BASE_URL: crewVoucherPiApiBaseUrl,
  PI_BEARER_TOKEN: crewVoucherPiBearerToken,
  ADMIN_API_KEY: crewVoucherAdminApiKey,
  TEST_ROUTER_SERIAL: crewVoucherTestSerial,
  TEST_VESSEL_ID: crewVoucherTestVesselId,
  TEST_CREW_PROFILE_ID: crewVoucherTestCrewProfileId,
  TEST_PACKAGE_ID_BASIC: crewVoucherTestPackageIdBasic,
  TEST_PACKAGE_ID_PREMIUM: crewVoucherTestPackageIdPremium,
  TEST_PACKAGE_ID_UNLIMITED: crewVoucherTestPackageIdUnlimited,
  TEST_ROUTER_LOOKUP_URL: `${crewVoucherPiApiBaseUrl}/api/crew-voucher/router/${crewVoucherTestSerial}`,
};

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};

export const SESSION_CONFIG = {
  SECRET: process.env.SESSION_SECRET || 'your-session-secret',
  EXPIRES_IN: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

export const ENCRYPTION_CONFIG = {
  KEY:
    process.env.ENCRYPTION_KEY ||
    'your-32-character-encryption-key-here-change-this',
  ALGORITHM: 'aes-256-gcm',
};

export const authTypes = {
  local: 'local',
  oauth: 'oauth',
  ldap: 'ldap',
} as const;

export const userRoles = {
  admin: 'admin',
  user: 'user',
  moderator: 'moderator',
} as const;
