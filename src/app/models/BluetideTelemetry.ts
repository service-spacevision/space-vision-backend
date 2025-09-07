import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { pgTable, text, timestamp, serial, real, integer, doublePrecision } from 'drizzle-orm/pg-core'
import { t } from 'elysia'

export const bluetideTelemetry = pgTable('bluetide_telemetry', {
  id: serial('id').primaryKey(),
  account_number: text('account_number').notNull(),
  device_id: text('device_id').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  downlink_throughput_mbps: real('downlink_throughput_mbps'),
  uplink_throughput_mbps: real('uplink_throughput_mbps'),
  ping_drop_rate_avg: real('ping_drop_rate_avg'),
  ping_latency_ms_avg: integer('ping_latency_ms_avg'),
  obstruction_percent_time: real('obstruction_percent_time'),
  uptime_seconds: integer('uptime_seconds'),
  signal_quality_percent: real('signal_quality_percent'),
  h3_cell_id: text('h3_cell_id'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  seconds_until_swupdate_reboot_possible: integer('seconds_until_swupdate_reboot_possible'),
  running_software_version: text('running_software_version'),
  active_alert_count: integer('active_alert_count'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export type BluetideTelemetry = InferSelectModel<typeof bluetideTelemetry>
export type NewBluetideTelemetry = InferInsertModel<typeof bluetideTelemetry>

export const CreateBluetideTelemetrySchema = t.Object({
  account_number: t.String({
    description: 'Account number associated with the device'
  }),
  device_id: t.String({
    description: 'Unique identifier of the device'
  }),
  timestamp: t.String({
    format: 'date-time',
    description: 'Timestamp of the telemetry data'
  }),
  downlink_throughput_mbps: t.Optional(t.Number({
    description: 'Downlink throughput in Mbps'
  })),
  uplink_throughput_mbps: t.Optional(t.Number({
    description: 'Uplink throughput in Mbps'
  })),
  ping_drop_rate_avg: t.Optional(t.Number({
    description: 'Average ping drop rate'
  })),
  ping_latency_ms_avg: t.Optional(t.Number({
    description: 'Average ping latency in milliseconds'
  })),
  obstruction_percent_time: t.Optional(t.Number({
    description: 'Percentage of time with obstructions'
  })),
  uptime_seconds: t.Optional(t.Number({
    description: 'Device uptime in seconds'
  })),
  signal_quality_percent: t.Optional(t.Number({
    description: 'Signal quality percentage'
  })),
  h3_cell_id: t.Optional(t.String({
    description: 'H3 cell identifier for geospatial indexing'
  })),
  latitude: t.Optional(t.Number({
    description: 'Latitude coordinate of the device'
  })),
  longitude: t.Optional(t.Number({
    description: 'Longitude coordinate of the device'
  })),
  seconds_until_swupdate_reboot_possible: t.Optional(t.Number({
    description: 'Seconds until software update reboot is possible'
  })),
  running_software_version: t.Optional(t.String({
    description: 'Currently running software version'
  })),
  active_alert_count: t.Optional(t.Number({
    description: 'Number of active alerts'
  }))
})

export const BluetideTelemetryResponseSchema = t.Object({
  id: t.Number(),
  account_number: t.String(),
  device_id: t.String(),
  timestamp: t.String({ format: 'date-time' }),
  downlink_throughput_mbps: t.Optional(t.Number()),
  uplink_throughput_mbps: t.Optional(t.Number()),
  ping_drop_rate_avg: t.Optional(t.Number()),
  ping_latency_ms_avg: t.Optional(t.Number()),
  obstruction_percent_time: t.Optional(t.Number()),
  uptime_seconds: t.Optional(t.Number()),
  signal_quality_percent: t.Optional(t.Number()),
  h3_cell_id: t.Optional(t.String()),
  latitude: t.Optional(t.Number()),
  longitude: t.Optional(t.Number()),
  seconds_until_swupdate_reboot_possible: t.Optional(t.Number()),
  running_software_version: t.Optional(t.String()),
  active_alert_count: t.Optional(t.Number()),
  created_at: t.String({ format: 'date-time' }),
  updated_at: t.String({ format: 'date-time' })
})
