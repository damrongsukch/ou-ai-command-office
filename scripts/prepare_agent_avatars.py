from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "office-agents"


def is_background(pixel):
    r, g, b, a = pixel
    return a > 0 and r > 238 and g > 238 and b > 238 and max(r, g, b) - min(r, g, b) < 18


def remove_edge_background(path):
    image = Image.open(path).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    queue = deque()
    seen = set()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or x < 0 or y < 0 or x >= width or y >= height:
            continue
        seen.add((x, y))
        if not is_background(pixels[x, y]):
            continue
        pixels[x, y] = (255, 255, 255, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    image.save(path)


def main():
    for file in sorted(ASSET_DIR.glob("*.png")):
        remove_edge_background(file)
        print(f"prepared {file.name}")


if __name__ == "__main__":
    main()
