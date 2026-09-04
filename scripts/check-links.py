#!/usr/bin/env python3
"""Check every internal href/src in the site resolves against the files git tracks,
matching case exactly.

Windows and macOS checkouts are case-insensitive, so a reference like
images/sugarloafbay.jpg looks fine locally while Cloudflare Pages, which serves
case-sensitively, returns 404. This catches that before it ships.
"""
import glob
import io
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = re.compile(r'(?:src|href)="(?!https?:|mailto:|#|//|javascript:)([^"#?]+)')


def main():
    os.chdir(ROOT)
    listing = subprocess.run(["git", "ls-files"], capture_output=True, text=True, check=True)
    tracked = {line.strip().replace(os.sep, "/") for line in listing.stdout.splitlines() if line.strip()}

    broken = []
    pages = sorted(glob.glob("*.htm")) + sorted(glob.glob("*.html"))
    for page in pages:
        text = io.open(page, encoding="utf-8", errors="surrogateescape").read()
        for match in REF.finditer(text):
            target = match.group(1).strip().lstrip("./")
            if not target or target in tracked:
                continue
            broken.append((page, match.group(1).strip()))

    if broken:
        print("Broken internal references (%d):" % len(broken))
        for page, target in broken:
            print("  %s -> %s" % (page, target))
        return 1

    print("OK: every internal reference in %d pages resolves with exact case." % len(pages))
    return 0


if __name__ == "__main__":
    sys.exit(main())
