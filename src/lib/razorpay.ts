import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export const isRazorpayConfigured = (): boolean => {
  return Boolean(
    keyId &&
    keySecret &&
    !keyId.includes("YOUR_") &&
    !keySecret.includes("YOUR_") &&
    keyId.trim() !== "" &&
    keySecret.trim() !== ""
  );
};

export const getRazorpayClient = (): Razorpay | null => {
  if (!isRazorpayConfigured()) {
    return null;
  }
  return new Razorpay({
    key_id: keyId as string,
    key_secret: keySecret as string,
  });
};

export const razorpay = isRazorpayConfigured()
  ? new Razorpay({
      key_id: keyId as string,
      key_secret: keySecret as string,
    })
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(
            "Payment gateway setup is incomplete. Please configure the server credentials before accepting payments."
          );
        },
      }
    ) as unknown as Razorpay);

