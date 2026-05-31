"""
City of Truth Ministries — Member Profile Registration Form
============================================================
Requirements:
    pip install reportlab pillow numpy

Assets needed (update paths below):
    LOGO_PATH  — ministry logo PNG  (blue/gold version)
    STAMP_PATH — AUTHORISED stamp PNG (green, white background)

Run:
    python CityOfTruth_Form_Complete.py
"""

# ── Install check ────────────────────────────────────────────────────────────
import subprocess, sys
for pkg in ["reportlab", "Pillow", "numpy"]:
    try:
        __import__(pkg.lower().replace("pillow","PIL"))
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])

# ── Patch hashlib for ReportLab compatibility ─────────────────────────────────
import hashlib
_original_md5 = hashlib.md5
def _patched_md5(*args, **kwargs):
    kwargs.pop('usedforsecurity', None)
    return _original_md5(*args, **kwargs)
hashlib.md5 = _patched_md5

# ── Imports ──────────────────────────────────────────────────────────────────
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os

# ── CONFIG — update these paths ──────────────────────────────────────────────
LOGO_PATH   = "1000172131.png"       # blue/gold ministry logo
STAMP_INPUT = "1000172276.png"       # original green stamp (white bg)
STAMP_PATH  = "stamp_transparent.png"
SIG_PATH    = "signature.png"
OUTPUT_PDF  = "CityOfTruth_MemberForm.pdf"

# ── Brand Colors ─────────────────────────────────────────────────────────────
W, H      = A4
NAVY      = HexColor("#1B2A5E")
NAVY_DARK = HexColor("#0F1A3E")
GOLD      = HexColor("#C9963A")
GOLD_L    = HexColor("#E8C47A")
CREAM     = HexColor("#F9F5EE")
WHITE     = colors.white
GREEN_STM = HexColor("#1A7A3C")


# ════════════════════════════════════════════════════════════════════════════
# STEP 1 — Prepare signature image
# ════════════════════════════════════════════════════════════════════════════
def create_signature():
    """Generate cursive-style signature PNG for Shaveesh Jeshurun."""
    img_w, img_h = 700, 140
    img = Image.new('RGBA', (img_w, img_h), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    font_paths = [
        "C:\\Windows\\Fonts\\lhandw.ttf", # Lucida Handwriting
        "C:\\Windows\\Fonts\\brushsci.ttf", # Brush Script MT
        "C:\\Windows\\Fonts\\georgiai.ttf", # Georgia Italic
        "C:\\Windows\\Fonts\\timesi.ttf", # Times New Roman Italic
        "/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf" # Linux fallback
    ]
    
    font = None
    for fp in font_paths:
        try:
            font = ImageFont.truetype(fp, 72)
            break
        except:
            continue
            
    if font is None:
        font = ImageFont.load_default()

    text = "Shaveesh Jeshurun"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (img_w - tw) // 2
    y = (img_h - th) // 2 - 5

    draw.text((x, y), text, font=font, fill=(15, 100, 50, 255))

    # Underline flourish
    ux1, ux2, uy = x - 10, x + tw + 20, y + th + 8
    draw.line([(ux1, uy), (ux2, uy)], fill=(15, 100, 50, 200), width=2)
    draw.arc([ux2 - 8, uy - 6, ux2 + 8, uy + 6],
             270, 45, fill=(15, 100, 50, 180), width=2)

    img.save(SIG_PATH)
    print(f"  [OK] Signature saved -> {SIG_PATH}")


# ════════════════════════════════════════════════════════════════════════════
# STEP 2 — Make stamp background transparent
# ════════════════════════════════════════════════════════════════════════════
def prepare_stamp():
    """Remove white background from stamp PNG."""
    if not os.path.exists(STAMP_INPUT):
        print(f"  [WARN] Stamp file not found: {STAMP_INPUT}")
        return
    img  = Image.open(STAMP_INPUT).convert('RGBA')
    data = np.array(img)
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    data[(r > 220) & (g > 220) & (b > 220), 3] = 0
    Image.fromarray(data).save(STAMP_PATH)
    print(f"  [OK] Transparent stamp saved -> {STAMP_PATH}")


# ════════════════════════════════════════════════════════════════════════════
# PDF HELPERS
# ════════════════════════════════════════════════════════════════════════════
def draw_bg(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    # Navy top band
    c.setFillColor(NAVY_DARK)
    c.rect(0, H - 58*mm, W, 58*mm, fill=1, stroke=0)
    # Gold accent stripe
    c.setFillColor(GOLD)
    c.rect(0, H - 61*mm, W, 3*mm, fill=1, stroke=0)
    # Side border lines
    for x in [10*mm, W - 10*mm]:
        c.setStrokeColor(HexColor("#D4C4A0"))
        c.setLineWidth(0.4)
        c.line(x, 28*mm, x, H - 64*mm)
    # Navy footer
    c.setFillColor(NAVY_DARK)
    c.rect(0, 0, W, 24*mm, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, 24*mm, W, 2*mm, fill=1, stroke=0)


def draw_header(c):
    try:
        c.drawImage(LOGO_PATH, 13*mm, H - 56*mm,
                    width=40*mm, height=40*mm,
                    mask='auto', preserveAspectRatio=True)
    except:
        pass

    tx = 58*mm
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(tx, H - 24*mm, "CITY OF TRUTH MINISTRIES")

    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(tx, H - 32*mm, "BUILDING DISCIPLESHIP")

    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(tx, H - 35.5*mm, W - 13*mm, H - 35.5*mm)

    c.setFillColor(GOLD_L)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(tx, H - 43*mm, "MEMBER PROFILE REGISTRATION FORM")

    c.setFillColor(HexColor("#AAB8D8"))
    c.setFont("Helvetica", 7.5)
    c.drawString(tx, H - 49*mm,
                 "CONFIDENTIAL  ·  LEADERSHIP REVIEW ONLY  ·  DEDICATED FOR MINISTRY USE ONLY")


def section_label(c, text, x, y):
    c.setFillColor(GOLD)
    c.rect(x, y - 1, 3, 10, fill=1, stroke=0)
    c.setFillColor(NAVY_DARK)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(x + 6, y + 1, text.upper())


def field_box(c, x, y, w, h, value="", placeholder=""):
    # Shadow
    c.setFillColor(HexColor("#D8D0C0"))
    c.roundRect(x + 1, y - 1.5, w, h, 4, fill=1, stroke=0)
    # White box
    c.setFillColor(WHITE)
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.2)
    c.roundRect(x, y, w, h, 4, fill=1, stroke=1)
    if value:
        c.setFillColor(NAVY_DARK)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(x + 5*mm, y + h / 2 - 4, value)
    elif placeholder:
        c.setFillColor(HexColor("#AAAAAA"))
        c.setFont("Helvetica-Oblique", 9)
        c.drawString(x + 5*mm, y + h / 2 - 3.5, placeholder)


def dropdown_box(c, x, y, w, h, value="", placeholder=""):
    field_box(c, x, y, w, h, value, placeholder)
    aw = 8*mm
    c.setFillColor(GOLD)
    c.roundRect(x + w - aw - 2, y + 2, aw, h - 4, 3, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(x + w - aw / 2 - 2, y + h / 2 - 4, "▾")


def divider(c, y):
    c.setStrokeColor(GOLD_L)
    c.setLineWidth(0.6)
    c.line(16*mm, y, W - 16*mm, y)


def draw_footer(c):
    c.setFillColor(GOLD_L)
    c.setFont("Helvetica-Bold", 7)
    c.drawCentredString(W / 2, 16*mm, "CITY OF TRUTH MINISTRIES  ✦  BUILDING DISCIPLESHIP")
    c.setFillColor(HexColor("#8899CC"))
    c.setFont("Helvetica", 6.5)
    c.drawCentredString(W / 2, 11*mm,
        "This form is strictly confidential · For internal ministry use only · Form Ref: COT-MPR-2025 v3.0")
    c.setFillColor(HexColor("#667799"))
    c.setFont("Helvetica", 6)
    c.drawCentredString(W / 2, 7*mm, "Dedicated for Ministry Use Only")


def draw_signature_stamp(c, x, y, fw):
    """Signature card (left) + raised stamp (right)."""
    stamp_w  = 46*mm
    sig_w    = fw - stamp_w - 6*mm
    block_h  = 30*mm

    # Signature card shadow + box
    c.setFillColor(HexColor("#D8D0C0"))
    c.roundRect(x + 1, y - 1.5, sig_w, block_h, 4, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.2)
    c.roundRect(x, y, sig_w, block_h, 4, fill=1, stroke=1)

    # Gold "AUTHORISED BY" header bar
    c.setFillColor(GOLD)
    c.rect(x, y + block_h - 9*mm, sig_w, 9*mm, fill=1, stroke=0)
    c.setFillColor(NAVY_DARK)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 4*mm, y + block_h - 6*mm, "AUTHORISED BY:")

    # Signature image
    try:
        c.drawImage(SIG_PATH, x + 3*mm, y + 8*mm,
                    width=sig_w - 6*mm, height=14*mm,
                    mask='auto', preserveAspectRatio=True)
    except:
        c.setFillColor(GREEN_STM)
        c.setFont("Helvetica-BoldOblique", 16)
        c.drawString(x + 4*mm, y + 14*mm, "Shaveesh Jeshurun")

    # Underline
    c.setStrokeColor(GREEN_STM)
    c.setLineWidth(1)
    c.line(x + 3*mm, y + 7.5*mm, x + sig_w - 3*mm, y + 7.5*mm)

    # Title text
    c.setFillColor(NAVY_DARK)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(x + 4*mm, y + 3.5*mm, "Senior Pastor  ·  City of Truth Ministries")

    # Stamp — raised 10 mm above the card top
    sx           = x + sig_w + 6*mm
    stamp_raise  = 10*mm
    sy           = y - stamp_raise
    try:
        c.drawImage(STAMP_PATH, sx, sy,
                    width=stamp_w, height=stamp_w + stamp_raise,
                    mask='auto', preserveAspectRatio=True)
    except:
        pass


# ════════════════════════════════════════════════════════════════════════════
# MAIN — Generate PDF
# ════════════════════════════════════════════════════════════════════════════
def generate_pdf():
    cv = canvas.Canvas(OUTPUT_PDF, pagesize=A4)
    draw_bg(cv)
    draw_header(cv)
    draw_footer(cv)

    ml   = 16*mm
    fw   = W - 2 * ml
    FH   = 13*mm      # field height
    LH   = 5*mm       # label height
    GAP  = 3.5*mm     # label → field gap
    VGAP = 7*mm       # field → next label gap

    y = H - 70*mm

    # 1. Denomination
    section_label(cv, "Denomination", ml, y)
    y -= LH + GAP
    dropdown_box(cv, ml, y - FH, fw, FH, "CSI (Church of South India)")
    y -= FH + VGAP

    # 2. Church Name
    section_label(cv, "Church Name", ml, y)
    y -= LH + GAP
    field_box(cv, ml, y - FH, fw, FH, placeholder="Enter your church name")
    y -= FH + VGAP

    # 3. Your Role in Ministry
    section_label(cv, "Your Role in Ministry", ml, y)
    y -= LH + GAP
    dropdown_box(cv, ml, y - FH, fw, FH, "Seeker")
    y -= FH + VGAP

    # 4. District / Zone
    section_label(cv, "District / Zone", ml, y)
    y -= LH + GAP
    dropdown_box(cv, ml, y - FH, fw, FH, placeholder="Select your district or zone")
    y -= FH + VGAP

    # 5. Brief Testimony / Bio  (taller multiline box)
    section_label(cv, "Brief Testimony / Bio", ml, y)
    y -= LH + GAP
    bio_h = 24*mm
    field_box(cv, ml, y - bio_h, fw, bio_h,
              placeholder="Share your testimony or brief bio here...")
    y -= bio_h + VGAP + 4*mm

    divider(cv, y)
    y -= 8*mm

    # 6. Signature + Stamp
    draw_signature_stamp(cv, ml, y - 30*mm, fw)

    cv.save()
    print(f"  [OK] PDF saved -> {OUTPUT_PDF}")


# ════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("Preparing assets...")
    create_signature()
    prepare_stamp()
    print("Generating PDF...")
    generate_pdf()
    print("Done!")
