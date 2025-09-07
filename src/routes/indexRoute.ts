// Central route exports
import authRoute from "./authRoute/authRoute";
import userRoute from "./userRoute/userRoute";
import userRoleRoute from "./userRoleRoute/userRoleRoute";
import systemRoute from "./systemRoute/systemRoute";
import vesselRoute from "./vesselRoute/vesselRoute";
import vesselGroupRoute from "./vesselGroupRoute/vesselGroupRoute";
import groupAccessRoute from "./groupAccessRoute/groupAccessRoute";
import starlinkUsageRoute from "./starlinkUsageRoute/starlinkUsageRoute";
import bluetideUsageRoute from "./bluetideUsageRoute/bluetideUsageRoute";
import mikrotikVesselRoute from "./mikrotikVesselRoute/mikrotikVesselRoute";
import telephonyDidRoute from "./telephonyDidRoute/telephonyDidRoute";
import pinManagementRoute from "./pinManagementRoute/pinManagementRoute";

export {
  authRoute as authRoutes,
  userRoute as userRoutes,
  userRoleRoute as userRoleRoutes,
  systemRoute as systemRoutes,
  vesselRoute as vesselRoutes,
  vesselGroupRoute as vesselGroupRoutes,
  groupAccessRoute as groupAccessRoutes,
  starlinkUsageRoute as starlinkUsageRoutes,
  bluetideUsageRoute as bluetideUsageRoutes,
  mikrotikVesselRoute as mikrotikVesselRoutes,
  telephonyDidRoute as telephonyDidRoutes,
  pinManagementRoute as pinManagementRoutes,
};
