export type RepositoryId = number | string;

export type FindManyOptions<TWhere = unknown, TOrderBy = unknown> = {
  where?: TWhere;
  orderBy?: TOrderBy;
  take?: number;
  skip?: number;
};

export type BulkOperationResult = {
  count: number;
};

export interface IReadRepository<TEntity, TWhere = unknown, TOrderBy = unknown> {
  findById(id: RepositoryId): Promise<TEntity | null>;

  findMany(
    options?: FindManyOptions<TWhere, TOrderBy>
  ): Promise<TEntity[]>;
}

export interface ICreateRepository<TEntity, TCreateInput> {
  create(data: TCreateInput): Promise<TEntity>;

  createMany(data: TCreateInput[]): Promise<BulkOperationResult>;
}

export interface IUpdateRepository<TEntity, TUpdateInput> {
  update(id: RepositoryId, data: TUpdateInput): Promise<TEntity>;

  updateMany(
    where: unknown,
    data: TUpdateInput
  ): Promise<BulkOperationResult>;
}

export interface IDeleteRepository<TEntity> {
  delete(id: RepositoryId): Promise<TEntity>;

  deleteMany(where: unknown): Promise<BulkOperationResult>;
}

export interface IRepository<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TWhere = unknown,
  TOrderBy = unknown
>
  extends IReadRepository<TEntity, TWhere, TOrderBy>,
    ICreateRepository<TEntity, TCreateInput>,
    IUpdateRepository<TEntity, TUpdateInput>,
    IDeleteRepository<TEntity> {}

/**
 * Shared repository contract for data-access implementations.
 *
 * Business services should depend on repository interfaces rather than
 * directly depending on Prisma or a specific database provider.
 */
export abstract class RepositoryBase<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TWhere = unknown,
  TOrderBy = unknown
> implements IRepository<TEntity, TCreateInput, TUpdateInput, TWhere, TOrderBy>
{
  abstract findById(id: RepositoryId): Promise<TEntity | null>;

  abstract findMany(
    options?: FindManyOptions<TWhere, TOrderBy>
  ): Promise<TEntity[]>;

  abstract create(data: TCreateInput): Promise<TEntity>;

  abstract createMany(data: TCreateInput[]): Promise<BulkOperationResult>;

  abstract update(id: RepositoryId, data: TUpdateInput): Promise<TEntity>;

  abstract updateMany(
    where: unknown,
    data: TUpdateInput
  ): Promise<BulkOperationResult>;

  abstract delete(id: RepositoryId): Promise<TEntity>;

  abstract deleteMany(where: unknown): Promise<BulkOperationResult>;
}