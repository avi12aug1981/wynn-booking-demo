/*
  Warnings:

  - You are about to drop the column `guestCount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `guestEmail` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `adultCount` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactEmail` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
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
    "contactEmail" TEXT NOT NULL,
    "adultCount" INTEGER NOT NULL,
    "childCount" INTEGER NOT NULL DEFAULT 0,
    "infantCount" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_Booking" ("addressLine1", "addressLine2", "bookingSource", "bookingType", "checkInDate", "checkOutDate", "city", "confirmationEmailSent", "country", "createdAt", "discountAmount", "firstName", "gender", "id", "lastName", "memberId", "numberOfNights", "paymentStatus", "paymentTransactionId", "pricePerNight", "referenceNumber", "roomId", "specialRequests", "state", "status", "taxAmount", "totalPrice", "updatedAt", "zipCode") SELECT "addressLine1", "addressLine2", "bookingSource", "bookingType", "checkInDate", "checkOutDate", "city", "confirmationEmailSent", "country", "createdAt", "discountAmount", "firstName", "gender", "id", "lastName", "memberId", "numberOfNights", "paymentStatus", "paymentTransactionId", "pricePerNight", "referenceNumber", "roomId", "specialRequests", "state", "status", "taxAmount", "totalPrice", "updatedAt", "zipCode" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_referenceNumber_key" ON "Booking"("referenceNumber");
CREATE INDEX "Booking_contactEmail_idx" ON "Booking"("contactEmail");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_roomId_checkInDate_checkOutDate_idx" ON "Booking"("roomId", "checkInDate", "checkOutDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
