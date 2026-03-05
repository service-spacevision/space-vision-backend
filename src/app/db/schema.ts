// Central schema file - imports all models and defines relations
import { users } from '../models/User';
import { sessions } from '../models/Session';
import { userRoles } from '../models/UserRole';
import { organizations } from '../models/Organization';
import { vessels } from '../models/Vessel';
import { vesselGroups } from '../models/VesselGroup';
import { groupAccess } from '../models/GroupAccess';
import { starlinkUsage } from '../models/StarlinkUsage';
import { bluetideUsage } from '../models/BluetideUsage';
import { bluetideTelemetry } from '../models/BluetideTelemetry';
import { mikrotikVessels } from '../models/MikrotikVessel';
import { mikrotikUsageSession } from '../models/MikrotikUsageSession';
import { mikrotikUsageAlltime } from '../models/MikrotikUsageAlltime';
import { mikrotikPermissions } from '../models/MikrotikPermission';
import { permissions, permissionScopeEnum } from '../models/Permission';
import { rolesPermission } from '../models/RolePermission';
import { telephonyDids } from '../models/TelephonyDid';
import { pins } from '../models/Pin';
import { syncState } from '../models/SyncState';
import { hrPolicyConfigs } from '../models/HrPolicyConfig';
import { hrLeaveTypes } from '../models/HrLeaveType';
import { hrEmployeeProfiles } from '../models/HrEmployeeProfile';
import { hrTimeSessions } from '../models/HrTimeSession';
import { hrTimeBreaks } from '../models/HrTimeBreak';
import { hrTimeSessionApprovals } from '../models/HrTimeSessionApproval';
import { hrTimePunchEvents } from '../models/HrTimePunchEvent';
import { hrTimeBreakApprovals } from '../models/HrTimeBreakApproval';
import { hrLeaveRequests } from '../models/HrLeaveRequest';
import { hrLeaveApprovals } from '../models/HrLeaveApproval';
import { hrLeaveBalances } from '../models/HrLeaveBalance';
import { hrShifts } from '../models/HrShift';
import { hrShiftGroups } from '../models/HrShiftGroup';
import { hrShiftGroupMembers } from '../models/HrShiftGroupMember';
import { hrShiftLayouts } from '../models/HrShiftLayout';
import { hrShiftLayoutRules } from '../models/HrShiftLayoutRule';

// Re-export all models
export { users } from '../models/User';
export { sessions } from '../models/Session';
export { userRoles } from '../models/UserRole';
export { organizations } from '../models/Organization';
export { vessels } from '../models/Vessel';
export { vesselGroups } from '../models/VesselGroup';
export { groupAccess } from '../models/GroupAccess';
export { starlinkUsage } from '../models/StarlinkUsage';
export { bluetideUsage } from '../models/BluetideUsage';
export { bluetideTelemetry } from '../models/BluetideTelemetry';
export { mikrotikVessels } from '../models/MikrotikVessel';
export { mikrotikUsageSession } from '../models/MikrotikUsageSession';
export { mikrotikUsageAlltime } from '../models/MikrotikUsageAlltime';
export { mikrotikPermissions } from '../models/MikrotikPermission';
export { rolesPermission } from '../models/RolePermission';
export { telephonyDids } from '../models/TelephonyDid';
export { pins } from '../models/Pin';
export { permissions } from '../models/Permission';
export { syncState } from '../models/SyncState';
export { hrPolicyConfigs } from '../models/HrPolicyConfig';
export { hrLeaveTypes } from '../models/HrLeaveType';
export { hrEmployeeProfiles } from '../models/HrEmployeeProfile';
export { hrTimeSessions } from '../models/HrTimeSession';
export { hrTimeBreaks } from '../models/HrTimeBreak';
export { hrTimeSessionApprovals } from '../models/HrTimeSessionApproval';
export { hrTimePunchEvents } from '../models/HrTimePunchEvent';
export { hrTimeBreakApprovals } from '../models/HrTimeBreakApproval';
export { hrLeaveRequests } from '../models/HrLeaveRequest';
export { hrLeaveApprovals } from '../models/HrLeaveApproval';
export { hrLeaveBalances } from '../models/HrLeaveBalance';
export { hrShifts } from '../models/HrShift';
export { hrShiftGroups } from '../models/HrShiftGroup';
export { hrShiftGroupMembers } from '../models/HrShiftGroupMember';
export { hrShiftLayouts } from '../models/HrShiftLayout';
export { hrShiftLayoutRules } from '../models/HrShiftLayoutRule';

// Export enum values with type-safe names
export {
  permissionScopeEnum,
  permissionCategory as permissionCategoryEnum,
  permissionSection as permissionSectionEnum,
  permissionScope as permissionScopeValues,
} from '../models/Permission';
