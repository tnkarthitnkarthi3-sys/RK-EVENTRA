UPDATE "VendorJoinPayment"
SET "status" = 'CREATED'
WHERE "status" = 'SUBMITTED';

UPDATE "VendorJoinPayment"
SET "status" = 'PAID'
WHERE "status" = 'VERIFIED';

UPDATE "VendorJoinPayment"
SET "status" = 'FAILED'
WHERE "status" = 'REJECTED';
