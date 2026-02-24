import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  users: {
    sessions: r.many.sessions({
      from: r.users.id,
      to: r.sessions.userId,
    }),
    role: r.one.userRoles({
      from: r.users.roleId,
      to: r.userRoles.id,
      alias: 'user_role',
    }),
    organization: r.one.organizations({
      from: r.users.organizationId,
      to: r.organizations.id,
      alias: 'user_organization',
    }),
    employeeProfiles: r.many.hrEmployeeProfiles({
      from: r.users.id,
      to: r.hrEmployeeProfiles.userId,
      alias: 'hr_employee_profile_user',
    }),
  },

  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },

  userRoles: {
    users: r.many.users({
      from: r.userRoles.id,
      to: r.users.roleId,
      alias: 'user_role',
    }),
    organization: r.one.organizations({
      from: r.userRoles.organizationName,
      to: r.organizations.name,
      alias: 'role_organization',
    }),
    rolesPermission: r.one.rolesPermission({
      from: r.userRoles.id,
      to: r.rolesPermission.roleId,
      alias: 'role_permission_role',
    }),
  },

  organizations: {
    parent: r.one.organizations({
      from: r.organizations.parent_org_name,
      to: r.organizations.name,
      alias: 'organization_parent',
    }),
    policyConfigs: r.many.hrPolicyConfigs({
      from: r.organizations.id,
      to: r.hrPolicyConfigs.organizationId,
      alias: 'hr_policy_config_organization',
    }),
    leaveTypes: r.many.hrLeaveTypes({
      from: r.organizations.id,
      to: r.hrLeaveTypes.organizationId,
      alias: 'hr_leave_type_organization',
    }),
    employeeProfiles: r.many.hrEmployeeProfiles({
      from: r.organizations.id,
      to: r.hrEmployeeProfiles.organizationId,
      alias: 'hr_employee_profile_organization',
    }),
  },

  rolesPermission: {
    role: r.one.userRoles({
      from: r.rolesPermission.roleId,
      to: r.userRoles.id,
      alias: 'role_permission_role',
    }),
  },

  vesselGroups: {
    vessels: r.many.vessels({
      from: r.vesselGroups.id,
      to: r.vessels.groupId,
      alias: 'vessel_group_vessel',
    }),
    groupAccess: r.many.groupAccess({
      from: r.vesselGroups.id,
      to: r.groupAccess.groupId,
      alias: 'vessel_group_access',
    }),
  },

  vessels: {
    group: r.one.vesselGroups({
      from: r.vessels.groupId,
      to: r.vesselGroups.id,
      alias: 'vessel_group_vessel',
    }),
    starlinkUsage: r.many.starlinkUsage({
      from: r.vessels.vesselsKitNumber,
      to: r.starlinkUsage.kitNumber,
      alias: 'vessel_starlink_usage',
    }),
    mikrotikVessel: r.one.mikrotikVessels({
      from: r.vessels.name,
      to: r.mikrotikVessels.vesselName,
      alias: 'vessel_mikrotik',
    }),
  },

  mikrotikVessels: {
    permissions: r.many.mikrotikPermissions({
      from: r.mikrotikVessels.id,
      to: r.mikrotikPermissions.vesselId,
      alias: 'mikrotik_vessel_permissions',
    }),
    vessel: r.one.vessels({
      from: r.mikrotikVessels.vesselName,
      to: r.vessels.name,
      alias: 'vessel_mikrotik',
    }),
  },

  mikrotikPermissions: {
    mikrotikVessel: r.one.mikrotikVessels({
      from: r.mikrotikPermissions.vesselId,
      to: r.mikrotikVessels.id,
      alias: 'mikrotik_vessel_permissions',
    }),
    organization: r.one.organizations({
      from: r.mikrotikPermissions.organizationId,
      to: r.organizations.id,
      alias: 'mikrotik_permission_organization',
    }),
    assignedBy: r.one.users({
      from: r.mikrotikPermissions.assignedById,
      to: r.users.id,
      alias: 'mikrotik_permission_assigned_by',
    }),
  },

  groupAccess: {
    group: r.one.vesselGroups({
      from: r.groupAccess.groupId,
      to: r.vesselGroups.id,
      alias: 'vessel_group_access',
    }),
  },

  starlinkUsage: {
    vessel: r.one.vessels({
      from: r.starlinkUsage.kitNumber,
      to: r.vessels.vesselsKitNumber,
      alias: 'vessel_starlink_usage',
    }),
  },

  pins: {
    vessel: r.one.mikrotikVessels({
      from: r.pins.vessel_id,
      to: r.mikrotikVessels.id,
      alias: 'pin_vessel',
    }),
    generatedBy: r.one.users({
      from: r.pins.generated_by,
      to: r.users.id,
      alias: 'pin_generated_by',
    }),
  },

  hrPolicyConfigs: {
    organization: r.one.organizations({
      from: r.hrPolicyConfigs.organizationId,
      to: r.organizations.id,
      alias: 'hr_policy_config_organization',
    }),
  },

  hrLeaveTypes: {
    organization: r.one.organizations({
      from: r.hrLeaveTypes.organizationId,
      to: r.organizations.id,
      alias: 'hr_leave_type_organization',
    }),
  },

  hrEmployeeProfiles: {
    user: r.one.users({
      from: r.hrEmployeeProfiles.userId,
      to: r.users.id,
      alias: 'hr_employee_profile_user',
    }),
    organization: r.one.organizations({
      from: r.hrEmployeeProfiles.organizationId,
      to: r.organizations.id,
      alias: 'hr_employee_profile_organization',
    }),
    manager: r.one.users({
      from: r.hrEmployeeProfiles.reportsToUserId,
      to: r.users.id,
      alias: 'hr_employee_profile_manager',
    }),
    timeSessions: r.many.hrTimeSessions({
      from: r.hrEmployeeProfiles.id,
      to: r.hrTimeSessions.employeeProfileId,
      alias: 'hr_time_session_employee_profile',
    }),
    leaveRequests: r.many.hrLeaveRequests({
      from: r.hrEmployeeProfiles.id,
      to: r.hrLeaveRequests.employeeProfileId,
      alias: 'hr_leave_request_employee_profile',
    }),
  },

  hrTimeSessions: {
    organization: r.one.organizations({
      from: r.hrTimeSessions.organizationId,
      to: r.organizations.id,
      alias: 'hr_time_session_organization',
    }),
    employeeProfile: r.one.hrEmployeeProfiles({
      from: r.hrTimeSessions.employeeProfileId,
      to: r.hrEmployeeProfiles.id,
      alias: 'hr_time_session_employee_profile',
    }),
    breaks: r.many.hrTimeBreaks({
      from: r.hrTimeSessions.id,
      to: r.hrTimeBreaks.timeSessionId,
      alias: 'hr_time_break_session',
    }),
    approval: r.one.hrTimeSessionApprovals({
      from: r.hrTimeSessions.id,
      to: r.hrTimeSessionApprovals.timeSessionId,
      alias: 'hr_time_session_approval_session',
    }),
  },

  hrTimeBreaks: {
    organization: r.one.organizations({
      from: r.hrTimeBreaks.organizationId,
      to: r.organizations.id,
      alias: 'hr_time_break_organization',
    }),
    session: r.one.hrTimeSessions({
      from: r.hrTimeBreaks.timeSessionId,
      to: r.hrTimeSessions.id,
      alias: 'hr_time_break_session',
    }),
    approval: r.one.hrTimeBreakApprovals({
      from: r.hrTimeBreaks.id,
      to: r.hrTimeBreakApprovals.timeBreakId,
      alias: 'hr_time_break_approval_break',
    }),
  },

  hrTimeSessionApprovals: {
    organization: r.one.organizations({
      from: r.hrTimeSessionApprovals.organizationId,
      to: r.organizations.id,
      alias: 'hr_time_session_approval_organization',
    }),
    session: r.one.hrTimeSessions({
      from: r.hrTimeSessionApprovals.timeSessionId,
      to: r.hrTimeSessions.id,
      alias: 'hr_time_session_approval_session',
    }),
    requestedBy: r.one.users({
      from: r.hrTimeSessionApprovals.requestedByUserId,
      to: r.users.id,
      alias: 'hr_time_session_approval_requested_by',
    }),
    approver: r.one.users({
      from: r.hrTimeSessionApprovals.approverUserId,
      to: r.users.id,
      alias: 'hr_time_session_approval_approver',
    }),
  },

  hrTimeBreakApprovals: {
    organization: r.one.organizations({
      from: r.hrTimeBreakApprovals.organizationId,
      to: r.organizations.id,
      alias: 'hr_time_break_approval_organization',
    }),
    timeBreak: r.one.hrTimeBreaks({
      from: r.hrTimeBreakApprovals.timeBreakId,
      to: r.hrTimeBreaks.id,
      alias: 'hr_time_break_approval_break',
    }),
    requestedBy: r.one.users({
      from: r.hrTimeBreakApprovals.requestedByUserId,
      to: r.users.id,
      alias: 'hr_time_break_approval_requested_by',
    }),
    approver: r.one.users({
      from: r.hrTimeBreakApprovals.approverUserId,
      to: r.users.id,
      alias: 'hr_time_break_approval_approver',
    }),
  },

  hrLeaveRequests: {
    organization: r.one.organizations({
      from: r.hrLeaveRequests.organizationId,
      to: r.organizations.id,
      alias: 'hr_leave_request_organization',
    }),
    employeeProfile: r.one.hrEmployeeProfiles({
      from: r.hrLeaveRequests.employeeProfileId,
      to: r.hrEmployeeProfiles.id,
      alias: 'hr_leave_request_employee_profile',
    }),
    leaveType: r.one.hrLeaveTypes({
      from: r.hrLeaveRequests.leaveTypeId,
      to: r.hrLeaveTypes.id,
      alias: 'hr_leave_request_leave_type',
    }),
    requestedBy: r.one.users({
      from: r.hrLeaveRequests.requestedByUserId,
      to: r.users.id,
      alias: 'hr_leave_request_requested_by',
    }),
    approval: r.one.hrLeaveApprovals({
      from: r.hrLeaveRequests.id,
      to: r.hrLeaveApprovals.leaveRequestId,
      alias: 'hr_leave_approval_request',
    }),
  },

  hrLeaveApprovals: {
    organization: r.one.organizations({
      from: r.hrLeaveApprovals.organizationId,
      to: r.organizations.id,
      alias: 'hr_leave_approval_organization',
    }),
    leaveRequest: r.one.hrLeaveRequests({
      from: r.hrLeaveApprovals.leaveRequestId,
      to: r.hrLeaveRequests.id,
      alias: 'hr_leave_approval_request',
    }),
    requestedBy: r.one.users({
      from: r.hrLeaveApprovals.requestedByUserId,
      to: r.users.id,
      alias: 'hr_leave_approval_requested_by',
    }),
    approver: r.one.users({
      from: r.hrLeaveApprovals.approverUserId,
      to: r.users.id,
      alias: 'hr_leave_approval_approver',
    }),
  },

  hrLeaveBalances: {
    organization: r.one.organizations({
      from: r.hrLeaveBalances.organizationId,
      to: r.organizations.id,
      alias: 'hr_leave_balance_organization',
    }),
    employeeProfile: r.one.hrEmployeeProfiles({
      from: r.hrLeaveBalances.employeeProfileId,
      to: r.hrEmployeeProfiles.id,
      alias: 'hr_leave_balance_employee_profile',
    }),
    leaveType: r.one.hrLeaveTypes({
      from: r.hrLeaveBalances.leaveTypeId,
      to: r.hrLeaveTypes.id,
      alias: 'hr_leave_balance_leave_type',
    }),
  },
}));
