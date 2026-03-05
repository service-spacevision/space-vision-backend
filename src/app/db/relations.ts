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
    shiftGroups: r.many.hrShiftGroups({
      from: r.organizations.id,
      to: r.hrShiftGroups.organizationId,
      alias: 'hr_shift_group_organization',
    }),
    shifts: r.many.hrShifts({
      from: r.organizations.id,
      to: r.hrShifts.organizationId,
      alias: 'hr_shift_organization',
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
    employeeProfiles: r.many.hrEmployeeProfiles({
      from: r.hrPolicyConfigs.id,
      to: r.hrEmployeeProfiles.policyId,
      alias: 'hr_employee_profile_policy',
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
    policy: r.one.hrPolicyConfigs({
      from: r.hrEmployeeProfiles.policyId,
      to: r.hrPolicyConfigs.id,
      alias: 'hr_employee_profile_policy',
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
    shifts: r.many.hrShifts({
      from: r.hrEmployeeProfiles.id,
      to: r.hrShifts.employeeProfileId,
      alias: 'hr_shift_employee_profile',
    }),
    shiftGroupMembers: r.many.hrShiftGroupMembers({
      from: r.hrEmployeeProfiles.id,
      to: r.hrShiftGroupMembers.employeeProfileId,
      alias: 'hr_shift_group_member_employee_profile',
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
    punchEvents: r.many.hrTimePunchEvents({
      from: r.hrTimeSessions.id,
      to: r.hrTimePunchEvents.timeSessionId,
      alias: 'hr_time_punch_event_session',
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

  hrShiftGroups: {
    organization: r.one.organizations({
      from: r.hrShiftGroups.organizationId,
      to: r.organizations.id,
      alias: 'hr_shift_group_organization',
    }),
    members: r.many.hrShiftGroupMembers({
      from: r.hrShiftGroups.id,
      to: r.hrShiftGroupMembers.shiftGroupId,
      alias: 'hr_shift_group_member_group',
    }),
    layouts: r.many.hrShiftLayouts({
      from: r.hrShiftGroups.id,
      to: r.hrShiftLayouts.shiftGroupId,
      alias: 'hr_shift_layout_group',
    }),
    shifts: r.many.hrShifts({
      from: r.hrShiftGroups.id,
      to: r.hrShifts.shiftGroupId,
      alias: 'hr_shift_group_shift',
    }),
  },

  hrShiftGroupMembers: {
    group: r.one.hrShiftGroups({
      from: r.hrShiftGroupMembers.shiftGroupId,
      to: r.hrShiftGroups.id,
      alias: 'hr_shift_group_member_group',
    }),
    employeeProfile: r.one.hrEmployeeProfiles({
      from: r.hrShiftGroupMembers.employeeProfileId,
      to: r.hrEmployeeProfiles.id,
      alias: 'hr_shift_group_member_employee_profile',
    }),
    organization: r.one.organizations({
      from: r.hrShiftGroupMembers.organizationId,
      to: r.organizations.id,
      alias: 'hr_shift_group_member_organization',
    }),
  },

  hrShiftLayouts: {
    group: r.one.hrShiftGroups({
      from: r.hrShiftLayouts.shiftGroupId,
      to: r.hrShiftGroups.id,
      alias: 'hr_shift_layout_group',
    }),
    organization: r.one.organizations({
      from: r.hrShiftLayouts.organizationId,
      to: r.organizations.id,
      alias: 'hr_shift_layout_organization',
    }),
    rules: r.many.hrShiftLayoutRules({
      from: r.hrShiftLayouts.id,
      to: r.hrShiftLayoutRules.layoutId,
      alias: 'hr_shift_layout_rule_layout',
    }),
    shifts: r.many.hrShifts({
      from: r.hrShiftLayouts.id,
      to: r.hrShifts.layoutId,
      alias: 'hr_shift_layout_shift',
    }),
  },

  hrShiftLayoutRules: {
    layout: r.one.hrShiftLayouts({
      from: r.hrShiftLayoutRules.layoutId,
      to: r.hrShiftLayouts.id,
      alias: 'hr_shift_layout_rule_layout',
    }),
    organization: r.one.organizations({
      from: r.hrShiftLayoutRules.organizationId,
      to: r.organizations.id,
      alias: 'hr_shift_layout_rule_organization',
    }),
    shifts: r.many.hrShifts({
      from: r.hrShiftLayoutRules.id,
      to: r.hrShifts.layoutRuleId,
      alias: 'hr_shift_layout_rule_shift',
    }),
  },

  hrShifts: {
    organization: r.one.organizations({
      from: r.hrShifts.organizationId,
      to: r.organizations.id,
      alias: 'hr_shift_organization',
    }),
    employeeProfile: r.one.hrEmployeeProfiles({
      from: r.hrShifts.employeeProfileId,
      to: r.hrEmployeeProfiles.id,
      alias: 'hr_shift_employee_profile',
    }),
    group: r.one.hrShiftGroups({
      from: r.hrShifts.shiftGroupId,
      to: r.hrShiftGroups.id,
      alias: 'hr_shift_group_shift',
    }),
    layout: r.one.hrShiftLayouts({
      from: r.hrShifts.layoutId,
      to: r.hrShiftLayouts.id,
      alias: 'hr_shift_layout_shift',
    }),
    layoutRule: r.one.hrShiftLayoutRules({
      from: r.hrShifts.layoutRuleId,
      to: r.hrShiftLayoutRules.id,
      alias: 'hr_shift_layout_rule_shift',
    }),
  },

  hrTimePunchEvents: {
    session: r.one.hrTimeSessions({
      from: r.hrTimePunchEvents.timeSessionId,
      to: r.hrTimeSessions.id,
      alias: 'hr_time_punch_event_session',
    }),
    employeeProfile: r.one.hrEmployeeProfiles({
      from: r.hrTimePunchEvents.employeeProfileId,
      to: r.hrEmployeeProfiles.id,
      alias: 'hr_time_punch_event_employee',
    }),
    organization: r.one.organizations({
      from: r.hrTimePunchEvents.organizationId,
      to: r.organizations.id,
      alias: 'hr_time_punch_event_organization',
    }),
    user: r.one.users({
      from: r.hrTimePunchEvents.userId,
      to: r.users.id,
      alias: 'hr_time_punch_event_user',
    }),
  },
}));
