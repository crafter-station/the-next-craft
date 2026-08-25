import sys
from collections import deque

from PIL import Image


def connected_background_mask(image: Image.Image) -> bytearray:
    width, height = image.size
    pixels = image.load()
    corner_size = max(1, min(width, height) // 32)
    samples = []

    for left, top in (
        (0, 0),
        (width - corner_size, 0),
        (0, height - corner_size),
        (width - corner_size, height - corner_size),
    ):
        for y in range(top, top + corner_size):
            for x in range(left, left + corner_size):
                samples.append(pixels[x, y][:3])

    samples.sort()
    background = samples[len(samples) // 2]
    tolerance = 36

    def matches_background(x: int, y: int) -> bool:
        red, green, blue = pixels[x, y][:3]
        return (
            abs(red - background[0]) <= tolerance
            and abs(green - background[1]) <= tolerance
            and abs(blue - background[2]) <= tolerance
        )

    mask = bytearray(width * height)
    queue = deque()
    for x, y in (
        (0, 0),
        (width - 1, 0),
        (0, height - 1),
        (width - 1, height - 1),
    ):
        if matches_background(x, y):
            mask[y * width + x] = 1
            queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for next_x, next_y in (
            (x - 1, y),
            (x + 1, y),
            (x, y - 1),
            (x, y + 1),
        ):
            if not (0 <= next_x < width and 0 <= next_y < height):
                continue
            index = next_y * width + next_x
            if mask[index] or not matches_background(next_x, next_y):
                continue
            mask[index] = 1
            queue.append((next_x, next_y))

    return mask


def remove_green_background(input_path: str, output_path: str) -> None:
    image = Image.open(input_path).convert("RGBA")
    output = Image.new("RGBA", image.size)
    pixels = list(image.getdata())
    green_pixels = sum(
        1
        for red, green, blue, _alpha in pixels
        if green >= 128 and green >= red + 40 and green >= blue + 40
    )
    fallback_mask = (
        connected_background_mask(image)
        if green_pixels < len(pixels) // 10
        else None
    )

    cleaned_pixels = []
    for index, (red, green, blue, _alpha) in enumerate(pixels):
        is_chroma_green = (
            green >= 128 and green >= red + 40 and green >= blue + 40
        )
        if is_chroma_green or (fallback_mask is not None and fallback_mask[index]):
            cleaned_pixels.append((0, 0, 0, 0))
            continue

        gray = (red * 299 + green * 587 + blue * 114) // 1000
        cleaned_pixels.append((gray, gray, gray, 255))

    output.putdata(cleaned_pixels)
    output.save(output_path, format="PNG", optimize=False)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(
            "Usage: remove_green_background.py <input-image> <output-png>"
        )

    remove_green_background(sys.argv[1], sys.argv[2])
