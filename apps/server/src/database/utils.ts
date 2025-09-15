import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = () => {
  return uuid().primaryKey().defaultRandom();
};

export const timestamps = () => ({
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp(),
});
