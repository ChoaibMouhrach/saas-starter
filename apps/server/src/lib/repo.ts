import { AppError } from "./error";
import type { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  type InferInsertModel,
  type InferSelectModel,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  not,
  or,
  SQL,
  sql,
} from "drizzle-orm";
import type { DbClient } from "./drizzle";

export abstract class BaseRepoInstance<
  Table extends AnyPgTable & { id: AnyPgColumn },
  TR = InferSelectModel<Table>
> {
  public data;
  public repo;

  public constructor(options: {
    data: TR;
    repo: BaseRepo<Table, BaseRepoInstance<Table>, any>;
  }) {
    this.data = options.data;
    this.repo = options.repo;
  }

  public save() {
    let data = this.data as any;

    return this.repo.update(this.data as never, {
      where: {
        ids: [data.id],
      },
    });
  }

  public remove() {
    let data = this.data as any;

    return this.repo.remove({
      where: {
        ids: [data.id],
      },
    });
  }

  public toJSON() {
    return this.data;
  }
}

export abstract class BaseRepo<
  Table extends AnyPgTable & { id: AnyPgColumn },
  TInstance extends BaseRepoInstance<Table>,
  TRelations extends Partial<InferSelectModel<Table>>,
  TR = InferSelectModel<Table>,
  TRI = InferInsertModel<Table>
> {
  public dbClient;
  protected abstract notFoundError: AppError;
  protected relations: TRelations | undefined;
  protected abstract table: AnyPgTable & { id: AnyPgColumn };

  public constructor(context: { dbClient: DbClient }, relations?: TRelations) {
    this.dbClient = context.dbClient;
    this.relations = relations;
  }

  public getBaseConditions(): (SQL | undefined)[] {
    if (!this.relations) return [];

    return Object.entries(this.relations).map(([key, value]) => {
      return eq(this.table[key as never], value);
    });
  }

  public abstract mapInstance(data: TR): TInstance;

  public mapInstances(recs: TR[]) {
    return recs.map((rec) => this.mapInstance(rec));
  }

  public async create(inputs: OmitNonUndefined<TRI, TRelations>[]) {
    console.log(
      inputs.map((input) => {
        return this.relations ? { ...input, ...this.relations } : input;
      })
    );

    if (!inputs.length) return [];

    const recs = await this.dbClient
      .insert(this.table)
      .values(
        inputs.map((input) => {
          return this.relations ? { ...input, ...this.relations } : input;
        })
      )
      .returning();

    return this.mapInstances(recs as TR[]);
  }

  public async createFirst(input: OmitNonUndefined<TRI, TRelations>) {
    const recs = await this.create([input]);
    const rec = recs.at(0);

    if (!rec) {
      // TODO: take a look
      throw this.notFoundError;
    }

    return rec;
  }

  public update(input: Partial<TR>, options?: { where?: { ids: string[] } }) {
    return this.dbClient
      .update(this.table)
      .set(input)
      .where(
        and(
          ...this.getBaseConditions(),
          options?.where ? inArray(this.table.id, options.where.ids) : undefined
        )
      );
  }

  public async find(options?: FindOptions<TR>) {
    let query = this.dbClient.select().from(this.table).$dynamic();

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    if (options?.orderBy) {
      query = query.orderBy(
        ...Object.entries(options.orderBy).map(([k, value]) => {
          const key = k as keyof TR;
          const column = this.table[key as never];
          return value === "desc" ? desc(column) : asc(column);
        })
      );
    }

    const conditions: (SQL | undefined)[] = [
      ...this.getBaseConditions(),
      ...(options?.where ? [this.buildWhereCondition(options.where)] : []),
    ];

    const recs = await query.where(and(...conditions.filter(Boolean)));
    return this.mapInstances(recs as TR[]);
  }

  public async findFirst(options?: Parameters<typeof this.find>[0]) {
    // TODO: add limit to find later
    const recs = await this.find(options);
    const rec = recs.at(0);
    return rec || null;
  }

  public async findFirstOrThrow(options?: Parameters<typeof this.find>[0]) {
    const rec = await this.findFirst(options);
    if (rec) return rec;
    throw this.notFoundError;
  }

  public async count(options?: FindOptions<TR>) {
    let query = this.dbClient
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(this.table)
      .$dynamic();

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    if (options?.orderBy) {
      query = query.orderBy(
        ...Object.entries(options.orderBy).map(([k, value]) => {
          const key = k as keyof TR;
          const column = this.table[key as never];
          return value === "desc" ? desc(column) : asc(column);
        })
      );
    }

    const conditions: (SQL | undefined)[] = [
      ...this.getBaseConditions(),
      ...(options?.where ? [this.buildWhereCondition(options.where)] : []),
    ];

    const recs = await query.where(and(...conditions.filter(Boolean)));

    return recs.at(0)?.count;
  }

  private buildWhereCondition(condition: WhereCondition<TR>): SQL | undefined {
    const conditions: (SQL | undefined)[] = [];

    // Handle AND conditions
    if (condition.and && condition.and.length > 0) {
      const andConditions = condition.and
        .filter((c): c is WhereCondition<TR> => c !== undefined)
        .map((c) => this.buildWhereCondition(c))
        .filter(Boolean) as SQL[];
      if (andConditions.length > 0) {
        conditions.push(and(...andConditions));
      }
    }

    // Handle OR conditions
    if (condition.or && condition.or.length > 0) {
      const orConditions = condition.or
        .filter((c): c is WhereCondition<TR> => c !== undefined)
        .map((c) => this.buildWhereCondition(c))
        .filter(Boolean) as SQL[];

      if (orConditions.length > 0) {
        conditions.push(or(...orConditions));
      }
    }

    // Handle IDs array
    if (condition.ids && condition.ids.length > 0) {
      conditions.push(inArray(this.table.id, condition.ids));
    }

    // Handle field conditions
    if (condition.field) {
      Object.entries(condition.field).forEach(
        ([fieldName, fieldConditions]) => {
          const column = this.table[fieldName as never];

          Object.entries(fieldConditions as any).forEach(
            ([operator, value]) => {
              if (value === undefined || value === null) return;

              switch (operator) {
                case "eq":
                  conditions.push(eq(column, value));
                  break;
                case "ne":
                  conditions.push(ne(column, value));
                  break;
                case "gt":
                  conditions.push(gt(column, value));
                  break;
                case "gte":
                  conditions.push(gte(column, value));
                  break;
                case "lt":
                  conditions.push(lt(column, value));
                  break;
                case "lte":
                  conditions.push(lte(column, value));
                  break;
                case "like": {
                  if (typeof value !== "string") return;
                  conditions.push(like(column, value));
                  break;
                }
                case "ilike": {
                  if (typeof value !== "string") return;
                  conditions.push(ilike(column, value));
                  break;
                }
                case "in":
                  if (Array.isArray(value) && value.length > 0) {
                    conditions.push(inArray(column, value));
                  }
                  break;
                case "notIn":
                  if (Array.isArray(value) && value.length > 0) {
                    conditions.push(not(inArray(column, value)));
                  }
                  break;
                case "isNull":
                  if (value === true) {
                    conditions.push(isNull(column));
                  }
                  break;
                case "isNotNull":
                  if (value === true) {
                    conditions.push(isNotNull(column));
                  }
                  break;
              }
            }
          );
        }
      );
    }

    if (conditions.length === 0) return undefined;
    if (conditions.length === 1) return conditions[0];
    return and(...conditions);
  }

  public remove(options?: Parameters<typeof this.find>[0]) {
    const conditions: (SQL | undefined)[] = [
      ...this.getBaseConditions(),
      ...(options?.where ? [this.buildWhereCondition(options.where)] : []),
    ];

    return this.dbClient
      .delete(this.table)
      .where(and(...conditions.filter(Boolean)));
  }
}

type WhereCondition<TR> = {
  and?: (WhereCondition<TR> | undefined)[];
  or?: (WhereCondition<TR> | undefined)[];
  ids?: string[];
  field?: {
    [K in keyof TR]?: {
      eq?: TR[K];
      ne?: TR[K];
      gt?: TR[K];
      gte?: TR[K];
      lt?: TR[K];
      lte?: TR[K];
      like?: string;
      ilike?: string;
      in?: TR[K][];
      notIn?: TR[K][];
      isNull?: boolean;
      isNotNull?: boolean;
    };
  };
};

type FindOptions<TR> = {
  where?: WhereCondition<TR>;
  limit?: number;
  offset?: number;
  orderBy?: Partial<Record<keyof TR, "asc" | "desc">>;
};

type OmitNonUndefined<T, U> = Omit<
  T,
  {
    [K in keyof U]: U[K] extends undefined ? never : K;
  }[keyof U]
>;
