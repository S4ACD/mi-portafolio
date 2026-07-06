#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
restore-es.py — Repara las páginas ES de /servicios/ que fueron
sobrescritas por el build EN (lang="en", canonical → /en/…).
Reaplica lang/es.json, restaura metadatos ES y des-prefija los enlaces /en.
Uso: python3 restore-es.py
"""
import json, io, posixpath
from bs4 import BeautifulSoup

SITE = 'https://alexandercaro.com'
ES = json.load(io.open('lang/es.json', encoding='utf-8'))

PAGES = {
 'servicios/diseno-web/index.html': '/servicios/diseno-web/',
 'servicios/identidad-visual/index.html': '/servicios/identidad-visual/',
 'servicios/diseno-grafico-freelance/index.html': '/servicios/diseno-grafico-freelance/',
 'servicios/fotografia-de-producto/index.html': '/servicios/fotografia-de-producto/',
}

ES_META = {
 '/servicios/diseno-web/': (
   'Diseño y Desarrollo Web — Sitios Rápidos y a Medida | Alexander Caro',
   'Diseño web profesional 100% a medida. Rápido, responsive y optimizado para SEO — PageSpeed 97 en proyectos reales. Rediseño o desde cero. Cotización gratis.'),
 '/servicios/identidad-visual/': (
   'Identidad Visual y Branding — Diseño de Marca | Alexander Caro',
   'Identidad visual y branding para negocios en Colombia, LATAM, EE. UU. y Europa. Logo, manual de marca y aplicaciones reales. Remoto y directo — proyectos desde 500 USD.'),
 '/servicios/diseno-grafico-freelance/': (
   'Diseño Gráfico Freelance — Social Media y Piezas Visuales | Alexander Caro',
   'Diseño gráfico freelance para negocios: contenido para redes, material impreso y piezas corporativas. Remoto y directo, sin intermediarios. Desde 500 USD.'),
 '/servicios/fotografia-de-producto/': (
   'Fotografía de Producto — E-commerce y Catálogos | Alexander Caro',
   'Fotografía de producto profesional para e-commerce y catálogos — imágenes limpias, consistentes y enfocadas en conversión. En Bogotá y disponible remoto.'),
}

def frag(html):
    return BeautifulSoup(html, 'html.parser')

def es_href(href):
    """Quita el prefijo /en de los enlaces internos."""
    if not href or not href.startswith('/'):
        return href
    if href == '/en' or href == '/en/':
        return '/'
    if href.startswith('/en/'):
        return href[3:]
    return href

def restore(rel, url):
    soup = BeautifulSoup(io.open(rel, encoding='utf-8').read(), 'html.parser')

    # 1 ── reaplicar textos ES
    for el in soup.select('[data-i18n]'):
        k = el.get('data-i18n')
        if k in ES and not isinstance(ES[k], list):
            val = str(ES[k])
            el.clear()
            if val:
                for node in list(frag(val).contents):
                    el.append(node.extract() if hasattr(node, 'extract') else node)
    for attr, dattr in (('placeholder','data-i18n-placeholder'),
                        ('aria-label','data-i18n-aria'), ('alt','data-i18n-alt')):
        for el in soup.select(f'[{dattr}]'):
            k = el.get(dattr)
            if k in ES: el[attr] = ES[k]

    # 2 ── metadatos ES
    soup.html['lang'] = 'es'
    title, desc = ES_META[url]
    if soup.title: soup.title.string = title
    def set_meta(sel, val):
        m = soup.select_one(sel)
        if m: m['content'] = val
    set_meta('meta[name="description"]', desc)
    set_meta('meta[property="og:title"]', title)
    set_meta('meta[property="og:description"]', desc)
    set_meta('meta[name="twitter:title"]', title)
    set_meta('meta[name="twitter:description"]', desc)
    set_meta('meta[property="og:locale"]', 'es_CO')
    set_meta('meta[property="og:url"]', SITE + url)

    # 3 ── canonical + hreflang (triple correcto)
    for l in soup.select('link[rel="alternate"][hreflang]'):
        l.decompose()
    can = soup.select_one('link[rel="canonical"]')
    if can: can['href'] = SITE + url
    anchor = can or soup.title
    for hl, hu in (('es', SITE + url), ('en', SITE + '/en' + url), ('x-default', SITE + url)):
        tag = soup.new_tag('link', rel='alternate', href=hu)
        tag['hreflang'] = hl
        anchor.insert_after(tag); anchor = tag

    # 4 ── enlaces internos sin /en
    for a in soup.find_all('a', href=True):
        a['href'] = es_href(a['href'])

    io.open(rel, 'w', encoding='utf-8').write(str(soup))
    return rel

if __name__ == '__main__':
    for rel, url in PAGES.items():
        print('  ✔ restaurado', restore(rel, url))
    print('\nListo. Verifica lang/canonical y vuelve a correr build-en.py.')
