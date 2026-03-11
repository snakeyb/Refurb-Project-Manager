#!/usr/bin/env python3
import json
import sys

def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <existing_file> <overlay_file>", file=sys.stderr)
        sys.exit(1)

    existing_path = sys.argv[1]
    overlay_path = sys.argv[2]

    try:
        with open(existing_path, 'r') as f:
            existing = json.load(f)
    except FileNotFoundError:
        existing = []

    with open(overlay_path, 'r') as f:
        overlay = json.load(f)

    if not isinstance(existing, list):
        existing = []
    if not isinstance(overlay, list):
        overlay = []

    existing_routes = {r.get('route', '') + ':' + r.get('method', '') for r in existing}

    for route in overlay:
        key = route.get('route', '') + ':' + route.get('method', '')
        if key not in existing_routes:
            existing.append(route)
            existing_routes.add(key)

    with open(existing_path, 'w') as f:
        json.dump(existing, f, indent=4, ensure_ascii=False)
        f.write('\n')

if __name__ == '__main__':
    main()
