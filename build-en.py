#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-en.py — Genera la versión inglesa REAL del sitio en /en/
────────────────────────────────────────────────────────────────
Uso:   python3 build-en.py        (requiere: pip install beautifulsoup4)

Qué hace por cada página ES:
  1. Aplica lang/en.json a todos los data-i18n / -placeholder / -aria / -alt / -select.
  2. <html lang="en">, title/description/OG/Twitter en inglés (mapa EN_META abajo).
  3. canonical + og:url → /en/…, og:locale → en_US, hreflang es/en/x-default correctos.
  4. Prefija los enlaces internos con /en (excepto /privacidad/, que solo existe en ES).
  5. Absolutiza rutas relativas (style.css, script.js) para que funcionen bajo /en/.
  6. En el home: regenera el schema FAQPage en inglés y la descripción del schema Person.
Salida: espejo completo en ./en/ — vuelve a ejecutarlo cada vez que edites textos.
"""
import json, io, os, re, posixpath, shutil
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
SITE = 'https://alexandercaro.com'

EN = json.load(io.open('lang/en.json', encoding='utf-8'))

PAGES = {
 'index.html': '/',
 'sobre-mi/index.html': '/sobre-mi/',
 'trabajo/index.html': '/trabajo/',
 'servicios/index.html': '/servicios/',
 'trabajo/orbidental/index.html': '/trabajo/orbidental/',
 'trabajo/fueggo/index.html': '/trabajo/fueggo/',
 'trabajo/la-jungla-club/index.html': '/trabajo/la-jungla-club/',
 'trabajo/rebel-street/index.html': '/trabajo/rebel-street/',
 'trabajo/acelerarte/index.html': '/trabajo/acelerarte/',
 'trabajo/pulse-digital/index.html': '/trabajo/pulse-digital/',
 'trabajo/motofaro/index.html': '/trabajo/motofaro/',
 'trabajo/social-media-dental/index.html': '/trabajo/social-media-dental/',
 'servicios/diseno-web/index.html': '/servicios/diseno-web/',
 'servicios/identidad-visual/index.html': '/servicios/identidad-visual/',
 'servicios/diseno-grafico-freelance/index.html': '/servicios/diseno-grafico-freelance/',
 'servicios/fotografia-de-producto/index.html': '/servicios/fotografia-de-producto/',
 'servicios/web-express/index.html': '/servicios/web-express/',
 'servicios/auditoria-seo-geo/index.html': '/servicios/auditoria-seo-geo/',
 'servicios/plan-mensual/index.html': '/servicios/plan-mensual/',
 'diseno-web-miami/index.html': '/diseno-web-miami/',
 'diseno-web-houston/index.html': '/diseno-web-houston/',
 'diseno-web-los-angeles/index.html': '/diseno-web-los-angeles/',
}

EN_META = {
 '/': ('Alexander Caro | Freelance Web Designer & Developer — Fast, Custom Websites',
       EN.get('meta.description', 'Freelance web designer and developer in Bogotá. Fast, custom websites for businesses in Latin America, the US and Europe. PageSpeed 97. Free consultation.')),
 '/sobre-mi/': ('About Me — Freelance Designer & Developer | Alexander Caro',
       'Designer, developer and visual strategist based in Bogotá. You work directly with me — design, code and strategy in one person, no middlemen.'),
 '/trabajo/': ('Selected Work — Real Results, Not Just Pretty Design | Alexander Caro',
       'From PageSpeed 40 to 97. Brand identities people recognize instantly. Every project here started with a real problem — see what happened next.'),
 '/servicios/': ('Services & Fixed-Price Packages — Web, SEO + GEO & Design | Alexander Caro',
       'Three fixed-price packages: website in 14 days ($800), SEO + GEO Audit ($400) and Monthly plan ($600/mo). Plus custom web design, branding and product photography.'),
 '/trabajo/orbidental/': ('Orbidental — From 14 Seconds to Near-Instant: PageSpeed 97 | Alexander Caro',
       'Real case: a dental e-commerce with 3,000+ products went from 14-second loads and failing Core Web Vitals to PageSpeed 97 — without losing SEO.'),
 '/trabajo/fueggo/': ('Fueggo — Concept Identity System, From Zero to Production | Alexander Caro',
       "Self-initiated project: I built Fueggo's complete brand identity from scratch — logo, brand manual, storefront, packaging and uniforms, all production-ready."),
 '/trabajo/la-jungla-club/': ('La Jungla Club — An Identity No Competitor Has | Alexander Caro',
       'In an area where every nightclub competes on name alone, I built La Jungla Club a visual identity that owns the jungle concept end to end.'),
 '/trabajo/rebel-street/': ("Rebel Street — When a Canva Logo Isn't Enough | Alexander Caro",
       'How I built a complete graffiti-style identity system for a streetwear brand — from a generic logo to a recognizable urban brand.'),
 '/trabajo/acelerarte/': ('AcelerArte — Sports Design for Motorcycle Racing | Alexander Caro',
       'AcelerArte: race flyers and visual content for Colombian motorcycle racing — my own sports-design project with a real audience.'),
 '/trabajo/pulse-digital/': ('Pulse Digital — Web Design for the International Market | Alexander Caro',
       'How I built the identity and landing page for Pulse Digital from scratch — a self-initiated concept aimed at English-speaking clients.'),
 '/trabajo/motofaro/': ('MotoFaro — Motorcycle Gear Comparison Engine with Technical SEO | Alexander Caro',
       "Self-initiated project: I built MotoFaro from scratch — a motorcycle-gear comparison engine in Next.js with an SEO-first architecture, PageSpeed 99 and technical SEO 100/100."),
 '/trabajo/social-media-dental/': ('Dental Social Media — Content That Sells | Alexander Caro',
       'Social media design for the dental sector: carousels, posts and stories with a consistent visual system that turns views into conversations.'),
 '/servicios/diseno-web/': ('Web Design & Development — Fast, Custom Websites | Alexander Caro',
       'Professional web design, fully custom-coded. Fast, responsive and SEO-optimized — PageSpeed 97 on real projects. Redesign or from scratch. Free consultation.'),
 '/servicios/identidad-visual/': ('Visual Identity & Branding — Brand Design | Alexander Caro',
       'Visual identity and branding for businesses in Colombia, LATAM, the US and Europe. Logo, brand manual and real applications. Remote and direct — projects from $500 USD.'),
 '/servicios/diseno-grafico-freelance/': ('Freelance Graphic Design — Social Media & Visual Assets | Alexander Caro',
       'Freelance graphic design for businesses: social media content, print material and corporate pieces. Remote, working directly with you. From $500 USD.'),
 '/servicios/fotografia-de-producto/': ('Product Photography — E-commerce & Catalogs | Alexander Caro',
       'Professional product photography for e-commerce and catalogs — clean, consistent, conversion-focused images. Based in Bogotá, available remotely.'),
 '/servicios/web-express/': ('Web Express — Professional Website in 14 Days for $800 | Alexander Caro',
       'A professional website of up to 5 pages, delivered in 14 days. Fixed price: $800 USD. Custom design, clean code, technical SEO and 90+ PageSpeed. US, LATAM and Europe.'),
 '/servicios/auditoria-seo-geo/': ('SEO + GEO Audit — Your Visibility on Google and in AI, $400 | Alexander Caro',
       'Technical SEO, content and GEO audit: find out whether ChatGPT and Google AI answers cite your business. Report + 90-day plan + call. $400 USD, in 10 business days.'),
 '/servicios/plan-mensual/': ('Monthly Design & Web Plan — $600/month, No Lock-In | Alexander Caro',
       'Social media design, campaign assets and website improvements every month, with replies within 24 business hours. $600/month, month to month, pause anytime.'),
 '/diseno-web-miami/': ('Spanish-Speaking Web Designer for Miami Businesses | Alexander Caro',
       'Professional websites in Spanish (and English) for Hispanic-owned businesses in Miami, Doral, Hialeah and Kendall. Fixed prices from $800, direct communication.'),
 '/diseno-web-houston/': ('Spanish-Speaking Web Designer for Houston Businesses | Alexander Caro',
       'Professional websites in Spanish (and English) for Hispanic-owned businesses in Houston: construction, auto shops, restaurants and more. Fixed prices from $800.'),
 '/diseno-web-los-angeles/': ('Spanish-Speaking Web Designer for Los Angeles Businesses | Alexander Caro',
       'Professional websites in Spanish (and English) for Hispanic-owned businesses in Los Angeles: restaurants, home services, shops and more. Fixed prices from $800.'),
}

PERSON_DESC_EN = ('Freelance web designer and frontend developer based in Bogotá. '
                  'Specialized in professional websites, visual identity, digital ads '
                  'and product photography for businesses in Colombia, Latin America, '
                  'the US and Europe.')

JOB_TITLE_EN = 'Freelance Web Designer & Frontend Developer'

# Schemas de las páginas nuevas (ofertas + ciudades): (Service.name, Service.description, breadcrumb)
NEW_SCHEMA_EN = {
 '/servicios/web-express/': (
   'Web Express — Professional website in 14 days',
   'Fixed-price web design and development package: an up-to-5-page custom site in clean code, with technical SEO and speed optimization. Delivered 14 days after content is received. $800 USD.',
   'Web Express'),
 '/servicios/auditoria-seo-geo/': (
   'SEO + GEO Audit — visibility on Google and AI engines',
   'Manual audit of technical SEO, content and GEO (Generative Engine Optimization): visibility diagnosis across Google, ChatGPT, Gemini and AI Overviews, with a prioritized 90-day action plan, video summary and a 45-minute call. $400 USD, delivered in 10 business days.',
   'SEO + GEO Audit'),
 '/servicios/plan-mensual/': (
   'Monthly design and web development plan',
   'Monthly design and development subscription: social media assets, campaign material and ongoing website improvements, with replies within 24 business hours. $600 per month, no lock-in contracts.',
   'Monthly plan'),
 '/diseno-web-miami/': (
   'Spanish-language web design for Miami businesses',
   'Professional web design and development in Spanish for Hispanic-owned businesses in Miami, Florida: restaurants, clinics, real estate and services. Remote work with fixed pricing, English invoices and direct communication in Spanish.',
   'Web design in Miami'),
 '/diseno-web-houston/': (
   'Spanish-language web design for Houston businesses',
   'Professional web design and development in Spanish for Hispanic-owned businesses in Houston, Texas: construction, auto shops, restaurants, transport and services. Remote work with fixed pricing, English invoices and direct communication in Spanish.',
   'Web design in Houston'),
 '/diseno-web-los-angeles/': (
   'Spanish-language web design for Los Angeles businesses',
   'Professional web design and development in Spanish for Hispanic-owned businesses in Los Angeles, California: restaurants, home services, shops and creatives. Remote work with fixed pricing, English invoices and direct communication in Spanish.',
   'Web design in Los Angeles'),
}

# Prefijo i18n y nº de preguntas del FAQPage de cada página nueva
FAQ_I18N = {
 '/servicios/web-express/': ('wx', 5),
 '/servicios/auditoria-seo-geo/': ('ag', 5),
 '/servicios/plan-mensual/': ('pm', 5),
 '/diseno-web-miami/': ('mia', 5),
 '/diseno-web-houston/': ('hou', 5),
 '/diseno-web-los-angeles/': ('lax', 5),
}

def frag(html):
    return BeautifulSoup(html, 'html.parser')

def absolutize(val, page_dir):
    """style.css → /<dir>/style.css   ·   ../nav.js → /nav.js"""
    if not val or val.startswith(('/', 'http', '#', 'mailto:', 'tel:', 'data:')):
        return val
    return posixpath.normpath(posixpath.join('/', page_dir, val))

def en_href(href):
    """Prefija enlaces internos con /en (privacidad se queda en ES)."""
    if not href or not href.startswith('/') or href.startswith('//'):
        return href
    if href.startswith('/en/') or href == '/en':
        return href
    if href.startswith('/privacidad'):
        return href
    last = href.split('#')[0].rstrip('/').split('/')[-1]
    if '.' in last:                      # archivos (css, js, webp…) no se prefijan
        return href
    return '/en' + ('/' if href == '/' else href)

def build(rel, url):
    src = io.open(rel, encoding='utf-8').read()
    soup = BeautifulSoup(src, 'html.parser')
    page_dir = posixpath.dirname(rel)

    # Guardián: si una fuente ES ya tiene lang="en" es que un build EN la
    # sobrescribió (pasó en jul-2026 y auto-desindexó /servicios/*). Abortamos.
    if (soup.html.get('lang') or 'es').lower().startswith('en'):
        raise SystemExit(f'✗ {rel} tiene lang="en" — la fuente ES fue sobrescrita. '
                         f'Corre "python3 restore-es.py" antes de compilar.')

    # 1 ── traducciones
    for el in soup.select('[data-i18n]'):
        k = el.get('data-i18n')
        if k in EN and not isinstance(EN[k], list):
            val = str(EN[k])
            el.clear()
            if val:
                for node in list(frag(val).contents):
                    el.append(node.extract() if hasattr(node, 'extract') else node)
    for el in soup.select('[data-i18n-select]'):
        opts = EN.get(el.get('data-i18n-select'))
        if isinstance(opts, list):
            el.clear()
            for i, o in enumerate(opts):
                tag = soup.new_tag('option', value=o['value'])
                tag.string = o['label']
                if i == 0:
                    tag['disabled'] = ''; tag['selected'] = ''
                el.append(tag)
    for attr, dattr in (('placeholder','data-i18n-placeholder'),
                        ('aria-label','data-i18n-aria'), ('alt','data-i18n-alt')):
        for el in soup.select(f'[{dattr}]'):
            k = el.get(dattr)
            if k in EN: el[attr] = EN[k]

    # 2 ── metadatos
    soup.html['lang'] = 'en'
    title, desc = EN_META[url]
    if soup.title: soup.title.string = title
    def set_meta(sel, val):
        m = soup.select_one(sel)
        if m: m['content'] = val
    set_meta('meta[name="description"]', desc)
    set_meta('meta[property="og:title"]', title)
    set_meta('meta[property="og:description"]', desc)
    set_meta('meta[name="twitter:title"]', title)
    set_meta('meta[name="twitter:description"]', desc)
    set_meta('meta[property="og:locale"]', 'en_US')
    set_meta('meta[property="og:url"]', SITE + '/en' + url)

    # 3 ── canonical + hreflang
    for l in soup.select('link[rel="alternate"][hreflang]'):
        l.decompose()
    can = soup.select_one('link[rel="canonical"]')
    if can: can['href'] = SITE + '/en' + url
    head = soup.head
    anchor = can or soup.title
    for hl, hu in (('es', SITE + url), ('en', SITE + '/en' + url), ('x-default', SITE + url)):
        tag = soup.new_tag('link', rel='alternate', href=hu)
        tag['hreflang'] = hl
        anchor.insert_after(tag); anchor = tag

    # 4 ── enlaces internos → /en
    for a in soup.find_all('a', href=True):
        a['href'] = en_href(a['href'])

    # 5 ── rutas relativas → absolutas
    for tag, attr in (('link','href'), ('script','src'), ('img','src'), ('source','src')):
        for el in soup.find_all(tag):
            if el.get(attr): el[attr] = absolutize(el[attr], page_dir)

    # 6 ── schemas del home en inglés
    if url == '/':
        for sc in soup.find_all('script', type='application/ld+json'):
            txt = sc.string or ''
            if '"FAQPage"' in txt:
                data = {"@context": "https://schema.org", "@type": "FAQPage",
                        "mainEntity": [
                          {"@type": "Question", "name": EN[f'faq.0{i}.q'],
                           "acceptedAnswer": {"@type": "Answer",
                             "text": re.sub('<[^>]+>', '', EN[f'faq.0{i}.a'])}}
                          for i in range(1, 9)]}
                sc.string = '\n  ' + json.dumps(data, ensure_ascii=False, indent=2) + '\n  '
            elif '"Person"' in txt:
                try:
                    data = json.loads(txt)
                    data['description'] = PERSON_DESC_EN
                    data['jobTitle'] = 'Freelance Web Designer & Frontend Developer'
                    sc.string = '\n  ' + json.dumps(data, ensure_ascii=False, indent=2) + '\n  '
                except Exception:
                    pass

    # 6b ── schemas de ofertas y ciudades en inglés
    if url in NEW_SCHEMA_EN:
        name_en, desc_en, crumb_en = NEW_SCHEMA_EN[url]
        pfx, nfaq = FAQ_I18N[url]
        for sc in soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(sc.string or '')
            except Exception:
                continue
            graph = data.get('@graph')
            if not graph:
                continue
            for node in graph:
                t = node.get('@type')
                if t == 'Service':
                    node['name'] = name_en
                    node['description'] = desc_en
                    node['url'] = SITE + '/en' + url
                    if node.get('serviceType') == 'Diseño y desarrollo web':
                        node['serviceType'] = 'Web design and development'
                    ch = node.get('availableChannel')
                    if ch:
                        ch['serviceUrl'] = SITE + '/en' + url
                    off = node.get('offers')
                    if off and off.get('url'):
                        off['url'] = SITE + '/en' + url
                    prov = node.get('provider')
                    if prov and prov.get('jobTitle'):
                        prov['jobTitle'] = JOB_TITLE_EN
                elif t == 'FAQPage':
                    node['mainEntity'] = [
                        {"@type": "Question", "name": EN[f'{pfx}.faq.{i}.q'],
                         "acceptedAnswer": {"@type": "Answer",
                            "text": re.sub('<[^>]+>', '', EN[f'{pfx}.faq.{i}.a'])}}
                        for i in range(1, nfaq + 1)]
                elif t == 'BreadcrumbList':
                    for item in node.get('itemListElement', []):
                        nm = item.get('name')
                        if nm == 'Inicio':
                            item['name'] = 'Home'
                        elif nm == 'Servicios':
                            item['name'] = 'Services'
                        else:
                            item['name'] = crumb_en
                        u = item.get('item', '')
                        if u.startswith(SITE) and not u.startswith(SITE + '/en'):
                            item['item'] = SITE + '/en' + u[len(SITE):]
            sc.string = '\n  ' + json.dumps(data, ensure_ascii=False, indent=2) + '\n  '

    out = posixpath.join('en', rel)
    os.makedirs(posixpath.dirname(out) or 'en', exist_ok=True)
    io.open(out, 'w', encoding='utf-8').write(str(soup))
    return out

if __name__ == '__main__':
    if os.path.isdir('en'):
        shutil.rmtree('en')
    for rel, url in PAGES.items():
        print('  →', build(rel, url))
    print(f'\n✔ Versión EN generada: {len(PAGES)} páginas en /en/')
