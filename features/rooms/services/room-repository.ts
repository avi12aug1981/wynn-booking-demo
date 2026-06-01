import {
    BulkOperationResult,
    FindManyOptions,
    RepositoryBase,
    RepositoryId,
  } from "@/lib/prisma/base-repository";
  import { prisma } from "@/app/lib/prisma";
  import { BookingStatus, RoomStatus } from "@/app/types/prisma-enums";
  
  type RoomEntity = NonNullable<
    Awaited<ReturnType<typeof prisma.room.findFirst>>
  >;
  
  type RoomCreateInput = Parameters<typeof prisma.room.create>[0]["data"];
  type RoomUpdateInput = Parameters<typeof prisma.room.update>[0]["data"];
  
  type RoomFindManyArgs = NonNullable<Parameters<typeof prisma.room.findMany>[0]>;
  type RoomWhereInput = RoomFindManyArgs["where"];
  type RoomOrderByInput = RoomFindManyArgs["orderBy"];
  
  export type RoomAvailabilityCriteria = {
    checkInDate: Date;
    checkOutDate: Date;
    guestCount: number;
    petsAllowed?: boolean;
    nonSmoking?: boolean;
    minRating?: number;
  };
  
  export class RoomRepository extends RepositoryBase<
    RoomEntity,
    RoomCreateInput,
    RoomUpdateInput,
    RoomWhereInput,
    RoomOrderByInput
  > {
    async findById(id: RepositoryId): Promise<RoomEntity | null> {
      return prisma.room.findUnique({
        where: {
          id: Number(id),
        },
      });
    }
  
    async findMany(
      options?: FindManyOptions<RoomWhereInput, RoomOrderByInput>
    ): Promise<RoomEntity[]> {
      return prisma.room.findMany({
        where: options?.where,
        orderBy: options?.orderBy,
        take: options?.take,
        skip: options?.skip,
      });
    }
  
    async findAvailableRooms(
      criteria: RoomAvailabilityCriteria
    ): Promise<RoomEntity[]> {
      return prisma.room.findMany({
        where: {
          isActive: true,
          status: RoomStatus.AVAILABLE,
          maxGuests: {
            gte: criteria.guestCount,
          },
          petsAllowed: criteria.petsAllowed ? true : undefined,
          smokingAllowed: criteria.nonSmoking ? false : undefined,
          rating: criteria.minRating
            ? {
                gte: criteria.minRating,
              }
            : undefined,
          bookings: {
            none: {
              status: BookingStatus.CONFIRMED,
              checkInDate: {
                lt: criteria.checkOutDate,
              },
              checkOutDate: {
                gt: criteria.checkInDate,
              },
            },
          },
        },
        orderBy: {
          pricePerNight: "asc",
        },
      });
    }
  
    async create(data: RoomCreateInput): Promise<RoomEntity> {
      return prisma.room.create({
        data,
      });
    }
  
    async createMany(data: RoomCreateInput[]): Promise<BulkOperationResult> {
      return prisma.room.createMany({
        data,
      });
    }
  
    async update(id: RepositoryId, data: RoomUpdateInput): Promise<RoomEntity> {
      return prisma.room.update({
        where: {
          id: Number(id),
        },
        data,
      });
    }
  
    async updateMany(
      where: RoomWhereInput,
      data: RoomUpdateInput
    ): Promise<BulkOperationResult> {
      return prisma.room.updateMany({
        where,
        data,
      });
    }
  
    async delete(id: RepositoryId): Promise<RoomEntity> {
      return prisma.room.delete({
        where: {
          id: Number(id),
        },
      });
    }
  
    async deleteMany(where: RoomWhereInput): Promise<BulkOperationResult> {
      return prisma.room.deleteMany({
        where,
      });
    }
  }
  
  export const roomRepository = new RoomRepository();