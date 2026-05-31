import { prisma } from "@/app/lib/prisma";

export type PrismaTransactionClient = Parameters<
  Parameters<(typeof prisma)["$transaction"]>[0]
>[0];
