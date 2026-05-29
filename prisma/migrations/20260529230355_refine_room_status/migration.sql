/*
  Warnings:

  - You are about to drop the column `guestName` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `addressLine1` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfNights` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerNight` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT DEFAULT 'USA',
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "referenceNumber" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,
    "memberId" INTEGER,
    "bookingType" TEXT NOT NULL DEFAULT 'GUEST',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "checkInDate" DATETIME NOT NULL,
    "checkOutDate" DATETIME NOT NULL,
    "specialRequests" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "pricePerNight" DECIMAL NOT NULL,
    "numberOfNights" INTEGER NOT NULL,
    "discountAmount" DECIMAL NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentTransactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "confirmationEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "bookingSource" TEXT NOT NULL DEFAULT 'WEB',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("checkInDate", "checkOutDate", "createdAt", "guestCount", "guestEmail", "id", "referenceNumber", "roomId", "specialRequests", "totalPrice") SELECT "checkInDate", "checkOutDate", "createdAt", "guestCount", "guestEmail", "id", "referenceNumber", "roomId", "specialRequests", "totalPrice" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_referenceNumber_key" ON "Booking"("referenceNumber");
CREATE INDEX "Booking_guestEmail_idx" ON "Booking"("guestEmail");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_roomId_checkInDate_checkOutDate_idx" ON "Booking"("roomId", "checkInDate", "checkOutDate");
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePerNight" DECIMAL NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "amenities" TEXT NOT NULL,
    "imageUrl" TEXT,
    "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "smokingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Room" ("amenities", "createdAt", "description", "id", "imageUrl", "isActive", "maxGuests", "name", "pricePerNight", "type", "updatedAt") SELECT "amenities", "createdAt", "description", "id", "imageUrl", "isActive", "maxGuests", "name", "pricePerNight", "type", "updatedAt" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE INDEX "Room_status_idx" ON "Room"("status");
CREATE INDEX "Room_type_idx" ON "Room"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_status_idx" ON "Member"("status");
