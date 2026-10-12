ALTER TYPE "VendorJoinPaymentStatus" ADD VALUE IF NOT EXISTS 'CREATED';
ALTER TYPE "VendorJoinPaymentStatus" ADD VALUE IF NOT EXISTS 'PAID';
ALTER TYPE "VendorJoinPaymentStatus" ADD VALUE IF NOT EXISTS 'FAILED';

UPDATE "VendorJoinPayment"
SET "status" = 'CREATED'
WHERE "status" = 'SUBMITTED';

UPDATE "VendorJoinPayment"
SET "status" = 'PAID'
WHERE "status" = 'VERIFIED';

UPDATE "VendorJoinPayment"
SET "status" = 'FAILED'
WHERE "status" = 'REJECTED';
