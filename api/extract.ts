import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

// Helper para reintentar la llamada de Gemini con retroceso exponencial y modelos de fallback en Vercel
async function generateContentWithFallback(ai: GoogleGenAI, params: any) {
  const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[Vercel Serverless] Intentando extracción con Gemini, modelo: ${model}...`);
      
      const mergedParams = {
        ...params,
        model: model,
        config: {
          ...(params.config || {}),
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      };

      const response = await ai.models.generateContent(mergedParams);
      console.log(`[Vercel Serverless] Extracción exitosa con el modelo ${model}.`);
      return response;
    } catch (err: any) {
      lastError = err;
      const status = err.status || (err.error && err.error.code);
      console.warn(`[Vercel Serverless] Error con el modelo ${model} (status ${status}): ${err.message || err}`);
    }
  }
  throw lastError || new Error("Todos los modelos de Gemini fallaron o están temporalmente congestionados.");
}

export default async function handler(req: any, res: any) {
  // Configurar encabezados CORS básicos para mayor compatibilidad
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Utilice POST." });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No se proporcionó ninguna imagen para procesar." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "La API Key de Gemini (GEMINI_API_KEY) no está configurada como variable de entorno en Vercel." 
      });
    }

    // Extraer mimeType y base64 puro de la imagen DataURL
    const match = image.match(/^data:([^;]+);base64,(.*)$/);
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }

    // Inicializar el cliente SDK de GoogleGenAI
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await generateContentWithFallback(ai, {
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: "Analiza detenidamente esta imagen de un ticket o factura térmica y extrae su información detallada. Extrae con precisión el RUC del emisor, RUC/CIP del cliente, Dirección, Tipo de Factura, Serie/Consecutivo, Sucursal, Punto de Factura, Receptor, Subtotal, ITBMS, Desglose de ITBMS (Exentos, 7%, 10%, 15%), URL de verificación del QR, Clave de Acceso/CUFE, Vendedor, Cuenta de cliente, Comentarios/Fletes, y desglose de items con precio y tasa ITBMS. Si falta algún valor, calcúlalo de manera que los totales coincidan con la suma de los productos. Devuelve solo un objeto JSON estructurado según el esquema.",
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issuer: {
              type: Type.STRING,
              description: "Nombre del establecimiento comercial o empresa emisora de la factura.",
            },
            issuerRuc: {
              type: Type.STRING,
              description: "RUC del emisor (e.g., 603-203-124985 DV 01) si está presente.",
            },
            issuerAddress: {
              type: Type.STRING,
              description: "Dirección física de la empresa emisora.",
            },
            invoiceType: {
              type: Type.STRING,
              description: "Tipo de factura (e.g., Comprobante Auxiliar de Factura Electrónica, Factura de Operación Interna).",
            },
            date: {
              type: Type.STRING,
              description: "Fecha de expedición o fecha del ticket en formato YYYY-MM-DD.",
            },
            invoiceNumber: {
              type: Type.STRING,
              description: "Número de factura o serie térmica (e.g., 0000064098).",
            },
            serial: {
              type: Type.STRING,
              description: "Serie o consecutivo (e.g., 0010-001).",
            },
            sucursal: {
              type: Type.STRING,
              description: "Código de sucursal (e.g., 0010).",
            },
            ptoFact: {
              type: Type.STRING,
              description: "Punto de facturación o caja (e.g., 001).",
            },
            receiverName: {
              type: Type.STRING,
              description: "Nombre del cliente receptor (e.g., DORA GUERRA).",
            },
            receiverRuc: {
              type: Type.STRING,
              description: "RUC/CIP del receptor si está presente (e.g., 8-306-599 DV).",
            },
            receiverType: {
              type: Type.STRING,
              description: "Tipo de receptor (e.g., Consumidor final).",
            },
            subtotal: {
              type: Type.NUMBER,
              description: "Suma de bases imponibles antes de impuestos.",
            },
            tax: {
              type: Type.NUMBER,
              description: "Monto total del ITBMS o impuestos cobrados.",
            },
            total: {
              type: Type.NUMBER,
              description: "Monto total pagado reflejado en el ticket.",
            },
            paymentMethod: {
              type: Type.STRING,
              description: "Forma de pago empleada (e.g., PAGO CONTRA ENTREGA, Efectivo, Tarjeta).",
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Descripción o nombre del artículo comprado." },
                  quantity: { type: Type.NUMBER, description: "Cantidad de unidades compradas." },
                  price: { type: Type.NUMBER, description: "Precio unitario (e.g., 15.00)." },
                  taxPct: { type: Type.NUMBER, description: "Tasa ITBMS aplicada (e.g., 7, 10, 15, 0)." },
                  total: { type: Type.NUMBER, description: "Total de este artículo." },
                },
                required: ["name"],
              },
              description: "Lista de todos los productos y servicios detallados del ticket.",
            },
            desgloseItbms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  base: { type: Type.NUMBER, description: "Monto base del desglose." },
                  rate: { type: Type.STRING, description: "Tasa asociada (e.g., Exento, 7%, 10%)." },
                  tax: { type: Type.NUMBER, description: "Valor de impuesto resultante." },
                },
              },
              description: "Desglose detallado de ITBMS.",
            },
            qrUrl: {
              type: Type.STRING,
              description: "URL o link de validación electrónica extraído del código QR.",
            },
            accessKey: {
              type: Type.STRING,
              description: "Clave de acceso larga o CUFE.",
            },
            seller: {
              type: Type.STRING,
              description: "Nombre del vendedor que emitió el comprobante.",
            },
            accountNumber: {
              type: Type.STRING,
              description: "Código o cuenta de cliente.",
            },
            comments: {
              type: Type.STRING,
              description: "Dirección de domicilio o comentarios del ticket.",
            },
          },
          required: ["issuer", "date", "invoiceNumber", "total", "tax", "paymentMethod", "items"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      return res.status(500).json({ error: "Gemini no devolvió ninguna estructura." });
    }

    const data = JSON.parse(jsonText.trim());
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("[Vercel Serverless] Error procesando ticket mediante Gemini:", error);
    return res.status(500).json({ 
      error: error.message || "Error interno del servidor al procesar la imagen con Gemini." 
    });
  }
}
