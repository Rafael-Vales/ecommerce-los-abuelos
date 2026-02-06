import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  const accessToken =
    process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Falta MERCADOPAGO_ACCESS_TOKEN" },
      { status: 500 }
    );
  }

  const mpClient = new MercadoPagoConfig({ accessToken });
  const preferenceClient = new Preference(mpClient);

  try {
    const body = await req.json();

    if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Body inválido: items debe ser un array con al menos 1 item" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000";

    const preferenceBody = {
      items: body.items.map((item: any) => ({
        title: String(item.title),
        unit_price: Number(item.price),
        quantity: Number(item.quantity),
        currency_id: "ARS",
      })),

      payer: {
        email: String(body?.payer?.email ?? "test_user@test.com"),
      },

      back_urls: {
        success: `${baseUrl}/pago/success`,
        failure: `${baseUrl}/pago/failure`,
        pending: `${baseUrl}/pago/pending`,
      },
    };

    const result = await preferenceClient.create({ body: preferenceBody });

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: (result as any).sandbox_init_point,
    });
  } catch (error: any) {
    console.error("MercadoPago error:", error);

    // Si MP devuelve detalle, lo devolvemos para debug en Thunder
    const mpMessage =
      error?.message ||
      error?.cause?.[0]?.description ||
      error?.response?.data ||
      null;

    return NextResponse.json(
      { error: "Error creando preferencia", detail: mpMessage },
      { status: 500 }
    );
  }
}
