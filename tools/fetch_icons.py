import os, io, requests
from PIL import Image
import cairosvg

OUT_DIR = "public/images/heo"
os.makedirs(OUT_DIR, exist_ok=True)

icons = {
    "docker": "https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png",
    "github": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    "obsidian": "https://obsidian.md/images/obsidian-logo-gradient.svg",
    "openai": "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    "copilot": "https://github.githubassets.com/images/modules/site/copilot/copilot.png",
    "ubuntu": "https://assets.ubuntu.com/v1/29985a98-ubuntu-logo32.png",
    "cplusplus": "https://isocpp.org/assets/images/cpp_logo.png"
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
}

def save_webp_from_svg(svg_bytes, out_path, size=128):
    png_bytes = cairosvg.svg2png(bytestring=svg_bytes, output_width=size, output_height=size)
    im = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    im.save(out_path, "WEBP")

def save_webp_from_raster(r_bytes, out_path, size=128):
    im = Image.open(io.BytesIO(r_bytes)).convert("RGBA")
    im = im.resize((size, size), Image.LANCZOS)
    im.save(out_path, "WEBP")

for name, url in icons.items():
    print(f">> {name} {url}")
    r = requests.get(url, timeout=20, headers=HEADERS)
    r.raise_for_status()
    out = os.path.join(OUT_DIR, f"{name}.webp")
    if url.lower().endswith(".svg"):
        save_webp_from_svg(r.content, out)
    else:
        save_webp_from_raster(r.content, out)
    print("saved:", out)

print("✅ All icons saved to", OUT_DIR)
