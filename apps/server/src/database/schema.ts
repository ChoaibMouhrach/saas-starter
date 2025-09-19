import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  type UpdateDeleteAction,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { id, timestamps } from "./utils";
import { TOKEN_TYPES, TOKEN_TYPES_VALUES } from "../lib/constants";

export const usersTable = pgTable("users", {
  id: id(),

  // -- fields
  email: text().notNull().unique(),

  // -- timestamps
  confirmedAt: timestamp(),
  ...timestamps(),
});

const userId = (onDelete: UpdateDeleteAction = "cascade") => {
  return uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete });
};

export type TUsersTable = typeof usersTable;
export type TUser = TUsersTable["$inferSelect"];
export type TUserInsert = TUsersTable["$inferInsert"];

export const userRelations = relations(usersTable, ({ many }) => ({
  tokens: many(tokensTable),
  sessions: many(sessionsTable),
  passwords: many(passwordsTable),
}));

export const passwordsTable = pgTable("passwords", {
  id: id(),

  // -- fields
  password: text().notNull(),

  // -- references
  userId: userId(),

  // -- timestamps
  ...timestamps(),
});

export type TPasswordsTable = typeof passwordsTable;
export type TPassword = TPasswordsTable["$inferSelect"];
export type TPasswordInsert = TPasswordsTable["$inferInsert"];

export const passwordRelations = relations(passwordsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [passwordsTable.userId],
    references: [usersTable.id],
  }),
}));

export const tokenTypesEnum = pgEnum("tokenTypesEnum", [
  TOKEN_TYPES.EMAIL_CONFIRMATION,
  ...TOKEN_TYPES_VALUES.filter(
    (type) => type !== TOKEN_TYPES.EMAIL_CONFIRMATION
  ),
]);

export const tokensTable = pgTable("tokens", {
  id: id(),

  // -- fields
  type: tokenTypesEnum().notNull(),
  token: text().notNull(),

  // -- references
  userId: userId(),

  // -- timestamps
  expiresAt: timestamp({ mode: "date" }).notNull(),
  ...timestamps(),
});

export type TTokensTable = typeof tokensTable;
export type TToken = TTokensTable["$inferSelect"];
export type TTokenInsert = TTokensTable["$inferInsert"];

export const tokenRelations = relations(tokensTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [tokensTable.userId],
    references: [usersTable.id],
  }),
}));

export const sessionsTable = pgTable("sessions", {
  id: id(),

  // -- fields
  session: uuid().notNull().defaultRandom(),

  // -- references
  userId: userId(),

  // -- timestamps
  expiresAt: timestamp({ mode: "date" }).notNull(),
  ...timestamps(),
});

export type TSessionsTable = typeof sessionsTable;
export type TSession = TSessionsTable["$inferSelect"];
export type TSessionInsert = TSessionsTable["$inferInsert"];

export const sessionRelations = relations(sessionsTable, ({ one }) => ({
  member: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));
