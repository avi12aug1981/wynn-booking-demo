-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "rating" DECIMAL NOT NULL DEFAULT 4.5,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Room" ("amenities", "createdAt", "description", "id", "imageUrl", "isActive", "maxGuests", "name", "petsAllowed", "pricePerNight", "smokingAllowed", "status", "type", "updatedAt") SELECT "amenities", "createdAt", "description", "id", "imageUrl", "isActive", "maxGuests", "name", "petsAllowed", "pricePerNight", "smokingAllowed", "status", "type", "updatedAt" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE INDEX "Room_status_idx" ON "Room"("status");
CREATE INDEX "Room_type_idx" ON "Room"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
