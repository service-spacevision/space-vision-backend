import { RouterOSClient } from 'mikro-routeros';

// Mikrotik connection credentials from Python script
const MIKROTIK_USER = 'svcoreadmin';
const MIKROTIK_PASS = 'V3ss3l@dmin#2025';

export interface MikrotikConnection {
  host: string;
  port: number;
  useSSL?: boolean;
  apiType?: 'rest' | 'api';
}

export interface HotspotUser {
  name: string;
  password: string;
  profile: string;
  server: string;
  'limit-bytes-total': string;
  'bytes-in': string;
  'bytes-out': string;
  uptime: string;
  comment: string;
  '.id': string;
}

export interface HotspotProfile {
  name: string;
  'on-login': string;
  '.id': string;
}

export interface HotspotServer {
  name: string;
  '.id': string;
}

export class MikrotikAPI {
  private client: RouterOSClient | null = null;
  private config: MikrotikConnection;

  constructor(
    host: string,
    port: number,
    useSSL: boolean = false,
    apiType: 'rest' | 'api' = 'api'
  ) {
    this.config = { host, port, useSSL, apiType };
  }

  private async ensureConnection(): Promise<RouterOSClient> {
    if (!this.client) {
      this.client = new RouterOSClient(
        this.config.host,
        this.config.port,
        30000
      );
      await this.client.connect();
      await this.client.login(MIKROTIK_USER, MIKROTIK_PASS);
      console.log(
        `✅ Connected to Mikrotik router at ${this.config.host}:${this.config.port}`
      );
    }
    return this.client;
  }

  async connect(): Promise<boolean> {
    try {
      console.log(
        `🔌 Testing connection to MikroTik router at ${this.config.host}:${this.config.port}`
      );

      // First try the configured connection
      try {
        await this.ensureConnection();
        console.log(
          `✅ Connected to Mikrotik router at ${this.config.host}:${this.config.port}`
        );
        return true;
      } catch (error) {
        console.log(
          `⚠️ Configured port ${this.config.port} failed, trying standard RouterOS API ports...`
        );

        // If configured port fails, try common RouterOS API ports
        const commonPorts = [
          { port: 8728, name: 'RouterOS API (default)' },
          { port: 8729, name: 'RouterOS API SSL' },
          { port: 80, name: 'HTTP Web Interface' },
          { port: 443, name: 'HTTPS Web Interface' },
        ];

        for (const portInfo of commonPorts) {
          if (portInfo.port !== this.config.port) {
            console.log(
              `🔄 Trying port ${portInfo.port} (${portInfo.name})...`
            );

            try {
              this.client = new RouterOSClient(
                this.config.host,
                portInfo.port,
                30000
              );
              await this.client.connect();
              await this.client.login(MIKROTIK_USER, MIKROTIK_PASS);

              console.log(
                `✅ Successfully connected using port ${portInfo.port} (${portInfo.name})`
              );
              this.config.port = portInfo.port;
              return true;
            } catch (error) {
              console.log(`❌ Port ${portInfo.port} not accessible`);
              if (this.client) {
                try {
                  await this.client.close();
                } catch {}
                this.client = null;
              }
            }
          }
        }

        console.error(
          `❌ All connection attempts failed for ${this.config.host}`
        );
        return false;
      }
    } catch (error) {
      console.error(`❌ Failed to connect to Mikrotik router:`, error);
      this.client = null;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.client = null;
        console.log(`✅ Disconnected from Mikrotik router`);
      } catch (error) {
        console.error(`❌ Error disconnecting:`, error);
      }
    }
  }

  private async runQuery(
    command: string,
    params?: Record<string, any>
  ): Promise<any[]> {
    const client = await this.ensureConnection();
    return await client.runQuery(command, params);
  }

  async getHotspotServers(
    maxRetries: number = 5,
    retryDelayMs: number = 2000
  ): Promise<HotspotServer[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `🔍 Fetching hotspot servers (attempt ${attempt}/${maxRetries})`
        );
        const response = await this.runQuery('/ip/hotspot/print');

        if (!Array.isArray(response)) {
          throw new Error('Invalid response from router - expected an array');
        }

        const servers = response
          .filter((item: any) => item && item.name)
          .map((item: any) => ({
            name: item.name,
            '.id': item['.id'] || '',
          }));

        // Validation: Assume at least one server; adjust if needed
        if (servers.length === 0) {
          throw new Error('No hotspot servers found - expected at least one');
        }

        console.log(
          `✅ Found ${servers.length} hotspot servers:`,
          servers.map((s) => s.name).join(', ')
        );
        return servers;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `⚠️ Attempt ${attempt} failed to get hotspot servers:`,
          error
        );

        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${retryDelayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
    }

    console.error(
      `❌ Failed to get hotspot servers after ${maxRetries} attempts:`,
      lastError
    );
    return [];
  }

  async getHotspotUserProfiles(
    maxRetries: number = 5,
    retryDelayMs: number = 2000
  ): Promise<HotspotProfile[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `🔍 Fetching hotspot user profiles (attempt ${attempt}/${maxRetries})`
        );
        const response = await this.runQuery('/ip/hotspot/user/profile/print');

        if (!Array.isArray(response)) {
          throw new Error('Invalid response from router - expected an array');
        }

        let profiles = response
          .filter((item: any) => item && item.name)
          .map((item: any) => ({
            name: item.name,
            'on-login': item['on-login'] || '',
            '.id': item['.id'] || '',
          }));

        // Manually append expected profiles if missing, like in the Python code
        // In getHotspotUserProfiles function
        const defaultProfiles = ['General', 'General-30d']; // Note the space in "General 30d"
        for (const dp of defaultProfiles) {
          if (!profiles.some((p) => p.name === dp)) {
            profiles.push({
              name: dp,
              'on-login': '',
              '.id': '',
            });
          }
        }

        console.log(
          `✅ Found ${profiles.length} hotspot profiles:`,
          profiles.map((p) => p.name).join(', ')
        );
        return profiles;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `⚠️ Attempt ${attempt} failed to get hotspot profiles:`,
          error
        );

        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${retryDelayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
    }

    console.error(
      `❌ Failed to get hotspot user profiles after ${maxRetries} attempts:`,
      lastError
    );
    return [];
  }

  async createHotspotUserProfile(
    profileName: string,
    onLoginScript?: string
  ): Promise<boolean> {
    try {
      // Fetch existing profiles directly (without manual append) for accurate existence check
      const response = await this.runQuery('/ip/hotspot/user/profile/print');
      const existingProfiles = response
        .filter((item: any) => item && item.name)
        .map((item: any) => item.name);

      console.log(`Existing profiles: ${existingProfiles.join(', ')}`);

      const profileExists = existingProfiles.includes(profileName);

      if (!profileExists) {
        console.log(`ℹ️ Profile '${profileName}' does not exist, creating...`);
        // Create the profile if it doesn't exist
        await this.runQuery('/ip/hotspot/user/profile/add', {
          name: profileName,
          'on-login': 'hotspot-on-login',
        });
      }

      if (onLoginScript) {
        // Fetch updated profiles to find the .id
        const updatedResponse = await this.runQuery(
          '/ip/hotspot/user/profile/print'
        );
        const profiles = updatedResponse
          .filter((item: any) => item && item.name)
          .map((item: any) => ({
            name: item.name,
            'on-login': item['on-login'] || '',
            '.id': item['.id'] || '',
          }));

        const newProfile = profiles.find((p) => p.name === profileName);
        if (!newProfile) {
          throw new Error('Profile not found after creation');
        }

        // Set the on-login script
        await this.runQuery('/ip/hotspot/user/profile/set', {
          '.id': newProfile['.id'],
          'on-login': onLoginScript,
        });
      }

      console.log(`✅ Created hotspot user profile: ${profileName}`);
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to create hotspot user profile '${profileName}':`,
        error
      );
      return false;
    }
  }

  async createGeneral30dProfile(): Promise<boolean> {
    const script30d = `:put (",remc,1,30d,1,,Disable,"); {:local comment [ /ip hotspot user get [/ip hotspot user find where name="$user"] comment]; 
:local ucode [:pic $comment 0 2]; 
:if ($ucode = "vc" or $ucode = "up" or $comment = "") do={ 
  :local date [ /system clock get date ];
  :local year [ :pick $date 7 11 ];
  :local month [ :pick $date 0 3 ]; 
  /sys sch add name="$user" disable=no start-date=$date interval="30d";
  :delay 5s;
  :local exp [ /sys sch get [ /sys sch find where name="$user" ] next-run];
  :local getxp [len $exp];
  :if ($getxp = 15) do={
    :local d [:pic $exp 0 6];
    :local t [:pic $exp 7 16];
    :local s ("/");
    :local exp ("$d$s$year $t");
    /ip hotspot user set comment="$exp" [find where name="$user"]
  };
  :if ($getxp = 8) do={
    /ip hotspot user set comment="$date $exp" [find where name="$user"]
  };
  :if ($getxp > 15) do={
    /ip hotspot user set comment="$exp" [find where name="$user"]
  };
  :delay 5s;
  /sys sch remove [find where name="$user"];
  :local mac $"mac-address";
  :local time [/system clock get time ];
  /system script add name="$date-|-$time-|-$user-|-1-|- $address-|- $mac-|-30d-|-General-30d-|- $comment" owner="$month$year" source="$date" comment="mikhmon"
}}`;

    return await this.createHotspotUserProfile('General-30d', script30d);
  }

  async createHotspotUser(params: {
    name: string;
    password: string;
    profile: string;
    server: string;
    dataLimitBytes?: number;
  }): Promise<boolean> {
    try {
      // determine server to use
      const servers = await this.getHotspotServers();
      const defaultServer =
        servers.length > 0 ? servers[0].name : params.server;

      await this.runQuery('/ip/hotspot/user/add', {
        name: params.name,
        password: params.password,
        profile: params.profile,
        server: defaultServer,
        ...(params.dataLimitBytes
          ? { 'limit-bytes-total': params.dataLimitBytes.toString() }
          : {}),
      });

      console.log(`✅ Created hotspot user: ${params.name}`);
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to create hotspot user '${params.name}':`,
        error
      );
      return false;
    }
  }

  async getHotspotUsers(
    serverName?: string,
    profile?: string,
    limit: number = 1000
  ): Promise<HotspotUser[]> {
    try {
      const response = await this.runQuery('/ip/hotspot/user/print');

      let filteredUsers = response
        .filter((item: any) => item && item.name)
        .map((item: any) => ({
          name: item.name || '',
          password: item.password || '•hidden•',
          profile: item.profile || '',
          server: item.server || '',
          'limit-bytes-total': item['limit-bytes-total'] || '',
          'bytes-in': item['bytes-in'] || '',
          'bytes-out': item['bytes-out'] || '',
          uptime: item.uptime || '',
          comment: item.comment || '',
          '.id': item['.id'] || '',
        }));

      // Apply filters
      if (serverName) {
        filteredUsers = filteredUsers.filter(
          (user: HotspotUser) => user.server === serverName
        );
      }

      if (profile) {
        filteredUsers = filteredUsers.filter(
          (user: HotspotUser) => user.profile === profile
        );
      }

      // Apply limit
      filteredUsers = filteredUsers.slice(0, limit);

      console.log(`✅ Found ${filteredUsers.length} hotspot users`);
      return filteredUsers;
    } catch (error) {
      console.error(`❌ Failed to get hotspot users:`, error);
      return [];
    }
  }

  async removeHotspotUser(userId: string): Promise<boolean> {
    try {
      // For now, skip user removal - need to research proper parameter passing
      console.log(`⚠️ User removal not implemented yet: ${userId}`);
      return false;
    } catch (error) {
      console.error(`❌ Failed to remove hotspot user '${userId}':`, error);
      return false;
    }
  }

  async updateHotspotUser(
    userId: string,
    params: Partial<{
      name: string;
      password: string;
      profile: string;
      server: string;
      dataLimitBytes: number;
    }>
  ): Promise<boolean> {
    try {
      // For now, skip user update - need to research proper parameter passing
      console.log(`⚠️ User update not implemented yet: ${userId}`);
      return false;
    } catch (error) {
      console.error(`❌ Failed to update hotspot user '${userId}':`, error);
      return false;
    }
  }

  async testConnection(): Promise<{
    reachable: boolean;
    apiAvailable: boolean;
    error?: string;
  }> {
    try {
      await this.connect();
      return {
        reachable: true,
        apiAvailable: true,
      };
    } catch (error) {
      return {
        reachable: false,
        apiAvailable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export async function createMikrotikConnection(
  host: string,
  port: number,
  useSSL: boolean = false,
  apiType: 'rest' | 'api' = 'api'
): Promise<MikrotikAPI> {
  return new MikrotikAPI(host, port, useSSL, apiType);
}
