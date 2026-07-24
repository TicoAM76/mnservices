const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });

const cleanText = (value, maxLength) =>
    String(value ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, maxLength);

const escapeTelegram = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const contentType = request.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            return jsonResponse(
                { ok: false, message: "Formato de solicitud no válido." },
                415
            );
        }

        const body = await request.json();

        // Campo trampa antispam. Debe permanecer vacío.
        if (cleanText(body.website, 200)) {
            return jsonResponse({ ok: true });
        }

        const nombre = cleanText(body.nombre, 100);
        const empresa = cleanText(body.empresa, 120);
        const email = cleanText(body.email, 160);
        const telefono = cleanText(body.telefono, 50);
        const servicio = cleanText(body.servicio, 100);
        const mensaje = cleanText(body.mensaje, 2000);
        const origen = cleanText(body.origen, 300);

        if (!nombre || !email || !mensaje) {
            return jsonResponse(
                {
                    ok: false,
                    message: "Completa nombre, correo electrónico y mensaje.",
                },
                400
            );
        }

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!emailValido) {
            return jsonResponse(
                { ok: false, message: "El correo electrónico no es válido." },
                400
            );
        }

        if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
            console.error("Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID.");

            return jsonResponse(
                {
                    ok: false,
                    message:
                        "El formulario todavía no está configurado. Contacta mediante correo o WhatsApp.",
                },
                503
            );
        }

        const ip = request.headers.get("CF-Connecting-IP") || "No disponible";
        const fecha = new Date().toISOString();

        const telegramMessage = [
            "<b>Nuevo contacto desde MNSERVICIOS</b>",
            "",
            `<b>Nombre:</b> ${escapeTelegram(nombre)}`,
            `<b>Empresa:</b> ${escapeTelegram(empresa || "No indicada")}`,
            `<b>Email:</b> ${escapeTelegram(email)}`,
            `<b>Teléfono:</b> ${escapeTelegram(telefono || "No indicado")}`,
            `<b>Servicio:</b> ${escapeTelegram(servicio || "No indicado")}`,
            "",
            "<b>Mensaje:</b>",
            escapeTelegram(mensaje),
            "",
            `<b>Origen:</b> ${escapeTelegram(origen || "Directo")}`,
            `<b>IP:</b> ${escapeTelegram(ip)}`,
            `<b>Fecha:</b> ${escapeTelegram(fecha)}`,
        ].join("\n");

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: env.TELEGRAM_CHAT_ID,
                    text: telegramMessage,
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                }),
            }
        );

        if (!telegramResponse.ok) {
            const errorText = await telegramResponse.text();
            console.error("Error de Telegram:", errorText);

            return jsonResponse(
                {
                    ok: false,
                    message:
                        "No pudimos enviar tu solicitud. Inténtalo nuevamente o utiliza WhatsApp.",
                },
                502
            );
        }

        return jsonResponse({
            ok: true,
            message:
                "Hemos recibido tu solicitud. Te responderemos lo antes posible.",
        });
    } catch (error) {
        console.error("Error procesando contacto:", error);

        return jsonResponse(
            {
                ok: false,
                message:
                    "Se produjo un error inesperado. Inténtalo nuevamente más tarde.",
            },
            500
        );
    }
}

export function onRequestGet() {
    return jsonResponse(
        {
            ok: true,
            service: "MNSERVICIOS contact API",
        },
        200
    );
}