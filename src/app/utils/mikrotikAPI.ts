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

  async getHotspotServers(): Promise<HotspotServer[]> {
    try {
      const response = await this.runQuery('/ip/hotspot/print');
      return response
        .filter((item: any) => item && item.name)
        .map((item: any) => ({
          name: item.name,
          '.id': item['.id'] || '',
        }));
    } catch (error) {
      console.error(`❌ Failed to get hotspot servers:`, error);
      return [];
    }
  }

  async getHotspotUserProfiles(): Promise<HotspotProfile[]> {
    try {
      const response = await this.runQuery('/ip/hotspot/user/profile/print');
      return response
        .filter((item: any) => item && item.name)
        .map((item: any) => ({
          name: item.name,
          'on-login': item['on-login'] || '',
          '.id': item['.id'] || '',
        }));
    } catch (error) {
      console.error(`❌ Failed to get hotspot user profiles:`, error);
      return [];
    }
  }

  async createHotspotUserProfile(
    profileName: string,
    onLoginScript?: string
  ): Promise<boolean> {
    try {
      // Check if profile already exists
      const existingProfiles = await this.getHotspotUserProfiles();
      if (existingProfiles.some((p) => p.name === profileName)) {
        console.log(`ℹ️ Profile '${profileName}' already exists`);
        return true;
      }

      // Add the profile
      await this.runQuery('/ip/hotspot/user/profile/add', {
        name: profileName,
      });

      if (onLoginScript) {
        // Find the .id of the new profile
        const profiles = await this.getHotspotUserProfiles();
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

    return await this.createHotspotUserProfile('General 30d', script30d);
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
    limit: number = 200
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
