import { Router, Request, Response } from "express";
import { eq, inArray } from "drizzle-orm";
import { authenticate, AuthRequest } from "../../middlewares/auth";
import { getDb } from "../../lib/db";
import { serviceRequests, settings } from "../../schema";
import { logger } from "../../lib/logger";

const router = Router();

interface PesapalTokenResponse  { token?: string; expiryDate?: string; error?: { message?: string }; message?: string; [key: string]: unknown }
interface PesapalIpnResponse    { ipn_id?: string; [key: string]: unknown }
interface PesapalOrderResponse  { order_tracking_id?: string; redirect_url?: string; error?: { message?: string }; message?: string; [key: string]: unknown }
interface PesapalStatusResponse { payment_status_description?: string; [key: string]: unknown }

let tokenCache: { token: string; expiresAt: number; sandbox: boolean } | null = null;
let ipnCache:   { id: string; sandbox: boolean } | null = null;

async function getPesapalCredentials() {
  const db = getDb();
  const rows = await db.select().from(settings).where(inArray(settings.key, ["pesapal_consumer_key", "pesapal_consumer_secret", "pesapal_sandbox"]));
  const m: Record<string, string> = {};
  for (const r of rows) m[r.key] = r.value;
  if (!m["pesapal_consumer_key"] || !m["pesapal_consumer_secret"]) return null;
  return { consumerKey: m["pesapal_consumer_key"], consumerSecret: m["pesapal_consumer_secret"], sandbox: m["pesapal_sandbox"] === "true" };
}

function pesapalBase(sandbox: boolean) {
  return sandbox ? "https://cybqa.pesapal.com/pesapalv3" : "https://pay.pesapal.com/v3";
}

async function getPesapalToken(consumerKey: string, consumerSecret: string, sandbox: boolean): Promise<string> {
  if (tokenCache && tokenCache.sandbox === sandbox && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const url = `${pesapalBase(sandbox)}/api/Auth/RequestToken`;
  const res  = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
  });
  const data = await res.json() as PesapalTokenResponse;
  if (!res.ok || !data.token) throw new Error(data?.error?.message || data?.message || `Pesapal auth failed: HTTP ${res.status}`);
  const expiresAt = data.expiryDate ? new Date(data.expiryDate).getTime() : Date.now() + 4 * 60_000;
  tokenCache = { token: data.token, expiresAt, sandbox };
  return data.token;
}

async function registerIPN(token: string, ipnUrl: string, sandbox: boolean): Promise<string> {
  if (ipnCache && ipnCache.sandbox === sandbox) return ipnCache.id;
  const res  = await fetch(`${pesapalBase(sandbox)}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
  });
  const data = await res.json() as PesapalIpnResponse;
  const id   = data.ipn_id || "";
  if (id) ipnCache = { id, sandbox };
  return id;
}

router.post("/initiate", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { requestId, phone } = req.body;
    if (!requestId) { res.status(400).json({ message: "requestId is required" }); return; }

    const [serviceReq] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, requestId)).limit(1);
    if (!serviceReq) { res.status(404).json({ message: "Request not found" }); return; }
    if (serviceReq.userId !== req.user!.id) { res.status(403).json({ message: "Not authorized" }); return; }
    if (!serviceReq.paymentRequired || !serviceReq.paymentAmount) { res.status(400).json({ message: "Payment not required for this request" }); return; }
    if (serviceReq.paymentStatus === "paid") { res.status(400).json({ message: "Already paid" }); return; }

    const creds = await getPesapalCredentials();
    if (!creds) { res.status(503).json({ message: "Payment gateway not configured. Contact admin." }); return; }

    const token = await getPesapalToken(creds.consumerKey, creds.consumerSecret, creds.sandbox);
    const host     = req.headers.host || "localhost";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const notificationId = await registerIPN(token, `${protocol}://${host}/api/payment/ipn`, creds.sandbox);

    const user = req.user!;
    const cleanPhone    = (phone || "").replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? `254${cleanPhone.slice(1)}` : (cleanPhone || "254000000000");

    const orderPayload = {
      id: `NTX-${serviceReq.id}-${Date.now()}`,
      currency: serviceReq.paymentCurrency || "KES",
      amount: Number(serviceReq.paymentAmount),
      description: `Payment for ${serviceReq.serviceName}`,
      callback_url: `${protocol}://${host}/dashboard`,
      notification_id: notificationId,
      billing_address: {
        email_address: (user as any).email,
        phone_number: formattedPhone,
        first_name: (user as any).name?.split(" ")[0] || "Client",
        last_name: (user as any).name?.split(" ").slice(1).join(" ") || "",
        country_code: "KE",
      },
    };

    const orderRes  = await fetch(`${pesapalBase(creds.sandbox)}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(orderPayload),
    });
    const orderData = await orderRes.json() as PesapalOrderResponse;
    if (!orderRes.ok || orderData.error) throw new Error(orderData.error?.message || orderData.message || "Failed to initiate payment");

    await db.update(serviceRequests).set({
      paymentStatus: "pending", paymentPhone: formattedPhone,
      pesapalOrderTrackingId: orderData.order_tracking_id, updatedAt: new Date(),
    }).where(eq(serviceRequests.id, requestId));

    res.json({ message: "Open the payment page to complete your M-Pesa payment.", orderTrackingId: orderData.order_tracking_id, redirectUrl: orderData.redirect_url });
  } catch (err: any) {
    logger.error({ err: err.message }, "Payment initiation error");
    res.status(500).json({ message: err.message || "Payment initiation failed" });
  }
});

router.get("/status/:requestId", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const [serviceReq] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, req.params.requestId)).limit(1);
    if (!serviceReq) { res.status(404).json({ message: "Not found" }); return; }
    if (serviceReq.paymentStatus === "paid") { res.json({ paymentStatus: "paid" }); return; }
    if (!serviceReq.pesapalOrderTrackingId) { res.json({ paymentStatus: serviceReq.paymentStatus }); return; }

    const creds = await getPesapalCredentials();
    if (!creds) { res.json({ paymentStatus: serviceReq.paymentStatus }); return; }
    const token     = await getPesapalToken(creds.consumerKey, creds.consumerSecret, creds.sandbox);
    const statusRes = await fetch(`${pesapalBase(creds.sandbox)}/api/Transactions/GetTransactionStatus?orderTrackingId=${serviceReq.pesapalOrderTrackingId}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
    const statusData = await statusRes.json() as PesapalStatusResponse;

    let paymentStatus: "unpaid"|"pending"|"paid"|"failed" = serviceReq.paymentStatus;
    if (statusData.payment_status_description === "Completed") paymentStatus = "paid";
    else if (statusData.payment_status_description === "Failed")  paymentStatus = "failed";

    if (paymentStatus !== serviceReq.paymentStatus) {
      await db.update(serviceRequests).set({ paymentStatus, updatedAt: new Date() }).where(eq(serviceRequests.id, req.params.requestId));
    }
    res.json({ paymentStatus });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to check status" });
  }
});

router.get("/ipn", async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const { orderTrackingId, orderMerchantReference } = req.query as Record<string, string>;
    if (orderTrackingId) {
      const [serviceReq] = await db.select().from(serviceRequests).where(eq(serviceRequests.pesapalOrderTrackingId, orderTrackingId)).limit(1);
      if (serviceReq && serviceReq.paymentStatus !== "paid") {
        await db.update(serviceRequests).set({ paymentStatus: "paid", updatedAt: new Date() }).where(eq(serviceRequests.id, serviceReq.id));
      }
    }
    res.json({ orderNotificationType: "IPNCHANGE", orderTrackingId, orderMerchantReference, status: "200" });
  } catch { res.status(500).json({ message: "IPN error" }); }
});

export default router;
