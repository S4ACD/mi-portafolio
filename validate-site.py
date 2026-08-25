#!/usr/bin/env python3
"""Fast static checks for the portfolio before deployment."""
import json
import os
import posixpath
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.html_lang = ""
        self.title = ""
        self.in_title = False
        self.h1_count = 0
        self.canonical_count = 0
        self.hreflang_count = 0
        self.local_refs = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.html_lang = attrs.get("lang", "")
        elif tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "link":
            if "canonical" in (attrs.get("rel") or "").split():
                self.canonical_count += 1
            if attrs.get("hreflang"):
                self.hreflang_count += 1
        for attr in ("href", "src"):
            value = attrs.get(attr, "")
            if value and not urlsplit(value).scheme and not value.startswith(("//", "#", "data:", "mailto:", "tel:")):
                self.local_refs.append(value.split("#", 1)[0].split("?", 1)[0])

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


# El stub de verificación de Search Console no es una página del sitio:
# no debe tener <title> ni <h1>, así que auditarlo era un falso positivo.
SKIP = ("google",)


def html_files():
    for directory, _, names in os.walk(ROOT):
        for name in names:
            if name.endswith(".html") and not name.startswith(SKIP):
                yield os.path.join(directory, name)


def resolve_ref(page, ref):
    if ref.startswith("/"):
        return os.path.join(ROOT, ref.lstrip("/\\").replace("/", os.sep))
    return os.path.normpath(os.path.join(os.path.dirname(page), ref))


def check_pages():
    errors = []
    for page in html_files():
        parser = PageParser()
        with open(page, encoding="utf-8") as handle:
            parser.feed(handle.read())
        relative = os.path.relpath(page, ROOT).replace(os.sep, "/")
        if not parser.html_lang:
            errors.append(f"{relative}: missing html lang")
        if not parser.title.strip():
            errors.append(f"{relative}: missing title")
        if parser.h1_count != 1:
            errors.append(f"{relative}: expected 1 h1, found {parser.h1_count}")
        if relative not in ("404.html", "privacidad/index.html", "trabajo/pulse-digital/site/index.html"):
            if parser.canonical_count != 1:
                errors.append(f"{relative}: expected 1 canonical, found {parser.canonical_count}")
            if parser.hreflang_count not in (0, 3):
                errors.append(f"{relative}: expected 0 or 3 hreflang links, found {parser.hreflang_count}")
        for ref in parser.local_refs:
            if not ref or ref.endswith("/") or ref.startswith("javascript:"):
                continue
            target = resolve_ref(page, ref)
            if not os.path.isfile(target) and not os.path.isfile(os.path.join(target, "index.html")):
                errors.append(f"{relative}: missing local resource {ref}")
    return errors


def main():
    errors = check_pages()
    for name in ("lang/es.json", "lang/en.json"):
        try:
            with open(os.path.join(ROOT, name), encoding="utf-8") as handle:
                json.load(handle)
        except Exception as exc:
            errors.append(f"{name}: invalid JSON ({exc})")
    try:
        ET.parse(os.path.join(ROOT, "sitemap.xml"))
    except Exception as exc:
        errors.append(f"sitemap.xml: invalid XML ({exc})")

    if errors:
        print("Site validation failed:")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print(f"Site validation passed: {sum(1 for _ in html_files())} HTML pages, JSON and sitemap OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
