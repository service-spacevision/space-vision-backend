import { MikrotikService } from "../../../services/MikrotikService";

export async function syncMikrotikUsage() {
  // Run the sync in the background
  MikrotikService.syncMikrotikUsage().catch(console.error);
  
  return {
    message: "Mikrotik usage sync started in the background"
  };
}
