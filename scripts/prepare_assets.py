"""Create publishable WebP copies from the supplied N|B ZIP.

Requires Pillow. The ZIP is read only. Private contact, tracking, customer,
and payment values are covered before encoding and never shipped with the site.
"""
from io import BytesIO
from pathlib import Path
import sys
import zipfile

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ZIP = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / "Porfolio NyB.zip"
OUTPUT = ROOT / "public" / "assets" / "nib"

FILES = {
    "Desktop/inicio Desktop.png": "home-desktop.webp",
    "Mobile/Inicio Mobile.png": "home-mobile.webp",
    "Desktop/Destacados.png": "colecciones-desktop.webp",
    "Mobile/Productos.png": "productos-mobile.webp",
    "Desktop/Vista de Producto.png": "producto-desktop.webp",
    "Desktop/Carrito minimalista de moda N_B.png": "carrito-desktop.webp",
    "Desktop/Campos para Rellenar.png": "checkout-desktop.webp",
    "Desktop/Checkout de Mercado Pago en español.png": "mercado-pago-desktop.webp",
    "Desktop/Estado de Envio del Producto.png": "seguimiento-desktop.webp",
    "Mobile/Estado de Envio Mobile.png": "seguimiento-mobile.webp",
    "Mobile/Inicio de sesión Administración N_B.png": "admin-login-mobile.webp",
    "Desktop/Panel Administrativo.png": "admin-dashboard-desktop.webp",
    "Mobile/Panel oscuro de analítica N_B Indumentary.png": "admin-dashboard-mobile.webp",
}


def mask_checkout(image):
    # Values visible in the provided screenshot. Preserve labels and input UI.
    draw = ImageDraw.Draw(image)
    areas = [
        (130, 300, 480, 338),  # name
        (600, 300, 990, 338),  # email
        (130, 388, 590, 426),  # phone
        (130, 604, 530, 642),  # street
        (130, 692, 470, 730),  # floor/apartment
        (600, 692, 910, 730),  # postal code
    ]
    for area in areas:
        draw.rectangle(area, fill="#f9f9f9")


def mask_private_values(image, name):
    # Coordinates belong to the resized supplied screenshots, not the originals.
    # Opaque fills use adjacent UI backgrounds; no replacement data is invented.
    masks = {
        "admin-dashboard-desktop.webp": (
            (1600, 787),
            [
                ((293, top, 884, bottom), (887, top + 5))
                for top, bottom in [(459, 484), (497, 521), (536, 559),
                                    (574, 598), (612, 637)]
            ] + [((1093, 466, 1380, 492), (1393, 480))],
        ),
        "seguimiento-desktop.webp": (
            (1600, 785),
            [
                ((238, 100, 326, 120), (328, 110)),  # order identifier
                ((301, 340, 385, 358), (395, 349)),  # repeated identifier
                ((923, 703, 1093, 721), (1130, 713)),  # external tracking
                ((922, 738, 1120, 784), (1130, 751)),  # delivery address
            ],
        ),
        "mercado-pago-desktop.webp": (
            (1600, 784),
            [
                ((335, 269, 454, 293), (460, 280)),  # account balance
                ((1317, 289, 1356, 315), (1297, 303)),  # example payment
                ((1317, 369, 1356, 394), (1297, 382)),
            ],
        ),
    }
    if name not in masks:
        return
    expected_size, areas = masks[name]
    if image.size != expected_size:
        raise SystemExit(f"Review privacy masks for changed screenshot: {name}")
    draw = ImageDraw.Draw(image)
    for area, sample in areas:
        draw.rectangle(area, fill=image.getpixel(sample))


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ZIP) as archive:
        for source, name in FILES.items():
            entry = next((item for item in archive.namelist() if item.endswith(source)), None)
            if entry is None:
                raise SystemExit(f"Missing expected screenshot: {source}")
            image = Image.open(BytesIO(archive.read(entry))).convert("RGB")
            if name == "checkout-desktop.webp":
                mask_checkout(image)
            max_width = 1600 if "desktop" in name else 760
            if image.width > max_width:
                image.thumbnail((max_width, 2200), Image.Resampling.LANCZOS)
            mask_private_values(image, name)
            target = OUTPUT / name
            image.save(target, "WEBP", quality=86, method=6)
            print(f"{name}: {image.width}x{image.height}, {target.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
