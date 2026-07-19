import {z} from 'zod';

const isoDatetime = z.iso.datetime({offset: true});

export const beaconEventSchema = z.object({
  name: z.string().min(1).max(64),
  siteId: z.string().min(1).max(128),
  ts: isoDatetime.optional(),
  anonId: z.string().max(64).optional(),
  sessionId: z.string().max(64).optional(),
  url: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  utm: z
    .object({
      source: z.string().max(256).nullable(),
      medium: z.string().max(256).nullable(),
      campaign: z.string().max(256).nullable(),
      term: z.string().max(256).nullable(),
      content: z.string().max(256).nullable(),
    })
    .partial()
    .optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});

export const beaconBatchSchema = z.object({
  sdk: z.object({name: z.string().max(64), version: z.string().max(32)}).optional(),
  sentAt: isoDatetime.optional(),
  events: z.array(beaconEventSchema).min(1).max(50),
});

export type BeaconEvent = z.infer<typeof beaconEventSchema>;
export type BeaconBatch = z.infer<typeof beaconBatchSchema>;
