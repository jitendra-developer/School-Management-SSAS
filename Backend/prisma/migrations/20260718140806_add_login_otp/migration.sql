-- CreateTable
CREATE TABLE "login_otps" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_otps_admin_id_idx" ON "login_otps"("admin_id");

-- AddForeignKey
ALTER TABLE "login_otps" ADD CONSTRAINT "login_otps_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
