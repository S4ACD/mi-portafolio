#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-offers.py — Genera las páginas de ofertas productizadas y ciudades:
  /servicios/web-express/  /servicios/auditoria-seo-geo/  /servicios/plan-mensual/
  /diseno-web-miami/  /diseno-web-houston/  /diseno-web-los-angeles/
Un solo origen de verdad: el copy ES/EN vive aquí, se escribe en el HTML (ES)
y se fusiona en lang/es.json + lang/en.json. Idempotente: puedes re-ejecutarlo.
Uso: python3 build-offers.py
"""
import json, io, os, shutil

SITE = 'https://alexandercaro.com'
CAL  = 'https://calendly.com/hosoyalexander/30min'
OG_IMG = 'https://res.cloudinary.com/dg2wnq6ao/image/upload/q_auto,f_auto,w_1200/v1781035692/P%C3%A1gina_de_inicio_hucq78.png'
# Hojas compartidas por TODAS las landings. Son la fuente de verdad y se
# editan a mano: este script ya no las copia ni las regenera.
SHARED_CSS = '/css/landing.css'
SHARED_JS  = '/js/landing.js'

PERSON = {
  "@type": "Person", "name": "Alexander Caro", "url": SITE,
  "image": "https://res.cloudinary.com/dg2wnq6ao/image/upload/q_auto,f_auto,w_400/v1781396255/Escultura_de_Alexander_ykbpww.png",
  "jobTitle": "Diseñador Web y Desarrollador Frontend Freelance",
  "email": "hosoyalexander@gmail.com", "telephone": "+573024457653",
  "sameAs": ["https://www.behance.net/alexandercaro",
             "https://www.linkedin.com/in/sneider-alexander-de-la-cuadra-caro/",
             "https://www.instagram.com/alexander_caro7/",
             "https://github.com/S4ACD"]
}

ICONS = {
 'pen':    "<path d='M12 19l7-7 3 3-7 7-3-3z'/><path d='M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z'/><path d='M2 2l7.586 7.586'/><circle cx='11' cy='11' r='2'/>",
 'layout': "<rect x='3' y='3' width='18' height='18' rx='2'/><path d='M3 9h18M9 21V9'/>",
 'search': "<circle cx='11' cy='11' r='8'/><path d='M21 21l-4.35-4.35'/>",
 'zap':    "<polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/>",
 'shield': "<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/>",
 'map':    "<polygon points='1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6'/><path d='M8 2v16M16 6v16'/>",
 'play':   "<circle cx='12' cy='12' r='10'/><polygon points='10 8 16 12 10 16 10 8'/>",
 'chat':   "<path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/>",
 'clock':  "<circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>",
 'file':   "<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/>",
}

KEYS = {}
def K(key, es, en):
    if key in KEYS and KEYS[key] != (es, en):
        raise SystemExit(f'✗ Llave duplicada con valor distinto: {key}')
    KEYS[key] = (es, en)
    return es

# ── Llaves compartidas ────────────────────────────────────────────
K('ofr.eyebrow', 'PAQUETE · PRECIO CERRADO', 'PACKAGE · FIXED PRICE')
K('ofr.calendly', 'Agenda una llamada de 30 min', 'Book a 30-minute call')
K('ofr.faq', 'PREGUNTAS FRECUENTES', 'FREQUENTLY ASKED QUESTIONS')
K('ofr.faqTitle', 'Las dudas que todos me preguntan', 'The questions everyone asks')
K('ofr.crossLabel', 'También te puede servir:', 'You might also need:')
K('label.noIncluye', 'Qué no incluye — para que no haya sorpresas', "What's not included — so there are no surprises")

K('pk.eyebrow', 'PAQUETES CON PRECIO CERRADO', 'FIXED-PRICE PACKAGES')
K('pk.title', 'Tres formas de trabajar conmigo', 'Three ways to work with me')
K('pk.sub', 'Alcance claro, precio fijo y fecha definida antes de empezar. Sin cotizaciones eternas ni sorpresas a mitad de camino.',
            'Clear scope, a fixed price and a set date before we start. No endless quotes, no mid-project surprises.')
K('pk.badge', 'MÁS PEDIDO', 'MOST POPULAR')
K('pk.cta', 'Ver detalles', 'See details')
K('pk.usa', 'Atiendo negocios hispanos en EE. UU.: <a href="/diseno-web-miami/">Miami</a> · <a href="/diseno-web-houston/">Houston</a> · <a href="/diseno-web-los-angeles/">Los Ángeles</a>',
            'I work with Hispanic-owned businesses in the US: <a href="/diseno-web-miami/">Miami</a> · <a href="/diseno-web-houston/">Houston</a> · <a href="/diseno-web-los-angeles/">Los Angeles</a>')

K('pk.1.name', 'Web Express', 'Web Express')
K('pk.1.price', 'USD 800', '$800 USD')
K('pk.1.tag', 'Tu sitio profesional de hasta 5 páginas, entregado en 14 días.', 'Your professional website — up to 5 pages, delivered in 14 days.')
K('pk.1.li1', 'Diseño 100% a medida, sin plantillas', '100% custom design, no templates')
K('pk.1.li2', 'SEO técnico completo incluido', 'Full technical SEO included')
K('pk.1.li3', 'Optimizado para PageSpeed 90+', 'Optimized for 90+ PageSpeed')
K('pk.1.li4', '30 días de soporte post-lanzamiento', '30 days of post-launch support')

K('pk.2.name', 'Auditoría SEO + GEO', 'SEO + GEO Audit')
K('pk.2.price', 'USD 400', '$400 USD')
K('pk.2.tag', 'Descubre por qué no apareces — en Google y en las respuestas de IA.', "Find out why you don't show up — on Google and in AI answers.")
K('pk.2.li1', 'Auditoría técnica y de contenido', 'Technical and content audit')
K('pk.2.li2', 'Chequeo en ChatGPT y AI Overviews', 'ChatGPT and AI Overviews check')
K('pk.2.li3', 'Plan de acción priorizado a 90 días', 'Prioritized 90-day action plan')
K('pk.2.li4', 'Video-resumen + llamada de 45 min', 'Video summary + 45-min call')

K('pk.3.name', 'Plan mensual', 'Monthly plan')
K('pk.3.price', 'USD 600', '$600 USD')
K('pk.3.period', '/mes', '/month')
K('pk.3.tag', 'Diseño y mejoras web continuas para tu negocio, sin permanencia.', 'Ongoing design and web improvements, with no lock-in.')
K('pk.3.li1', 'Piezas para redes y campañas', 'Social media and campaign assets')
K('pk.3.li2', 'Mejoras y mantenimiento de tu sitio', 'Website improvements and maintenance')
K('pk.3.li3', 'Respuesta en menos de 24 h hábiles', 'Replies within 24 business hours')
K('pk.3.li4', 'Pausa o cancela cuando quieras', 'Pause or cancel anytime')

K('cty.eyebrow', 'DISEÑO WEB EN ESPAÑOL · EE. UU.', 'WEB DESIGN IN SPANISH · USA')
K('cty.t2', 'PageSpeed de mis dos últimos proyectos, medido en producción', 'PageSpeed of my last two projects, measured in production')
K('cty.t3', 'Precios cerrados en dólares, con invoice para tu contabilidad', 'Fixed prices in USD, with an invoice for your bookkeeping')
K('cty.pkSub', 'Los mismos paquetes, estés en la ciudad que estés — todo remoto, todo en tu idioma.', 'The same packages wherever you are — fully remote, fully in your language.')
K('cty.sectEyebrow', 'SECTORES', 'INDUSTRIES')

# ══════════════════════════════════════════════════════════════════
# OFERTAS
# ══════════════════════════════════════════════════════════════════
OFFERS = [
 dict(
  slug='servicios/web-express', url='/servicios/web-express/', p='wx', featured=True,
  crumb=('Web Express', 'Web Express'),
  meta_es=('Web Express — Sitio Web Profesional en 14 Días por USD 800 | Alexander Caro',
           'Sitio web profesional de hasta 5 páginas, entregado en 14 días. Precio cerrado: USD 800. Diseño a medida, código limpio, SEO técnico y PageSpeed 90+. LATAM, EE. UU. y Europa.'),
  meta_en=('Web Express — Professional Website in 14 Days for $800 | Alexander Caro',
           'A professional website of up to 5 pages, delivered in 14 days. Fixed price: $800 USD. Custom design, clean code, technical SEO and 90+ PageSpeed. US, LATAM and Europe.'),
  keywords='sitio web precio fijo, página web en 14 días, diseño web usd 800, página web para pymes, diseño web precio cerrado, página web profesional en español',
  schema_es=('Web Express — Sitio web profesional en 14 días',
             'Paquete de diseño y desarrollo web con precio cerrado: sitio de hasta 5 páginas, a medida y en código limpio, con SEO técnico y optimización de velocidad. Entrega en 14 días desde la recepción del contenido. USD 800.'),
  schema_en=('Web Express — Professional website in 14 days',
             'Fixed-price web design and development package: an up-to-5-page custom site in clean code, with technical SEO and speed optimization. Delivered 14 days after content is received. $800 USD.'),
  offer={'price': '800', 'unit': None},
  wa_es='¡Hola Alexander! Me interesa el paquete Web Express (USD 800). Quiero contarte de mi negocio.',
  wa_en="Hi Alexander! I'm interested in the Web Express package ($800). I'd like to tell you about my business.",
  hero_title=('Tu sitio web, listo en <span class="srv-hero__accent">14 días</span>',
              'Your website, live in <span class="srv-hero__accent">14 days</span>'),
  hero_sub=('Un sitio profesional de hasta 5 páginas, diseñado y programado a medida por una sola persona. Alcance claro, fecha definida y todo lo técnico incluido — por un precio cerrado.',
            'A professional site of up to 5 pages, designed and coded from scratch by one person. Clear scope, a set date and all the technical work included — for one fixed price.'),
  price=('USD 800', '$800 USD'), price_note=('Precio cerrado · pago 50/50', 'Fixed price · 50/50 payment'),
  proof=[('97 · 99', None, ('PageSpeed en mis dos últimos proyectos web', 'PageSpeed on my last two web projects')),
         (None, ('14 días', '14 days'), ('De contenido recibido a sitio publicado', 'From content received to site live')),
         ('50/50', None, ('Pagas la mitad al inicio, la mitad contra entrega', 'Half upfront, half on delivery'))],
  que_title=('Todo lo que tu negocio necesita para verse serio en internet', 'Everything your business needs to look serious online'),
  que=[('Web Express es mi paquete de entrada: un sitio completo — inicio, servicios, sobre ti, contacto y una página extra a tu elección — construido en código limpio, sin plantillas ni constructores lentos.',
        'Web Express is my entry package: a complete site — home, services, about, contact and one extra page of your choice — built in clean code, with no templates and no slow page builders.'),
       ('El precio es cerrado: USD 800. El alcance queda definido por escrito antes de empezar, así que no hay cobros ocultos ni "extras" a mitad de camino. Pagas 50% para reservar tu fecha y 50% contra entrega.',
        'The price is fixed: $800 USD. The scope is defined in writing before we start, so there are no hidden charges or mid-project "extras". You pay 50% to book your date and 50% on delivery.'),
       ('La fecha también es clara: 14 días desde que recibo tu contenido (textos, fotos y logo). ¿No lo tienes listo? Te entrego una guía simple para prepararlo antes de arrancar.',
        "The date is just as clear: 14 days from the moment I receive your content (copy, photos and logo). Don't have it ready? I'll give you a simple guide to prepare it before we start.")],
  inc=[('pen','Diseño 100% a medida','Nada de plantillas: tu sitio se diseña desde cero según tu marca y tus objetivos.',
        '100% custom design','No templates: your site is designed from scratch around your brand and your goals.'),
       ('layout','Hasta 5 páginas + móvil impecable','Inicio, servicios, sobre ti, contacto y una extra. Perfecto en celular, tablet y desktop.',
        'Up to 5 pages + flawless mobile','Home, services, about, contact and one extra. Perfect on phone, tablet and desktop.'),
       ('search','SEO técnico completo','Estructura semántica, metadatos, schema JSON-LD y sitemap: la base para que Google te entienda.',
        'Full technical SEO','Semantic structure, metadata, JSON-LD schema and sitemap: the foundation Google needs to understand you.'),
       ('zap','Velocidad como estándar','Optimizado para superar 90 en PageSpeed. Mis dos últimos proyectos: 97 y 99, medidos en producción.',
        'Speed as the standard','Optimized to score above 90 on PageSpeed. My last two projects: 97 and 99, measured in production.'),
       ('shield','Lanzamiento + 30 días de soporte','Dominio conectado, sitio publicado, accesos entregados y un mes de ajustes incluido.',
        'Launch + 30 days of support','Domain connected, site published, credentials handed over and a month of tweaks included.')],
  no=[('Tienda online completa — el e-commerce se cotiza como proyecto aparte.', 'A full online store — e-commerce is quoted as a separate project.'),
      ('Redacción de todos tus textos desde cero: te guío y los pulo, pero nadie conoce tu negocio como tú.', 'Writing all your copy from scratch: I guide and polish it, but nobody knows your business like you do.'),
      ('Mantenimiento mensual — para eso existe el <a href="/servicios/plan-mensual/">Plan mensual</a>.', 'Monthly maintenance — that is what the <a href="/servicios/plan-mensual/">Monthly plan</a> is for.')],
  pro=[('01 — Escríbeme','Me cuentas tu negocio por WhatsApp o en una llamada de 30 minutos. En menos de 24 horas te confirmo alcance, precio y fecha.',
        '01 — Reach out','Tell me about your business on WhatsApp or in a 30-minute call. Within 24 hours I confirm scope, price and date.'),
       ('02 — Preparamos el contenido','Te entrego una guía para reunir textos, fotos y logo. Cuando esté completo, tu fecha de entrega queda fijada.',
        '02 — We prepare the content','I give you a guide to gather copy, photos and logo. Once it is complete, your delivery date is locked in.'),
       ('03 — Entrego en 14 días','Diseño, programo, optimizo y publico. Recibes tu sitio funcionando, los accesos y 30 días de soporte.',
        '03 — I deliver in 14 days','I design, code, optimize and publish. You get your site live, the credentials and 30 days of support.')],
  pq_title=('Para quién es Web Express', 'Who Web Express is for'),
  pq=[('Negocios que solo tienen redes','Tu Instagram vende, pero sin sitio propio pierdes a los clientes que buscan en Google — y credibilidad frente a los grandes.',
       'Businesses running on social only','Your Instagram sells, but without your own site you lose the clients who search on Google — and credibility against bigger players.'),
      ('Sitios viejos o lentos','Tu página actual se ve desactualizada, carga lento o se rompe en celular. La reconstruimos desde cero.',
       'Old or slow websites','Your current site looks dated, loads slowly or breaks on mobile. We rebuild it from scratch.'),
      ('Profesionales independientes','Consultores, médicos, abogados, creativos: una presencia seria que respalde tu nombre.',
       'Independent professionals','Consultants, doctors, lawyers, creatives: a serious presence that backs up your name.')],
  faq=[('¿Y si necesito más de 5 páginas?','Se puede: cada página adicional se cotiza antes de empezar (normalmente entre USD 80 y 120 según su complejidad). Nunca aparecen cobros a mitad de proyecto.',
        'What if I need more than 5 pages?','No problem: each additional page is quoted before we start (usually between $80 and $120 depending on complexity). Charges never appear mid-project.'),
       ('¿Desde cuándo corren los 14 días?','Desde que recibo tu contenido completo: textos, fotos y logo. Si aún no lo tienes, te doy una guía para prepararlo y fijamos la fecha cuando esté listo — así la promesa es real, no letra pequeña.',
        'When does the 14-day clock start?','From the moment I receive your complete content: copy, photos and logo. If you do not have it yet, I give you a guide to prepare it and we set the date once it is ready — so the promise is real, not fine print.'),
       ('¿Cómo pago desde EE. UU., Europa o LATAM?','En dólares por transferencia internacional, Wise o PayPal (en Colombia también por transferencia local). 50% para reservar tu fecha y 50% cuando el sitio ya está publicado y funcionando.',
        'How do I pay from the US, Europe or LATAM?','In USD via international transfer, Wise or PayPal (local transfer inside Colombia). 50% to book your date and 50% once the site is published and working.'),
       ('¿El sitio queda a mi nombre?','Sí, todo: dominio, hosting y código quedan en tus cuentas y bajo tu propiedad. Te entrego los accesos y una guía corta para cambios básicos, para que no dependas de mí.',
        'Do I own the site?','Yes, all of it: domain, hosting and code stay in your accounts and under your ownership. I hand over the credentials and a short guide for basic edits, so you never depend on me.'),
       ('¿Incluye aparecer en Google?','Incluye toda la base técnica: estructura, metadatos, schema, sitemap y velocidad. El posicionamiento sostenido es otro trabajo — la <a href="/servicios/auditoria-seo-geo/">Auditoría SEO + GEO</a> te dice qué hacer, y el <a href="/servicios/plan-mensual/">Plan mensual</a> lo ejecuta.',
        'Does it include ranking on Google?','It includes the full technical foundation: structure, metadata, schema, sitemap and speed. Sustained ranking is a different job — the <a href="/servicios/auditoria-seo-geo/">SEO + GEO Audit</a> tells you what to do, and the <a href="/servicios/plan-mensual/">Monthly plan</a> executes it.')],
  cross=['/servicios/auditoria-seo-geo/','/servicios/plan-mensual/'], cross_keys=['pk.2.name','pk.3.name'],
  cta=('¿Listo para tener tu sitio en dos semanas?','Agenda una llamada de 30 minutos o escríbeme por WhatsApp. Te respondo en menos de 24 horas con alcance, fecha y precio confirmados.',
       'Ready to have your site in two weeks?','Book a 30-minute call or message me on WhatsApp. I reply within 24 hours with scope, date and price confirmed.'),
 ),
 dict(
  slug='servicios/auditoria-seo-geo', url='/servicios/auditoria-seo-geo/', p='ag', featured=False,
  crumb=('Auditoría SEO + GEO', 'SEO + GEO Audit'),
  meta_es=('Auditoría SEO + GEO — Tu Visibilidad en Google y en la IA, USD 400 | Alexander Caro',
           'Auditoría de SEO técnico, contenido y GEO: descubre si ChatGPT y las respuestas de IA de Google citan tu negocio. Informe + plan de 90 días + llamada. USD 400, en 10 días hábiles.'),
  meta_en=('SEO + GEO Audit — Your Visibility on Google and in AI, $400 | Alexander Caro',
           'Technical SEO, content and GEO audit: find out whether ChatGPT and Google AI answers cite your business. Report + 90-day plan + call. $400 USD, in 10 business days.'),
  keywords='auditoría seo, auditoría geo, generative engine optimization en español, aparecer en chatgpt, ai overviews seo, visibilidad ia para negocios, consultor seo en español',
  schema_es=('Auditoría SEO + GEO — visibilidad en Google y en motores de IA',
             'Auditoría manual de SEO técnico, contenido y GEO (Generative Engine Optimization): diagnóstico de visibilidad en Google, ChatGPT, Gemini y AI Overviews, con plan de acción priorizado a 90 días, video-resumen y llamada de 45 minutos. USD 400, entrega en 10 días hábiles.'),
  schema_en=('SEO + GEO Audit — visibility on Google and AI engines',
             'Manual audit of technical SEO, content and GEO (Generative Engine Optimization): visibility diagnosis across Google, ChatGPT, Gemini and AI Overviews, with a prioritized 90-day action plan, video summary and a 45-minute call. $400 USD, delivered in 10 business days.'),
  offer={'price': '400', 'unit': None},
  wa_es='¡Hola Alexander! Quiero la Auditoría SEO + GEO (USD 400). Mi sitio es: ',
  wa_en="Hi Alexander! I want the SEO + GEO Audit ($400). My website is: ",
  hero_title=('Descubre por qué <span class="srv-hero__accent">no apareces</span>',
              "Find out why <span class=\"srv-hero__accent\">you don't show up</span>"),
  hero_sub=('Auditoría completa de tu visibilidad: SEO técnico, contenido y GEO — es decir, si ChatGPT, Gemini y las respuestas de IA de Google citan tu negocio… o citan a tu competencia. Informe accionable + plan de 90 días.',
            'A complete visibility audit: technical SEO, content and GEO — meaning whether ChatGPT, Gemini and Google AI answers cite your business… or your competitors. Actionable report + 90-day plan.'),
  price=('USD 400', '$400 USD'), price_note=('Entrega en 10 días hábiles', 'Delivered in 10 business days'),
  proof=[('−58%', None, ('Clics orgánicos en posición 1 cuando aparece una respuesta de IA (Ahrefs, dic. 2025)', 'Organic clicks for position 1 when an AI answer appears (Ahrefs, Dec. 2025)')),
         ('+35%', None, ('Más clics para las marcas citadas dentro de las respuestas de IA (estudios 2025–2026)', 'More clicks for brands cited inside AI answers (2025–2026 studies)')),
         ('45 min', None, ('De llamada incluida para revisar el plan contigo', 'Of included call time to walk through the plan with you'))],
  que_title=('El buscador cambió — tu estrategia también debería', 'Search changed — your strategy should too'),
  que=[('Cada vez más búsquedas terminan en una respuesta generada por IA, sin un solo clic. Los estudios más recientes muestran caídas de más del 50% en los clics orgánicos cuando aparece una AI Overview — pero las marcas citadas dentro de esas respuestas ganan alrededor de un 35% más de clics.',
        'More and more searches end in an AI-generated answer, without a single click. The latest studies show organic clicks dropping by more than 50% when an AI Overview appears — while brands cited inside those answers gain around 35% more clicks.'),
       ('GEO (Generative Engine Optimization) es el trabajo de lograr que esas IAs te entiendan, confíen en ti y te citen. Esta auditoría te dice exactamente dónde estás parado: qué te frena en el Google clásico y qué te falta para existir en las respuestas de IA.',
        'GEO (Generative Engine Optimization) is the work of getting those AIs to understand you, trust you and cite you. This audit tells you exactly where you stand: what is holding you back in classic Google and what you are missing to exist in AI answers.'),
       ('No es el PDF automático de una herramienta. Reviso tu sitio a mano, cruzo datos reales de Search Console y te entrego un plan priorizado que puede ejecutar tu equipo — o yo.',
        'This is not an automated tool PDF. I review your site by hand, cross-check real Search Console data and hand you a prioritized plan your team can execute — or I can.')],
  inc=[('zap','Auditoría técnica completa','Velocidad, indexación, Core Web Vitals, schema y arquitectura: lo que Google evalúa antes que tu contenido.',
        'Full technical audit','Speed, indexing, Core Web Vitals, schema and architecture: what Google evaluates before your content.'),
       ('search','Contenido y palabras clave','Qué buscan tus clientes, qué posiciona tu competencia y qué contenido te falta para competir.',
        'Content and keywords','What your clients search for, what your competitors rank for, and what content you are missing.'),
       ('chat','Chequeo GEO real','Pruebas en ChatGPT, Gemini y AI Overviews: si apareces, cómo te describen y a quién citan en tu lugar.',
        'Real GEO check','Tests on ChatGPT, Gemini and AI Overviews: whether you appear, how they describe you, and who they cite instead.'),
       ('map','Plan de 90 días priorizado','No una lista infinita: qué hacer primero, qué impacto esperar y qué puede esperar para después.',
        'Prioritized 90-day plan','Not an endless list: what to do first, what impact to expect, and what can wait.'),
       ('play','Video + llamada de 45 min','Un resumen en video para tu equipo y una llamada para resolver dudas y definir los siguientes pasos.',
        'Video + 45-min call','A video summary for your team and a call to answer questions and define next steps.')],
  no=[('La implementación de los cambios — esa se cotiza aparte, con el plan en la mano.', 'Implementing the changes — that is quoted separately, with the plan in hand.'),
      ('Promesas de "posición #1": nadie serio puede garantizar eso, y quien lo hace te está mintiendo.', 'Promises of "#1 rankings": no serious professional can guarantee that, and whoever does is lying to you.'),
      ('Campañas de anuncios pagos — Google y Meta Ads no son parte de esta auditoría.', 'Paid ad campaigns — Google and Meta Ads are not part of this audit.')],
  pro=[('01 — Acceso en 5 minutos','Me das acceso de solo lectura a Google Search Console y Analytics (te guío paso a paso) y la URL de tu sitio.',
        '01 — Access in 5 minutes','You give me read-only access to Google Search Console and Analytics (I guide you step by step) plus your site URL.'),
       ('02 — Análisis a mano','Durante 10 días hábiles audito técnica, contenido y visibilidad en IA con datos reales — no un reporte automático.',
        '02 — Manual analysis','Over 10 business days I audit the technical side, the content and your AI visibility with real data — not an automated report.'),
       ('03 — Informe + llamada','Recibes el informe, el plan de 90 días y un video-resumen. Cerramos con una llamada de 45 minutos.',
        '03 — Report + call','You receive the report, the 90-day plan and a video summary. We close with a 45-minute call.')],
  pq_title=('Para quién es esta auditoría', 'Who this audit is for'),
  pq=[('Tienes sitio, no tienes clientes','Tu página existe hace años pero Google no te manda casi nada. Necesitas saber por qué antes de invertir más.',
       'You have a site, not clients','Your page has existed for years but Google barely sends you anything. You need to know why before investing more.'),
      ('Perdiste tráfico este año','Tus visitas orgánicas cayeron desde 2025. Probablemente las respuestas de IA tienen que ver — hay que medirlo.',
       'You lost traffic this year','Your organic visits have dropped since 2025. AI answers are probably involved — it needs to be measured.'),
      ('Quieres adelantarte','Tu competencia aún no piensa en GEO. Ser el primero de tu sector citado por la IA es una ventaja real.',
       'You want a head start','Your competitors are not thinking about GEO yet. Being the first in your industry cited by AI is a real advantage.')],
  faq=[('¿Qué es exactamente GEO?','Generative Engine Optimization: la práctica de optimizar tu presencia para que los motores de IA (ChatGPT, Gemini, las AI Overviews de Google) te citen como fuente. Es el equivalente del SEO para la era de las respuestas generadas.',
        'What exactly is GEO?','Generative Engine Optimization: the practice of optimizing your presence so AI engines (ChatGPT, Gemini, Google AI Overviews) cite you as a source. It is the SEO equivalent for the era of generated answers.'),
       ('¿Qué necesitas de mí para empezar?','Tres cosas: la URL de tu sitio, acceso de solo lectura a Google Search Console y a Analytics. Te guío para darme el acceso en menos de 5 minutos, sin compartir contraseñas.',
        'What do you need from me to start?','Three things: your site URL, plus read-only access to Google Search Console and Analytics. I guide you to grant access in under 5 minutes, without sharing passwords.'),
       ('¿Sirve si mi sitio es muy pequeño o nuevo?','Honestamente: si tu sitio tiene menos de unas 10 páginas o menos de 6 meses, probablemente te convenga invertir primero en una base sólida (<a href="/servicios/web-express/">Web Express</a>). Si es tu caso, te lo digo antes de cobrarte.',
        'Is it worth it if my site is very small or new?','Honestly: if your site has fewer than about 10 pages or is under 6 months old, you are probably better off investing in a solid foundation first (<a href="/servicios/web-express/">Web Express</a>). If that is your case, I tell you before charging you.'),
       ('¿Garantiza que voy a subir en Google?','No — y desconfía de quien lo garantice. Lo que garantizo es un diagnóstico honesto con datos reales y un plan claro y priorizado. Los resultados dependen de ejecutarlo: tú, tu equipo o yo.',
        'Does it guarantee I will rank higher on Google?','No — and be wary of anyone who guarantees that. What I guarantee is an honest diagnosis with real data and a clear, prioritized plan. Results depend on executing it: you, your team or me.'),
       ('¿La auditoría se descuenta si luego te contrato?','Sí: si contratas la implementación o el <a href="/servicios/plan-mensual/">Plan mensual</a> dentro de los 30 días siguientes, los USD 400 se descuentan por completo del proyecto.',
        'Is the audit credited if I hire you afterwards?','Yes: if you hire the implementation or the <a href="/servicios/plan-mensual/">Monthly plan</a> within the following 30 days, the $400 is fully credited toward the project.')],
  cross=['/servicios/web-express/','/servicios/plan-mensual/'], cross_keys=['pk.1.name','pk.3.name'],
  cta=('Deja de adivinar por qué no apareces','Agenda 30 minutos o escríbeme por WhatsApp con la URL de tu sitio. Te confirmo si la auditoría es para ti en menos de 24 horas.',
       'Stop guessing why you do not show up','Book 30 minutes or message me on WhatsApp with your site URL. I confirm whether the audit is right for you within 24 hours.'),
 ),
 dict(
  slug='servicios/plan-mensual', url='/servicios/plan-mensual/', p='pm', featured=False,
  crumb=('Plan mensual', 'Monthly plan'),
  meta_es=('Plan Mensual de Diseño y Web — USD 600/mes, Sin Permanencia | Alexander Caro',
           'Diseño para redes, piezas de campaña y mejoras de tu sitio cada mes, con respuesta en menos de 24 h hábiles. USD 600/mes, mes a mes, pausa cuando quieras.'),
  meta_en=('Monthly Design & Web Plan — $600/month, No Lock-In | Alexander Caro',
           'Social media design, campaign assets and website improvements every month, with replies within 24 business hours. $600/month, month to month, pause anytime.'),
  keywords='plan mensual diseño gráfico, diseñador mensual para redes, retainer diseño web, suscripción de diseño, mantenimiento web mensual, diseñador de cabecera',
  schema_es=('Plan mensual de diseño y desarrollo web',
             'Suscripción mensual de diseño y desarrollo: piezas para redes sociales, material de campañas y mejoras continuas del sitio web, con respuesta en menos de 24 horas hábiles. USD 600 al mes, sin contratos de permanencia.'),
  schema_en=('Monthly design and web development plan',
             'Monthly design and development subscription: social media assets, campaign material and ongoing website improvements, with replies within 24 business hours. $600 per month, no lock-in contracts.'),
  offer={'price': '600', 'unit': 'MONTH'},
  wa_es='¡Hola Alexander! Me interesa el Plan mensual (USD 600/mes). Te cuento qué necesita mi negocio.',
  wa_en="Hi Alexander! I'm interested in the Monthly plan ($600/month). Let me tell you what my business needs.",
  hero_title=('Tu equipo digital, <span class="srv-hero__accent">sin contratar a nadie</span>',
              'Your digital team, <span class="srv-hero__accent">without hiring anyone</span>'),
  hero_sub=('Diseño para redes, piezas de campaña y mejoras de tu sitio web, cada mes y con respuesta en menos de 24 horas hábiles. Mes a mes, sin permanencia: pausa cuando quieras.',
            'Social media design, campaign assets and website improvements, every month, with replies within 24 business hours. Month to month, no lock-in: pause whenever you want.'),
  price=('USD 600', '$600 USD'), price_note=('Por mes · sin permanencia', 'Per month · no lock-in'),
  proof=[(None, ('<24 h', '<24 h'), ('Tiempo de respuesta, en días hábiles', 'Reply time, in business days')),
         (None, ('1–3 días', '1–3 days'), ('Entrega típica por pieza, según tamaño', 'Typical delivery per piece, depending on size')),
         ('0', None, ('Contratos de permanencia — es mes a mes', 'Lock-in contracts — it is month to month'))],
  que_title=('Lo digital de tu negocio, resuelto cada semana', "Your business's digital work, handled every week"),
  que=[('La mayoría de los negocios no necesita una agencia ni un empleado de tiempo completo. Necesita a alguien confiable que resuelva lo digital de cada semana: el post de la promoción, el banner de temporada, ese ajuste del sitio que lleva meses pendiente.',
        'Most businesses do not need an agency or a full-time employee. They need someone reliable to handle each week\'s digital work: the promo post, the seasonal banner, that website fix that has been pending for months.'),
       ('Eso es el Plan mensual: una bolsa de trabajo de diseño y desarrollo equivalente a unas 15 horas al mes. Pides por WhatsApp o correo, priorizamos juntos, y entrego pieza por pieza — normalmente en 1 a 3 días hábiles cada una.',
        'That is the Monthly plan: a design and development work pool equivalent to about 15 hours a month. You request via WhatsApp or email, we prioritize together, and I deliver piece by piece — usually within 1 to 3 business days each.'),
       ('Es mes a mes, sin contratos de permanencia. ¿Un mes tranquilo? Pausas el plan y no se cobra. Prefiero eso a cobrarte por nada.',
        'It is month to month, with no lock-in contracts. Quiet month coming? Pause the plan and you are not charged. I would rather that than charge you for nothing.')],
  inc=[('pen','Diseño para redes sociales','Posts, carruseles e historias con un sistema visual coherente — no piezas sueltas que no se parecen entre sí.',
        'Social media design','Posts, carousels and stories with a coherent visual system — not scattered pieces that look nothing alike.'),
       ('file','Piezas de campaña','Promociones, fechas especiales, lanzamientos y material para anuncios, en los formatos que necesites.',
        'Campaign assets','Promotions, special dates, launches and ad material, in whatever formats you need.'),
       ('layout','Mejoras de tu sitio web','Textos, secciones nuevas, ajustes de velocidad y mantenimiento — tu sitio evoluciona en vez de envejecer.',
        'Website improvements','Copy, new sections, speed tweaks and maintenance — your site evolves instead of aging.'),
       ('clock','Prioridad real','Respuesta en menos de 24 horas hábiles y una lista priorizada compartida: siempre sabes qué sigue.',
        'Real priority','Replies within 24 business hours and a shared, prioritized list: you always know what is next.'),
       ('play','Reporte mensual corto','Una página: qué se entregó, cuántas horas se usaron y qué recomiendo para el mes siguiente.',
        'Short monthly report','One page: what was delivered, how many hours were used, and what I recommend for next month.')],
  no=[('Gestión de pauta (Google/Meta Ads) — la configuro como proyecto aparte si la necesitas.', 'Ad management (Google/Meta Ads) — I set it up as a separate project if you need it.'),
      ('Proyectos grandes tipo rediseño completo o e-commerce: esos se cotizan como proyecto.', 'Large projects like full redesigns or e-commerce: those are quoted as projects.'),
      ('Trabajo ilimitado — es una bolsa mensual justa. Si un mes necesitas más, lo hablamos antes, sin cobros sorpresa.', 'Unlimited work — it is a fair monthly pool. If one month you need more, we talk first; no surprise charges.')],
  pro=[('01 — Arrancamos con una llamada','Definimos juntos qué cabe en tu plan y armamos la primera lista de prioridades.',
        '01 — We start with a call','Together we define what fits in your plan and build the first priority list.'),
       ('02 — Pides, yo entrego','Mandas pedidos por WhatsApp o correo. Cada pieza sale en 1–3 días hábiles según su tamaño.',
        '02 — You request, I deliver','Send requests via WhatsApp or email. Each piece ships in 1–3 business days depending on size.'),
       ('03 — Cierre de mes','Recibes el reporte corto y decides: continuar, pausar o ajustar prioridades. Sin ataduras.',
        '03 — Month close','You get the short report and decide: continue, pause or adjust priorities. No strings attached.')],
  pq_title=('Para quién es el Plan mensual', 'Who the Monthly plan is for'),
  pq=[('Negocios activos en redes','Publicas cada semana y necesitas piezas constantes con calidad consistente, sin perseguir a un diseñador distinto cada vez.',
       'Businesses active on social','You post every week and need a constant stream of consistent-quality assets, without chasing a different designer every time.'),
      ('E-commerce con promociones','Temporadas, descuentos, banners y campañas: tu tienda necesita material nuevo todo el tiempo.',
       'E-commerce running promotions','Seasons, discounts, banners and campaigns: your store needs fresh material all the time.'),
      ('Sitios que necesitan vivir','Ya tienes página (quizás un Web Express) y quieres que mejore cada mes en vez de quedarse congelada.',
       'Websites that need to stay alive','You already have a site (maybe a Web Express) and want it improving every month instead of freezing in time.')],
  faq=[('¿Cuánto trabajo cubre exactamente?','Una bolsa equivalente a unas 15 horas de trabajo al mes — en la práctica, entre 8 y 12 piezas de diseño, o una mezcla de piezas y mejoras web. Antes de empezar definimos juntos qué cabe, para que no haya sorpresas.',
        'How much work does it cover exactly?','A pool equivalent to about 15 hours of work per month — in practice, between 8 and 12 design pieces, or a mix of pieces and web improvements. Before starting we define together what fits, so there are no surprises.'),
       ('¿Las horas que no uso se pierden?','Hasta un 25% de la bolsa pasa al mes siguiente; el resto no se acumula. Si sabes que viene un mes tranquilo, te conviene pausar el plan — y te lo diré yo mismo si lo veo venir.',
        'Do unused hours expire?','Up to 25% of the pool rolls over to the next month; the rest does not accumulate. If you know a quiet month is coming, pausing the plan is your best move — and I will tell you myself if I see it coming.'),
       ('¿Cómo pido las cosas?','Por WhatsApp o correo, como te quede natural. Mantenemos una lista priorizada compartida: tú decides el orden, yo te digo qué alcanza.',
        'How do I request things?','Via WhatsApp or email, whatever feels natural. We keep a shared prioritized list: you decide the order, I tell you what fits.'),
       ('¿Puedo cancelar o pausar cuando quiera?','Sí. Avisas antes de la fecha del siguiente cobro y listo — sin penalidades ni preguntas incómodas. Puedes volver cuando lo necesites.',
        'Can I cancel or pause anytime?','Yes. Let me know before the next billing date and that is it — no penalties, no awkward questions. You can come back whenever you need.'),
       ('¿Incluye crear mi sitio web desde cero?','No: para eso está <a href="/servicios/web-express/">Web Express</a> (USD 800, 14 días). El Plan mensual mantiene y hace crecer lo que ya existe. Muchos clientes hacen ese camino: primero el sitio, luego el plan.',
        'Does it include building my website from scratch?','No: that is what <a href="/servicios/web-express/">Web Express</a> is for ($800, 14 days). The Monthly plan maintains and grows what already exists. Many clients take exactly that path: site first, then the plan.')],
  cross=['/servicios/web-express/','/servicios/auditoria-seo-geo/'], cross_keys=['pk.1.name','pk.2.name'],
  cta=('Deja de perseguir diseñadores cada mes','Agenda 30 minutos o escríbeme por WhatsApp. Vemos si el plan encaja con tu ritmo — y si no encaja, también te lo digo.',
       'Stop chasing designers every month','Book 30 minutes or message me on WhatsApp. We will see if the plan fits your pace — and if it does not, I will tell you that too.'),
 ),
]

# ══════════════════════════════════════════════════════════════════
# CIUDADES
# ══════════════════════════════════════════════════════════════════
CITIES = [
 dict(
  slug='diseno-web-miami', url='/diseno-web-miami/', p='mia',
  city='Miami', state='Florida', tz='0–1 h',
  crumb=('Diseño web en Miami', 'Web design in Miami'),
  meta_es=('Diseño Web en Español para Negocios en Miami | Alexander Caro',
           'Páginas web profesionales en español para negocios hispanos en Miami, Doral, Hialeah y Kendall. Precio cerrado desde USD 800, trato directo y en tu idioma.'),
  meta_en=('Spanish-Speaking Web Designer for Miami Businesses | Alexander Caro',
           'Professional websites in Spanish (and English) for Hispanic-owned businesses in Miami, Doral, Hialeah and Kendall. Fixed prices from $800, direct communication.'),
  keywords='diseño web miami español, página web para negocios miami, diseñador web hispano miami, página web restaurante miami, sitio web en español florida',
  schema_es=('Diseño web en español para negocios en Miami',
             'Diseño y desarrollo de páginas web profesionales en español para negocios hispanos en Miami, Florida: restaurantes, clínicas, real estate y servicios. Trabajo remoto con precio cerrado, invoice en inglés y comunicación directa en español.'),
  schema_en=('Spanish-language web design for Miami businesses',
             'Professional web design and development in Spanish for Hispanic-owned businesses in Miami, Florida: restaurants, clinics, real estate and services. Remote work with fixed pricing, English invoices and direct communication in Spanish.'),
  wa_es='¡Hola Alexander! Tengo un negocio en Miami y quiero una página web. ¿Podemos hablar?',
  wa_en="Hi Alexander! I have a business in Miami and I want a website. Can we talk?",
  hero_title=('Diseño web en español para negocios en <span class="srv-hero__accent">Miami</span>',
              'Web design in Spanish for businesses in <span class="srv-hero__accent">Miami</span>'),
  hero_sub=('Trabajo con dueños de negocio hispanos en Miami, Doral, Hialeah y Kendall: tu página profesional, en tu idioma, con precio cerrado y hablando directo con quien la diseña y la programa.',
            'I work with Hispanic business owners in Miami, Doral, Hialeah and Kendall: your professional website, in your language, at a fixed price, talking directly with the person who designs and codes it.'),
  t1=('Diferencia horaria con Miami — hablamos en tu horario', 'Time difference with Miami — we talk on your schedule'),
  why_title=('Calidad de agencia de EE. UU., sin pagar precios de agencia de EE. UU.', 'US-agency quality, without paying US-agency prices'),
  why=[('Miami funciona en español — pero la mayoría de las páginas "profesionales" se contratan con agencias que cobran 3 a 5 veces más por el mismo resultado, con un project manager de por medio y respuestas que tardan días.',
        'Miami runs on Spanish — yet most "professional" websites are bought from agencies charging 3 to 5 times more for the same result, with a project manager in between and replies that take days.'),
       ('Yo trabajo remoto desde Bogotá, con una diferencia horaria de 0 a 1 hora con Florida. Hablamos por WhatsApp y videollamada, en español de principio a fin, y tratas directo con la persona que diseña y programa tu sitio.',
        'I work remotely from Bogotá, with a 0-to-1-hour time difference with Florida. We talk on WhatsApp and video calls, in Spanish from start to finish, and you deal directly with the person who designs and codes your site.'),
       ('El resultado es medible: mis dos últimos proyectos marcan 97 y 99 en PageSpeed de Google, y cada sitio sale con SEO técnico completo para que te encuentren en Miami — no solo para que "se vea bonito".',
        'The result is measurable: my last two projects score 97 and 99 on Google PageSpeed, and every site ships with full technical SEO so people in Miami can actually find you — not just so it "looks nice".')],
  sect_title=('Sectores con los que trabajo en Miami', 'Industries I work with in Miami'),
  sectors=[('Restaurantes y cafeterías','Restaurants and cafés'),('Clínicas dentales y estéticas','Dental and aesthetic clinics'),
           ('Real estate y agentes','Real estate and agents'),('Abogados y servicios legales','Lawyers and legal services'),
           ('Salones, barberías y spas','Salons, barbershops and spas'),('Construcción y remodelación','Construction and remodeling')],
  faq=[('¿Atiendes en persona en Miami?','No — trabajo 100% remoto, y justamente por eso el precio es mejor: no pagas una oficina en Brickell. Todo se resuelve por WhatsApp y videollamada, con la ventaja de que casi no hay diferencia horaria.',
        'Do you meet in person in Miami?','No — I work 100% remotely, and that is exactly why the price is better: you are not paying for an office in Brickell. Everything is handled over WhatsApp and video calls, with the advantage of almost no time difference.'),
       ('¿Mi página puede estar en español e inglés?','Sí, y en Miami suele ser la mejor decisión: tu sitio puede ser bilingüe ES/EN, como este mismo portafolio. Lo cotizamos según el alcance.',
        'Can my site be in Spanish and English?','Yes, and in Miami that is usually the smart move: your site can be bilingual ES/EN, just like this very portfolio. We quote it based on scope.'),
       ('¿Cómo te pago desde Estados Unidos?','En dólares, por Wise, PayPal o transferencia. 50% para reservar y 50% contra entrega. Emito invoice en inglés con mis datos para tu contabilidad.',
        'How do I pay you from the US?','In USD, via Wise, PayPal or bank transfer. 50% to book and 50% on delivery. I issue an English invoice with my details for your bookkeeping.'),
       ('¿Cuánto tarda y cuánto cuesta?','El paquete <a href="/servicios/web-express/">Web Express</a> cuesta USD 800 (precio cerrado) y se entrega en 14 días desde que recibo tu contenido. Si necesitas algo más grande, te paso propuesta con precio fijo en menos de 24 horas.',
        'How long does it take and how much does it cost?','The <a href="/servicios/web-express/">Web Express</a> package costs $800 (fixed price) and is delivered 14 days after I receive your content. If you need something bigger, I send a fixed-price proposal within 24 hours.'),
       ('¿Me ayudas a aparecer en Google en Miami?','Todo sitio sale con SEO técnico completo. Si ya tienes página y no aparece, la <a href="/servicios/auditoria-seo-geo/">Auditoría SEO + GEO</a> (USD 400) te dice exactamente por qué — incluyendo si las respuestas de IA citan a tu competencia en vez de a ti.',
        'Can you help me show up on Google in Miami?','Every site ships with full technical SEO. If you already have a page that does not show up, the <a href="/servicios/auditoria-seo-geo/">SEO + GEO Audit</a> ($400) tells you exactly why — including whether AI answers cite your competitors instead of you.')],
  other=('¿Tu negocio está en otra ciudad? También trabajo con negocios en <a href="/diseno-web-houston/">Houston</a> y <a href="/diseno-web-los-angeles/">Los Ángeles</a> — y en cualquier ciudad de EE. UU.',
         'Is your business in another city? I also work with businesses in <a href="/diseno-web-houston/">Houston</a> and <a href="/diseno-web-los-angeles/">Los Angeles</a> — and anywhere in the US.'),
  cta=('¿Tu negocio en Miami necesita una página seria?','Escríbeme por WhatsApp en español o agenda una llamada de 30 minutos. Te respondo en menos de 24 horas.',
       'Does your Miami business need a serious website?','Message me on WhatsApp in Spanish or book a 30-minute call. I reply within 24 hours.'),
 ),
 dict(
  slug='diseno-web-houston', url='/diseno-web-houston/', p='hou',
  city='Houston', state='Texas', tz='0–1 h',
  crumb=('Diseño web en Houston', 'Web design in Houston'),
  meta_es=('Diseño Web en Español para Negocios en Houston | Alexander Caro',
           'Páginas web profesionales en español para negocios hispanos en Houston: construcción, talleres, restaurantes y más. Precio cerrado desde USD 800, trato directo en tu idioma.'),
  meta_en=('Spanish-Speaking Web Designer for Houston Businesses | Alexander Caro',
           'Professional websites in Spanish (and English) for Hispanic-owned businesses in Houston: construction, auto shops, restaurants and more. Fixed prices from $800.'),
  keywords='diseño web houston español, página web para negocios houston, diseñador web hispano texas, página web construcción houston, sitio web en español houston',
  schema_es=('Diseño web en español para negocios en Houston',
             'Diseño y desarrollo de páginas web profesionales en español para negocios hispanos en Houston, Texas: construcción, talleres, restaurantes, transporte y servicios. Trabajo remoto con precio cerrado, invoice en inglés y comunicación directa en español.'),
  schema_en=('Spanish-language web design for Houston businesses',
             'Professional web design and development in Spanish for Hispanic-owned businesses in Houston, Texas: construction, auto shops, restaurants, transport and services. Remote work with fixed pricing, English invoices and direct communication in Spanish.'),
  wa_es='¡Hola Alexander! Tengo un negocio en Houston y quiero una página web. ¿Podemos hablar?',
  wa_en="Hi Alexander! I have a business in Houston and I want a website. Can we talk?",
  hero_title=('Diseño web en español para negocios en <span class="srv-hero__accent">Houston</span>',
              'Web design in Spanish for businesses in <span class="srv-hero__accent">Houston</span>'),
  hero_sub=('Trabajo con dueños de negocio hispanos en Houston — East End, Gulfton, Pasadena, Spring Branch y toda el área: tu página profesional, en tu idioma, con precio cerrado y sin agencias de por medio.',
            'I work with Hispanic business owners across Houston — East End, Gulfton, Pasadena, Spring Branch and beyond: your professional website, in your language, at a fixed price, with no agency in between.'),
  t1=('Diferencia horaria con Houston — hablamos en tu horario', 'Time difference with Houston — we talk on your schedule'),
  why_title=('Una página seria te separa del 80% de tu competencia', 'A serious website sets you apart from 80% of your competition'),
  why=[('Houston tiene una de las comunidades de negocios hispanos más grandes del país — y muchísimos siguen trabajando solo con Facebook y el voz a voz. Cuando un cliente busca "remodelación cerca de mí" y tú no tienes página, el trabajo se lo lleva otro.',
        'Houston has one of the largest Hispanic business communities in the country — and a huge share still runs on Facebook and word of mouth alone. When a client searches "remodeling near me" and you have no website, someone else gets the job.'),
       ('Yo trabajo remoto desde Bogotá, con una diferencia horaria de 0 a 1 hora con Texas. Hablamos por WhatsApp y videollamada, en español de principio a fin, y tratas directo con la persona que diseña y programa tu sitio.',
        'I work remotely from Bogotá, with a 0-to-1-hour time difference with Texas. We talk on WhatsApp and video calls, in Spanish from start to finish, and you deal directly with the person who designs and codes your site.'),
       ('El resultado es medible: mis dos últimos proyectos marcan 97 y 99 en PageSpeed de Google, y cada sitio sale con SEO técnico completo para que te encuentren en Houston — con precio cerrado en dólares e invoice para tu contabilidad.',
        'The result is measurable: my last two projects score 97 and 99 on Google PageSpeed, and every site ships with full technical SEO so people in Houston can find you — at a fixed USD price with an invoice for your books.')],
  sect_title=('Sectores con los que trabajo en Houston', 'Industries I work with in Houston'),
  sectors=[('Construcción y remodelación','Construction and remodeling'),('Talleres mecánicos y autopartes','Auto shops and parts'),
           ('Restaurantes y taquerías','Restaurants and taquerías'),('Transporte y logística','Transport and logistics'),
           ('Limpieza y servicios del hogar','Cleaning and home services'),('Clínicas y salud','Clinics and healthcare')],
  faq=[('¿Atiendes en persona en Houston?','No — trabajo 100% remoto, y por eso el precio es mejor: no pagas los costos de una agencia local. Todo se resuelve por WhatsApp y videollamada, prácticamente en tu mismo horario.',
        'Do you meet in person in Houston?','No — I work 100% remotely, which is exactly why the price is better: you are not paying local-agency overhead. Everything is handled over WhatsApp and video calls, practically on your same schedule.'),
       ('¿Mi página puede estar en español e inglés?','Sí. Para muchos negocios en Houston lo ideal es un sitio bilingüe ES/EN, como este mismo portafolio. Lo cotizamos según el alcance.',
        'Can my site be in Spanish and English?','Yes. For many Houston businesses a bilingual ES/EN site is the smart move — just like this very portfolio. We quote it based on scope.'),
       ('¿Cómo te pago desde Estados Unidos?','En dólares, por Wise, PayPal o transferencia. 50% para reservar y 50% contra entrega. Emito invoice en inglés con mis datos para tu contabilidad.',
        'How do I pay you from the US?','In USD, via Wise, PayPal or bank transfer. 50% to book and 50% on delivery. I issue an English invoice with my details for your bookkeeping.'),
       ('¿Cuánto tarda y cuánto cuesta?','El paquete <a href="/servicios/web-express/">Web Express</a> cuesta USD 800 (precio cerrado) y se entrega en 14 días desde que recibo tu contenido. Si necesitas algo más grande, te paso propuesta con precio fijo en menos de 24 horas.',
        'How long does it take and how much does it cost?','The <a href="/servicios/web-express/">Web Express</a> package costs $800 (fixed price) and is delivered 14 days after I receive your content. If you need something bigger, I send a fixed-price proposal within 24 hours.'),
       ('Trabajo en construcción y casi todo me llega por referidos. ¿Igual necesito página?','Los referidos te consiguen la llamada; tu página cierra el trato. Hoy el cliente que recibe tu número te busca en Google antes de contestar — si no apareces o tu presencia se ve improvisada, el presupuesto compite en desventaja.',
        'I work in construction and most jobs come from referrals. Do I still need a website?','Referrals get you the call; your website closes the deal. Today the client who gets your number googles you before answering — if nothing shows up, or what shows up looks improvised, your quote competes at a disadvantage.')],
  other=('¿Tu negocio está en otra ciudad? También trabajo con negocios en <a href="/diseno-web-miami/">Miami</a> y <a href="/diseno-web-los-angeles/">Los Ángeles</a> — y en cualquier ciudad de EE. UU.',
         'Is your business in another city? I also work with businesses in <a href="/diseno-web-miami/">Miami</a> and <a href="/diseno-web-los-angeles/">Los Angeles</a> — and anywhere in the US.'),
  cta=('¿Tu negocio en Houston necesita una página seria?','Escríbeme por WhatsApp en español o agenda una llamada de 30 minutos. Te respondo en menos de 24 horas.',
       'Does your Houston business need a serious website?','Message me on WhatsApp in Spanish or book a 30-minute call. I reply within 24 hours.'),
 ),
 dict(
  slug='diseno-web-los-angeles', url='/diseno-web-los-angeles/', p='lax',
  city='Los Ángeles', state='California', tz='2–3 h',
  crumb=('Diseño web en Los Ángeles', 'Web design in Los Angeles'),
  meta_es=('Diseño Web en Español para Negocios en Los Ángeles | Alexander Caro',
           'Páginas web profesionales en español para negocios hispanos en Los Ángeles: restaurantes, servicios del hogar, tiendas y más. Precio cerrado desde USD 800, directo y en tu idioma.'),
  meta_en=('Spanish-Speaking Web Designer for Los Angeles Businesses | Alexander Caro',
           'Professional websites in Spanish (and English) for Hispanic-owned businesses in Los Angeles: restaurants, home services, shops and more. Fixed prices from $800.'),
  keywords='diseño web los angeles español, página web para negocios los angeles, diseñador web hispano california, página web restaurante los angeles, sitio web en español la',
  schema_es=('Diseño web en español para negocios en Los Ángeles',
             'Diseño y desarrollo de páginas web profesionales en español para negocios hispanos en Los Ángeles, California: restaurantes, servicios del hogar, tiendas y creativos. Trabajo remoto con precio cerrado, invoice en inglés y comunicación directa en español.'),
  schema_en=('Spanish-language web design for Los Angeles businesses',
             'Professional web design and development in Spanish for Hispanic-owned businesses in Los Angeles, California: restaurants, home services, shops and creatives. Remote work with fixed pricing, English invoices and direct communication in Spanish.'),
  wa_es='¡Hola Alexander! Tengo un negocio en Los Ángeles y quiero una página web. ¿Podemos hablar?',
  wa_en="Hi Alexander! I have a business in Los Angeles and I want a website. Can we talk?",
  hero_title=('Diseño web en español para negocios en <span class="srv-hero__accent">Los Ángeles</span>',
              'Web design in Spanish for businesses in <span class="srv-hero__accent">Los Angeles</span>'),
  hero_sub=('Trabajo con dueños de negocio hispanos en Los Ángeles — East LA, Huntington Park, Van Nuys, South Gate y toda el área: tu página profesional, en tu idioma, con precio cerrado y sin agencias de por medio.',
            'I work with Hispanic business owners across Los Angeles — East LA, Huntington Park, Van Nuys, South Gate and beyond: your professional website, in your language, at a fixed price, with no agency in between.'),
  t1=('Diferencia con el Pacífico — me adapto a tu horario de la tarde', 'Difference with Pacific time — I adapt to your afternoon schedule'),
  why_title=('El español es idioma de negocios en LA — tu página debería hablarlo', 'Spanish is a business language in LA — your website should speak it'),
  why=[('En Los Ángeles el español mueve negocios de East LA a Van Nuys — pero las páginas profesionales en español escasean: o son plantillas genéricas que se ven iguales entre sí, o presupuestos de agencia fuera del alcance de un negocio familiar.',
        'In Los Angeles, Spanish drives business from East LA to Van Nuys — yet professional Spanish-language websites are scarce: either generic templates that all look the same, or agency budgets out of reach for a family business.'),
       ('Yo trabajo remoto desde Bogotá y me adapto a tu horario del Pacífico (la diferencia es de 2 a 3 horas). Hablamos por WhatsApp y videollamada, en español de principio a fin, y tratas directo con quien diseña y programa tu sitio.',
        'I work remotely from Bogotá and adapt to your Pacific schedule (the difference is 2 to 3 hours). We talk on WhatsApp and video calls, in Spanish from start to finish, and you deal directly with the person who designs and codes your site.'),
       ('El resultado es medible: mis dos últimos proyectos marcan 97 y 99 en PageSpeed de Google, y cada sitio sale con SEO técnico completo para que te encuentren en LA — con precio cerrado en dólares e invoice para tu contabilidad.',
        'The result is measurable: my last two projects score 97 and 99 on Google PageSpeed, and every site ships with full technical SEO so people in LA can find you — at a fixed USD price with an invoice for your books.')],
  sect_title=('Sectores con los que trabajo en Los Ángeles', 'Industries I work with in Los Angeles'),
  sectors=[('Restaurantes y food trucks','Restaurants and food trucks'),('Servicios del hogar: jardinería, plomería, limpieza','Home services: landscaping, plumbing, cleaning'),
           ('Boutiques y tiendas','Boutiques and shops'),('Talleres y autopartes','Auto shops and parts'),
           ('Salud y bienestar','Health and wellness'),('Fotógrafos y creativos','Photographers and creatives')],
  faq=[('¿Atiendes en persona en Los Ángeles?','No — trabajo 100% remoto, y por eso el precio es mejor: no pagas los costos de una agencia local. Todo se resuelve por WhatsApp y videollamada, en el horario que te sirva.',
        'Do you meet in person in Los Angeles?','No — I work 100% remotely, which is exactly why the price is better: you are not paying local-agency overhead. Everything is handled over WhatsApp and video calls, at whatever time works for you.'),
       ('¿Mi página puede estar en español e inglés?','Sí. En LA un sitio bilingüe ES/EN suele ser la mejor decisión — como este mismo portafolio. Lo cotizamos según el alcance.',
        'Can my site be in Spanish and English?','Yes. In LA a bilingual ES/EN site is usually the smart move — just like this very portfolio. We quote it based on scope.'),
       ('¿Cómo te pago desde Estados Unidos?','En dólares, por Wise, PayPal o transferencia. 50% para reservar y 50% contra entrega. Emito invoice en inglés con mis datos para tu contabilidad.',
        'How do I pay you from the US?','In USD, via Wise, PayPal or bank transfer. 50% to book and 50% on delivery. I issue an English invoice with my details for your bookkeeping.'),
       ('¿Cuánto tarda y cuánto cuesta?','El paquete <a href="/servicios/web-express/">Web Express</a> cuesta USD 800 (precio cerrado) y se entrega en 14 días desde que recibo tu contenido. Si necesitas algo más grande, te paso propuesta con precio fijo en menos de 24 horas.',
        'How long does it take and how much does it cost?','The <a href="/servicios/web-express/">Web Express</a> package costs $800 (fixed price) and is delivered 14 days after I receive your content. If you need something bigger, I send a fixed-price proposal within 24 hours.'),
       ('¿Me ayudas a aparecer en Google en Los Ángeles?','Todo sitio sale con SEO técnico completo. Si ya tienes página y no aparece, la <a href="/servicios/auditoria-seo-geo/">Auditoría SEO + GEO</a> (USD 400) te dice exactamente por qué — incluyendo si las respuestas de IA citan a tu competencia en vez de a ti.',
        'Can you help me show up on Google in Los Angeles?','Every site ships with full technical SEO. If you already have a page that does not show up, the <a href="/servicios/auditoria-seo-geo/">SEO + GEO Audit</a> ($400) tells you exactly why — including whether AI answers cite your competitors instead of you.')],
  other=('¿Tu negocio está en otra ciudad? También trabajo con negocios en <a href="/diseno-web-miami/">Miami</a> y <a href="/diseno-web-houston/">Houston</a> — y en cualquier ciudad de EE. UU.',
         'Is your business in another city? I also work with businesses in <a href="/diseno-web-miami/">Miami</a> and <a href="/diseno-web-houston/">Houston</a> — and anywhere in the US.'),
  cta=('¿Tu negocio en Los Ángeles necesita una página seria?','Escríbeme por WhatsApp en español o agenda una llamada de 30 minutos. Te respondo en menos de 24 horas.',
       'Does your LA business need a serious website?','Message me on WhatsApp in Spanish or book a 30-minute call. I reply within 24 hours.'),
 ),
]

# ══════════════════════════════════════════════════════════════════
# RENDER
# ══════════════════════════════════════════════════════════════════
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com" />\n'
 '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
 '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" media="print" onload="this.media=\'all\'" />\n'
 '  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" /></noscript>')

def icon(name):
    return f'<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">{ICONS[name]}</svg>'

def head(title, desc, keywords, url, schema):
    return f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content="{desc}" />
  <meta name="keywords" content="{keywords}" />
  <meta name="robots" content="index, follow" />
  <link rel="preload" as="image" href="https://res.cloudinary.com/dg2wnq6ao/image/upload/h_56,w_140,c_fit,q_auto,f_auto/v1781101946/Logo-en-el-nav_ubnip9.webp" fetchpriority="high">
  <link rel="canonical" href="{SITE}{url}" />
  <link rel="alternate" hreflang="es" href="{SITE}{url}" />
  <link rel="alternate" hreflang="en" href="{SITE}/en{url}" />
  <link rel="alternate" hreflang="x-default" href="{SITE}/en{url}" />

  {FONTS}
  <meta property="og:type" content="website" />
  <meta property="og:url" content="{SITE}{url}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:image" content="{OG_IMG}" />
  <meta property="og:locale" content="es_CO" />
  <meta property="og:site_name" content="Alexander Caro" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{desc}" />

  <script type="application/ld+json">
  {json.dumps(schema, ensure_ascii=False, indent=2)}
  </script>

  <link rel="stylesheet" href="/style.css" />
  <link rel="stylesheet" href="{SHARED_CSS}" />
</head>
<body>

  <div class="scroll-progress" id="scrollProgress"></div>
'''

def footer(wa_es, wa_en):
    return f'''  <footer class="footer" id="site-footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__meta">
          <span class="footer__meta-item" data-i18n="footer.location">📍 Bogotá, Colombia — UTC−5</span>
          <span class="footer__meta-item" data-i18n="footer.languages">🌐 Español · English</span>
          <span class="footer__meta-item" data-i18n="footer.availability">💻 100% remoto — Disponible globalmente</span>
        </div>
        <div class="footer__links">
          <a href="/" data-i18n="nav.home">Inicio</a>
          <a href="/trabajo/" data-i18n="nav.work">Trabajo</a>
          <a href="/servicios/" data-i18n="nav.services">Servicios</a>
          <a href="/sobre-mi/" data-i18n="nav.about">Sobre mí</a>
          <a href="https://www.behance.net/alexandercaro" target="_blank" rel="noopener">Behance</a>
          <a href="https://www.linkedin.com/in/sneider-alexander-de-la-cuadra-caro/" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://www.instagram.com/alexander_caro7/" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
      <div class="footer__bottom">
        <span class="footer__copy" data-i18n="footer.copy">© 2026 Alexander Caro</span>
        <a href="/privacidad/" class="footer__privacy" data-i18n="footer.privacy">Política de privacidad</a>
      </div>
    </div>
  </footer>

  <script defer src="/analytics.js"></script>
  <script src="/nav.js" defer></script>
  <script src="/i18n.js" defer></script>
  <script>
    var WA_MSG = location.pathname.indexOf('/en') === 0
      ? {json.dumps(wa_en, ensure_ascii=False)}
      : {json.dumps(wa_es, ensure_ascii=False)};
    document.querySelectorAll('[id^="whatsappBtn"]').forEach(function(b){{b.addEventListener('click',function(){{openWA(WA_MSG);}});}});
  </script>
  <script src="{SHARED_JS}" defer></script>
</body>
</html>
'''

def cta_buttons(n=''):
    return (f'<button class="btn btn--gold btn--lg" data-i18n="cta.whatsapp" id="whatsappBtn{n}">Escríbeme por WhatsApp</button>\n'
            f'          <a class="btn btn--ghost btn--lg" href="{CAL}" target="_blank" rel="noopener" data-i18n="ofr.calendly">Agenda una llamada de 30 min</a>')

def faq_block(prefix, items):
    rows = []
    for i, it in enumerate(items, 1):
        q_es, a_es = K(f'{prefix}.faq.{i}.q', it[0], it[2]), K(f'{prefix}.faq.{i}.a', it[1], it[3])
        rows.append(f'''        <div class="svc-faq-item" role="button" tabindex="0" aria-expanded="false">
          <span class="svc-faq-item__q" data-i18n="{prefix}.faq.{i}.q">{q_es}</span>
          <svg class="svc-faq-item__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          <div class="svc-faq-item__a" data-i18n="{prefix}.faq.{i}.a">{a_es}</div>
        </div>''')
    return f'''  <!-- FAQ -->
  <section class="section" style="background:rgba(205,183,142,0.015)">
    <div class="container">
      <p class="eyebrow scroll-reveal" data-i18n="ofr.faq">PREGUNTAS FRECUENTES</p>
      <h2 class="section__title scroll-reveal" data-i18n="ofr.faqTitle">Las dudas que todos me preguntan</h2>
      <div class="svc-faq-list" style="margin-top:24px">
{chr(10).join(rows)}
      </div>
    </div>
  </section>
'''

def pkg_cards():
    """Grid de 3 paquetes reutilizable (hub y ciudades)."""
    def card(n, href, featured=False):
        badge = '\n          <span class="pkg-card__badge" data-i18n="pk.badge">MÁS PEDIDO</span>' if featured else ''
        period = '<small data-i18n="pk.3.period">/mes</small>' if n == 3 else ''
        lis = '\n'.join(f'            <li data-i18n="pk.{n}.li{j}">{KEYS[f"pk.{n}.li{j}"][0]}</li>' for j in range(1, 5))
        return f'''        <a href="{href}" class="pkg-card{' pkg-card--featured' if featured else ''} scroll-reveal">{badge}
          <h3 class="pkg-card__name" data-i18n="pk.{n}.name">{KEYS[f'pk.{n}.name'][0]}</h3>
          <div class="pkg-card__price"><span data-i18n="pk.{n}.price">{KEYS[f'pk.{n}.price'][0]}</span>{period}</div>
          <p class="pkg-card__tag" data-i18n="pk.{n}.tag">{KEYS[f'pk.{n}.tag'][0]}</p>
          <ul class="pkg-card__list">
{lis}
          </ul>
          <span class="pkg-card__cta"><span data-i18n="pk.cta">Ver detalles</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg></span>
        </a>'''
    return (card(1, '/servicios/web-express/', True) + '\n' +
            card(2, '/servicios/auditoria-seo-geo/') + '\n' +
            card(3, '/servicios/plan-mensual/'))

def breadcrumb(url, crumb_es, parents):
    items, pos = [], 1
    for name, item in parents:
        items.append({"@type":"ListItem","position":pos,"name":name,"item":item}); pos += 1
    items.append({"@type":"ListItem","position":pos,"name":crumb_es,"item":SITE+url})
    return {"@type":"BreadcrumbList","itemListElement":items}

def offer_schema(o):
    offer = {"@type":"Offer","price":o['offer']['price'],"priceCurrency":"USD",
             "url":SITE+o['url'],"availability":"https://schema.org/InStock"}
    if o['offer']['unit'] == 'MONTH':
        offer["priceSpecification"] = {"@type":"UnitPriceSpecification","price":600,
            "priceCurrency":"USD","billingIncrement":1,"unitText":"MONTH"}
    svc = {"@type":"Service","name":o['schema_es'][0],"description":o['schema_es'][1],
           "provider":PERSON,
           "areaServed":[{"@type":"Country","name":"Colombia"},{"@type":"Place","name":"Latinoamérica"},
                         {"@type":"Country","name":"Estados Unidos"},{"@type":"Country","name":"España"}],
           "serviceType":"Diseño y desarrollo web","url":SITE+o['url'],
           "availableChannel":{"@type":"ServiceChannel","serviceUrl":SITE+o['url'],"availableLanguage":["es","en"]},
           "offers":offer}
    faq = {"@type":"FAQPage","mainEntity":[
        {"@type":"Question","name":q_es,"acceptedAnswer":{"@type":"Answer","text":strip_tags(a_es)}}
        for q_es, a_es, _, _ in o['faq']]}
    return {"@context":"https://schema.org","@graph":[
        breadcrumb(o['url'], o['crumb'][0], [("Inicio",SITE+"/"),("Servicios",SITE+"/servicios/")]),
        svc, faq]}

def city_schema(c):
    svc = {"@type":"Service","name":c['schema_es'][0],"description":c['schema_es'][1],
           "provider":PERSON,
           "areaServed":{"@type":"City","name":c['city'],
                         "containedInPlace":{"@type":"State","name":c['state']}},
           "serviceType":"Diseño y desarrollo web","url":SITE+c['url'],
           "availableChannel":{"@type":"ServiceChannel","serviceUrl":SITE+c['url'],"availableLanguage":["es","en"]},
           "offers":{"@type":"AggregateOffer","lowPrice":"400","highPrice":"800",
                     "priceCurrency":"USD","offerCount":"3"}}
    faq = {"@type":"FAQPage","mainEntity":[
        {"@type":"Question","name":q_es,"acceptedAnswer":{"@type":"Answer","text":strip_tags(a_es)}}
        for q_es, a_es, _, _ in c['faq']]}
    return {"@context":"https://schema.org","@graph":[
        breadcrumb(c['url'], c['crumb'][0], [("Inicio",SITE+"/")]), svc, faq]}

import re as _re
def strip_tags(s): return _re.sub('<[^>]+>', '', s)

def render_offer(o):
    p = o['p']
    ht = K(f'{p}.hero.title', *o['hero_title']); hs = K(f'{p}.hero.sub', *o['hero_sub'])
    pa = K(f'{p}.price.amount', *o['price']); pn = K(f'{p}.price.note', *o['price_note'])
    proof_html = []
    for i, (lit, numkey, label) in enumerate(o['proof'], 1):
        num = lit if lit else K(f'{p}.proof.{i}.num', *numkey)
        num_attr = '' if lit else f' data-i18n="{p}.proof.{i}.num"'
        lab = K(f'{p}.proof.{i}', *label)
        proof_html.append(f'''      <div class="proof-stat proof-stat--inline">
        <span class="proof-stat__num"{num_attr}>{num}</span>
        <span class="proof-stat__label" data-i18n="{p}.proof.{i}">{lab}</span>
      </div>''')
    qt = K(f'{p}.queEs.title', *o['que_title'])
    qp = [K(f'{p}.queEs.p{i}', es, en) for i, (es, en) in enumerate(o['que'], 1)]
    inc_html = []
    for i, (ic, t_es, d_es, t_en, d_en) in enumerate(o['inc'], 1):
        t = K(f'{p}.inc.{i}.title', t_es, t_en); d = K(f'{p}.inc.{i}.desc', d_es, d_en)
        inc_html.append(f'''            <div class="incluye-item">
              <div class="incluye-item__icon">{icon(ic)}</div>
              <div>
                <span class="incluye-item__tag" data-i18n="label.incluye">Incluye</span>
                <h3 class="incluye-item__title" data-i18n="{p}.inc.{i}.title">{t}</h3>
                <p class="incluye-item__desc" data-i18n="{p}.inc.{i}.desc">{d}</p>
              </div>
            </div>''')
    no_html = '\n'.join(f'          <li data-i18n="{p}.no.{i}">{K(f"{p}.no.{i}", es, en)}</li>'
                        for i, (es, en) in enumerate(o['no'], 1))
    pro_html = []
    for i, (t_es, d_es, t_en, d_en) in enumerate(o['pro'], 1):
        t = K(f'{p}.pro.{i}.title', t_es, t_en); d = K(f'{p}.pro.{i}.desc', d_es, d_en)
        delay = f' style="--reveal-delay:.{i-1}6s"' if i > 1 else ''
        pro_html.append(f'''        <article class="card card--service scroll-reveal"{delay}>
          <h3 class="card__title" data-i18n="{p}.pro.{i}.title">{t}</h3>
          <p class="card__text" data-i18n="{p}.pro.{i}.desc">{d}</p>
        </article>''')
    pqt = K(f'{p}.pq.title', *o['pq_title'])
    pq_html = []
    for i, (t_es, d_es, t_en, d_en) in enumerate(o['pq'], 1):
        t = K(f'{p}.pq.{i}.title', t_es, t_en); d = K(f'{p}.pq.{i}.desc', d_es, d_en)
        delay = f' style="--reveal-delay:.{i-1}s"' if i > 1 else ''
        pq_html.append(f'''        <article class="card card--service scroll-reveal"{delay}>
          <h3 class="card__title" data-i18n="{p}.pq.{i}.title">{t}</h3>
          <p class="card__text" data-i18n="{p}.pq.{i}.desc">{d}</p>
        </article>''')
    ctat = K(f'{p}.cta.title', o['cta'][0], o['cta'][2]); ctas = K(f'{p}.cta.sub', o['cta'][1], o['cta'][3])
    cross = ' · '.join(f'<a href="{href}" data-i18n="{key}">{KEYS[key][0]}</a>'
                       for href, key in zip(o['cross'], o['cross_keys']))
    body = f'''
  <!-- HERO -->
  <section class="srv-hero" style="min-height:70svh">
    <canvas id="heroCanvas" class="hero__canvas"></canvas>
    <div class="container" style="position:relative;z-index:2;padding-top:120px;padding-bottom:60px">
      <a href="/servicios/" class="back-link reveal-up"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg> <span data-i18n="nav.verServicios">Ver todos los servicios</span></a>
      <p class="eyebrow reveal-up" style="--delay:.1s" data-i18n="ofr.eyebrow">PAQUETE · PRECIO CERRADO</p>
      <h1 class="srv-hero__title reveal-up" style="--delay:.18s" data-i18n="{p}.hero.title">{ht}</h1>
      <div class="offer-price reveal-up" style="--delay:.24s">
        <span class="offer-price__amount" data-i18n="{p}.price.amount">{pa}</span>
        <span class="offer-price__note" data-i18n="{p}.price.note">{pn}</span>
      </div>
      <p class="srv-hero__sub reveal-up" style="--delay:.28s" data-i18n="{p}.hero.sub">{hs}</p>
      <div class="reveal-up" style="--delay:.36s;margin-top:28px;display:flex;gap:14px;flex-wrap:wrap">
        {cta_buttons()}
      </div>
    </div>
  </section>

  <!-- PRUEBA -->
  <section class="section" style="padding-top:0;padding-bottom:0">
    <div class="container">
      <div class="proof-row">
{chr(10).join(proof_html)}
      </div>
    </div>
  </section>

  <!-- QUÉ ES + INCLUYE -->
  <section class="section">
    <div class="container">
      <div class="about__grid">
        <div class="scroll-reveal">
          <p class="eyebrow" data-i18n="section.queEs">QUÉ ES</p>
          <h2 class="section__title" data-i18n="{p}.queEs.title">{qt}</h2>
          <p data-i18n="{p}.queEs.p1" style="color:var(--text-muted);line-height:1.8;margin-bottom:16px">{qp[0]}</p>
          <p data-i18n="{p}.queEs.p2" style="color:var(--text-muted);line-height:1.8;margin-bottom:16px">{qp[1]}</p>
          <p data-i18n="{p}.queEs.p3" style="color:var(--text-muted);line-height:1.8">{qp[2]}</p>
        </div>
        <div class="scroll-reveal" style="--reveal-delay:.1s">
          <div class="incluye-list">
{chr(10).join(inc_html)}
          </div>
        </div>
      </div>
      <div class="no-incluye scroll-reveal" style="max-width:760px">
        <p class="no-incluye__title" data-i18n="label.noIncluye">Qué no incluye — para que no haya sorpresas</p>
        <ul class="no-incluye__list">
{no_html}
        </ul>
      </div>
    </div>
  </section>

  <!-- CÓMO FUNCIONA -->
  <section class="section" style="background:rgba(205,183,142,0.015)">
    <div class="container">
      <p class="eyebrow scroll-reveal" data-i18n="section.proceso">PROCESO</p>
      <h2 class="section__title scroll-reveal" data-i18n="{p}.pq.titleProceso">Cómo funciona</h2>
      <div class="services__grid">
{chr(10).join(pro_html)}
      </div>
    </div>
  </section>

  <!-- PARA QUIÉN -->
  <section class="section">
    <div class="container">
      <p class="eyebrow scroll-reveal" data-i18n="section.paraQuien">PARA QUIÉN</p>
      <h2 class="section__title scroll-reveal" data-i18n="{p}.pq.title">{pqt}</h2>
      <div class="services__grid">
{chr(10).join(pq_html)}
      </div>
    </div>
  </section>

{faq_block(p, o['faq'])}
  <!-- CROSS -->
  <section class="section" style="padding-top:0;padding-bottom:0">
    <div class="container">
      <p class="scroll-reveal" style="color:var(--text-muted);font-size:0.92rem"><span data-i18n="ofr.crossLabel">También te puede servir:</span> {cross}</p>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section" id="contacto">
    <div class="container">
      <h2 class="cta-section__title" data-i18n="{p}.cta.title">{ctat}</h2>
      <p class="cta-section__sub" data-i18n="{p}.cta.sub">{ctas}</p>
      <div class="cta-section__actions">
        {cta_buttons('2')}
      </div>
    </div>
  </section>

'''
    K(f'{p}.pq.titleProceso', 'Cómo funciona', 'How it works')
    return (head(o['meta_es'][0], o['meta_es'][1], o['keywords'], o['url'], offer_schema(o))
            + body + footer(o['wa_es'], o['wa_en']))

def render_city(c):
    p = c['p']
    ht = K(f'{p}.hero.title', *c['hero_title']); hs = K(f'{p}.hero.sub', *c['hero_sub'])
    t1 = K(f'{p}.t1', *c['t1'])
    wt = K(f'{p}.why.title', *c['why_title'])
    wp = [K(f'{p}.why.p{i}', es, en) for i, (es, en) in enumerate(c['why'], 1)]
    st = K(f'{p}.sect.title', *c['sect_title'])
    chips = '\n'.join(f'        <span class="sector-chip" data-i18n="{p}.sect.{i}">{K(f"{p}.sect.{i}", es, en)}</span>'
                      for i, (es, en) in enumerate(c['sectors'], 1))
    other = K(f'{p}.other', *c['other'])
    ctat = K(f'{p}.cta.title', c['cta'][0], c['cta'][2]); ctas = K(f'{p}.cta.sub', c['cta'][1], c['cta'][3])
    body = f'''
  <!-- HERO -->
  <section class="srv-hero" style="min-height:70svh">
    <canvas id="heroCanvas" class="hero__canvas"></canvas>
    <div class="container" style="position:relative;z-index:2;padding-top:120px;padding-bottom:60px">
      <a href="/" class="back-link reveal-up"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg> <span data-i18n="nav.back">Volver al inicio</span></a>
      <p class="eyebrow reveal-up" style="--delay:.1s" data-i18n="cty.eyebrow">DISEÑO WEB EN ESPAÑOL · EE. UU.</p>
      <h1 class="srv-hero__title reveal-up" style="--delay:.18s" data-i18n="{p}.hero.title">{ht}</h1>
      <p class="srv-hero__sub reveal-up" style="--delay:.28s" data-i18n="{p}.hero.sub">{hs}</p>
      <div class="reveal-up" style="--delay:.36s;margin-top:28px;display:flex;gap:14px;flex-wrap:wrap">
        {cta_buttons()}
      </div>
    </div>
  </section>

  <!-- CONFIANZA -->
  <section class="section" style="padding-top:0;padding-bottom:0">
    <div class="container">
      <div class="proof-row">
        <div class="proof-stat proof-stat--inline">
          <span class="proof-stat__num">{c['tz']}</span>
          <span class="proof-stat__label" data-i18n="{p}.t1">{t1}</span>
        </div>
        <div class="proof-stat proof-stat--inline">
          <span class="proof-stat__num">97 · 99</span>
          <span class="proof-stat__label" data-i18n="cty.t2">{KEYS['cty.t2'][0]}</span>
        </div>
        <div class="proof-stat proof-stat--inline">
          <span class="proof-stat__num">USD</span>
          <span class="proof-stat__label" data-i18n="cty.t3">{KEYS['cty.t3'][0]}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- POR QUÉ -->
  <section class="section">
    <div class="container">
      <div class="about__grid">
        <div class="scroll-reveal">
          <p class="eyebrow" data-i18n="section.queEs">QUÉ ES</p>
          <h2 class="section__title" data-i18n="{p}.why.title">{wt}</h2>
          <p data-i18n="{p}.why.p1" style="color:var(--text-muted);line-height:1.8;margin-bottom:16px">{wp[0]}</p>
          <p data-i18n="{p}.why.p2" style="color:var(--text-muted);line-height:1.8;margin-bottom:16px">{wp[1]}</p>
          <p data-i18n="{p}.why.p3" style="color:var(--text-muted);line-height:1.8">{wp[2]}</p>
        </div>
        <div class="scroll-reveal" style="--reveal-delay:.1s">
          <p class="eyebrow" style="margin-bottom:14px" data-i18n="cty.sectEyebrow">SECTORES</p>
          <h3 style="font-family:var(--hv2-font-display);font-size:1.25rem;font-weight:500;color:var(--hv2-ink);margin-bottom:18px" data-i18n="{p}.sect.title">{st}</h3>
          <div class="sector-grid">
{chips}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- PAQUETES -->
  <section class="section" style="background:rgba(205,183,142,0.015)">
    <div class="container">
      <p class="eyebrow scroll-reveal" data-i18n="pk.eyebrow">PAQUETES CON PRECIO CERRADO</p>
      <h2 class="section__title scroll-reveal" data-i18n="pk.title">Tres formas de trabajar conmigo</h2>
      <p class="scroll-reveal" style="color:var(--text-muted);line-height:1.7;max-width:560px;margin-bottom:34px" data-i18n="cty.pkSub">{KEYS['cty.pkSub'][0]}</p>
      <div class="pkg-grid">
{pkg_cards()}
      </div>
    </div>
  </section>

{faq_block(p, c['faq'])}
  <!-- OTRAS CIUDADES -->
  <section class="section" style="padding-top:0;padding-bottom:0">
    <div class="container">
      <p class="scroll-reveal" style="color:var(--text-muted);font-size:0.92rem" data-i18n="{p}.other">{other}</p>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section" id="contacto">
    <div class="container">
      <h2 class="cta-section__title" data-i18n="{p}.cta.title">{ctat}</h2>
      <p class="cta-section__sub" data-i18n="{p}.cta.sub">{ctas}</p>
      <div class="cta-section__actions">
        {cta_buttons('2')}
      </div>
    </div>
  </section>

'''
    return (head(c['meta_es'][0], c['meta_es'][1], c['keywords'], c['url'], city_schema(c))
            + body + footer(c['wa_es'], c['wa_en']))

# NOTA: FAQ_JS y CSS_EXTRA ya están dentro de js/landing.js y css/landing.css.
# Se conservan aquí solo como referencia histórica.
FAQ_JS = '''

// FAQ — acordeón accesible (click + Enter/Espacio)
document.querySelectorAll('.svc-faq-item').forEach(function (item) {
  const toggle = () => {
    const open = item.getAttribute('aria-expanded') === 'true';
    item.setAttribute('aria-expanded', open ? 'false' : 'true');
  };
  item.addEventListener('click', toggle);
  item.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});
'''

CSS_EXTRA = '''

/* FAQ — respuestas largas en móvil */
.svc-faq-item[aria-expanded="true"] .svc-faq-item__a { max-height: 460px; }
'''

def write_page(slug, html):
    os.makedirs(slug, exist_ok=True)
    io.open(f'{slug}/index.html', 'w', encoding='utf-8').write(html)
    # CSS y JS ya NO se duplican por página: todas las landings enlazan
    # /css/landing.css y /js/landing.js (ver SHARED_CSS / SHARED_JS arriba).
    print('  →', f'{slug}/index.html')

def merge_lang():
    for lang, idx in (('es', 0), ('en', 1)):
        path = f'lang/{lang}.json'
        data = json.load(io.open(path, encoding='utf-8'))
        added = 0
        for k, pair in KEYS.items():
            if k in data and data[k] != pair[idx]:
                print(f'  ⚠ {lang}.json: "{k}" ya existía con otro valor — se actualiza')
            if data.get(k) != pair[idx]:
                data[k] = pair[idx]; added += 1
        io.open(path, 'w', encoding='utf-8').write(
            json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        print(f'  ✔ lang/{lang}.json — {added} llaves escritas ({len(data)} totales)')

if __name__ == '__main__':
    for o in OFFERS:
        write_page(o['slug'], render_offer(o))
    for c in CITIES:
        write_page(c['slug'], render_city(c))
    merge_lang()
    print('\n✔ 6 páginas generadas + i18n fusionado.')
