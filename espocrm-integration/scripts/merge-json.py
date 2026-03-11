#!/usr/bin/env python3
import json
import sys
import copy

def deep_merge(base, overlay):
    result = copy.deepcopy(base)
    for key, value in overlay.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        elif key in result and isinstance(result[key], list) and isinstance(value, list):
            existing = result[key]
            for item in value:
                if item not in existing:
                    existing.append(item)
            result[key] = existing
        else:
            result[key] = copy.deepcopy(value)
    return result

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
        existing = {}

    with open(overlay_path, 'r') as f:
        overlay = json.load(f)

    merged = deep_merge(existing, overlay)

    with open(existing_path, 'w') as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
        f.write('\n')

if __name__ == '__main__':
    main()
