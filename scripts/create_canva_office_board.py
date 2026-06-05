from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "office-agents"
OUTDIR = ROOT / "outputs" / "canva"
OUTDIR.mkdir(parents=True, exist_ok=True)

AGENTS = {
    "nova": ("Nova Chief", "Chief of Staff", "Command, routing, QC", ASSETS / "nova-chief.png", "#22d3ee"),
    "ace": ("Ace Sales", "ASM Sales Agent", "Sales pipeline, proposals", ASSETS / "ace-sales.png", "#34d399"),
    "mina": ("Mina Care", "Customer Follow-up", "Relationship, reminders", ASSETS / "mina-care.png", "#fb7185"),
    "atlas": ("Atlas Invest", "Portfolio Agent", "DCA, allocation", ASSETS / "atlas-invest.png", "#3b82f6"),
    "vera": ("Vera Shield", "Risk Manager", "Risk gate, safeguards", ASSETS / "vera-shield.png", "#f59e0b"),
    "lina": ("Lina Voice", "LinkedIn & Email", "Posts, emails, tone", ASSETS / "lina-voice.png", "#14b8a6"),
    "dara": ("Dara Docs", "Document Studio", "PDF, sheets, slides", ASSETS / "dara-docs.png", "#a78bfa"),
    "keno": ("Keno Expert", "Product Knowledge", "Product fit, tech notes", ASSETS / "keno-expert.png", "#facc15"),
    "luna": ("Luna Balance", "Life Room", "Family, timing, balance", ASSETS / "luna-balance.png", "#c084fc"),
    "nimo": ("Nimo Vault", "Memory Steward", "Drive, logs, archive", ASSETS / "nimo-vault.png", "#2dd4bf"),
}


def get_font(size, bold=False):
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size)


def rounded(draw, box, fill, outline=None, width=1, radius=22):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def load_avatar(path):
    avatar = Image.open(path).convert("RGBA")
    pixels = avatar.load()
    for y in range(avatar.height):
        for x in range(avatar.width):
            r, g, b, a = pixels[x, y]
            if r > 244 and g > 244 and b > 244:
                pixels[x, y] = (255, 255, 255, 0)
    return avatar


def paste_agent(canvas, draw, key, box, fonts):
    name, position, _desc, path, accent = AGENTS[key]
    x1, y1, x2, y2 = box
    avatar = load_avatar(path)
    maxw = x2 - x1 - 20
    maxh = y2 - y1 - 54
    avatar.thumbnail((maxw, maxh), Image.Resampling.LANCZOS)
    px = x1 + (maxw - avatar.width) // 2 + 10
    py = y1 + 4 + (maxh - avatar.height)
    alpha = avatar.getchannel("A")
    shadow = Image.new("RGBA", avatar.size, (0, 0, 0, 120))
    shadow.putalpha(alpha.filter(ImageFilter.GaussianBlur(12)))
    canvas.paste(shadow, (px + 8, py + 12), shadow)
    canvas.paste(avatar, (px, py), avatar)
    rounded(draw, (x1 + 8, y2 - 48, x2 - 8, y2 - 8), "#071423", accent, 1, 9)
    draw.text((x1 + 18, y2 - 42), name, font=fonts["medium_bold"], fill="#ffffff")
    draw.text((x1 + 18, y2 - 20), position, font=fonts["small"], fill="#aebfd1")


def main():
    width, height = 1920, 1080
    image = Image.new("RGB", (width, height), "#030814")
    draw = ImageDraw.Draw(image)
    fonts = {
        "title": get_font(42, True),
        "heading": get_font(24, True),
        "medium_bold": get_font(18, True),
        "small": get_font(14),
        "small_bold": get_font(12, True),
    }

    for y in range(height):
        r = int(3 + 10 * y / height)
        g = int(8 + 18 * y / height)
        b = int(20 + 22 * y / height)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    for x in range(0, width, 48):
        draw.line([(x, 0), (x, height)], fill=(10, 32, 54), width=1)
    for y in range(0, height, 48):
        draw.line([(0, y), (width, y)], fill=(10, 32, 54), width=1)

    rounded(draw, (0, 0, 230, height), "#061323", "#143351", 2, 0)
    rounded(draw, (230, 0, width - 390, 82), "#061323", "#143351", 2, 0)
    rounded(draw, (width - 390, 0, width, height), "#05101e", "#143351", 2, 0)
    rounded(draw, (230, height - 78, width, height), "#061323", "#143351", 2, 0)

    draw.text((30, 30), "Ou AI OS", font=fonts["title"], fill="#dff7ff")
    draw.text((270, 22), "Ou AI Command Office", font=fonts["title"], fill="#f4fbff")
    draw.ellipse((750, 42, 762, 54), fill="#35d27f")
    draw.text((774, 34), "Live Operation", font=fonts["small"], fill="#a8bed2")
    rounded(draw, (1120, 22, 1328, 60), "#0b1c2e", "#1f3d5f", 1, 14)
    draw.ellipse((1135, 36, 1150, 51), fill="#35d27f")
    draw.text((1160, 34), "All Systems Operational", font=fonts["small"], fill="#e8f7ff")

    nav = [
        "Command Center",
        "Agents",
        "Workflow Pipeline",
        "Tasks & Tickets",
        "Knowledge Base",
        "Data & Insights",
        "Archive Vault",
        "Communications",
        "Calendar",
        "Settings",
    ]
    y = 92
    for i, item in enumerate(nav):
        fill = "#0d2238" if i == 0 else "#061323"
        outline = "#1c4f7a" if i == 0 else "#102a46"
        rounded(draw, (22, y, 208, y + 46), fill, outline, 1, 10)
        draw.text((58, y + 14), item, font=fonts["small"], fill="#c9d8e8")
        draw.text((34, y + 14), str(i + 1), font=fonts["small_bold"], fill="#38bdf8")
        y += 55

    rounded(draw, (20, 620, 210, 778), "#071a2c", "#143351", 1, 14)
    draw.text((34, 642), "System Status", font=fonts["small"], fill="#8ea8bd")
    for i, (label, value) in enumerate([("AI Agents", "10/10"), ("Workflows", "Active"), ("Storage", "82%"), ("Security", "Secure")]):
        yy = 674 + i * 26
        draw.ellipse((34, yy + 5, 44, yy + 15), fill="#35d27f")
        draw.text((52, yy), label, font=fonts["small"], fill="#c8d7e6")
        draw.text((150, yy), value, font=fonts["small"], fill="#9fb3c8")

    rounded(draw, (250, 100, 1515, 980), "#071423", "#164069", 2, 26)
    rooms = {
        "sales": ((280, 130, 690, 360), "Sales & Relationship", "#34d399", ["ace", "mina"]),
        "finance": ((730, 130, 1160, 360), "Finance & Risk", "#3b82f6", ["atlas", "vera"]),
        "product": ((1185, 310, 1490, 590), "Product Knowledge", "#f59e0b", ["keno"]),
        "content": ((280, 390, 685, 700), "Content & Documents", "#a78bfa", ["lina", "dara"]),
        "command": ((700, 385, 1125, 720), "Nova Command", "#22d3ee", ["nova"]),
        "life": ((470, 725, 1030, 955), "Life & Memory", "#c084fc", ["luna", "nimo"]),
        "vault": ((1060, 725, 1490, 955), "Archive Vault", "#2dd4bf", ["nimo"]),
    }

    for box, title, accent, keys in rooms.values():
        x1, y1, x2, y2 = box
        rounded(draw, box, "#0a1a2b", accent, 2, 20)
        draw.rectangle((x1 + 16, y1 + 52, x2 - 16, y1 + 94), fill="#0d2942")
        rounded(draw, (x1 + 16, y1 + 14, x1 + 270, y1 + 48), "#061323", accent, 1, 8)
        draw.text((x1 + 30, y1 + 23), title, font=fonts["heading"], fill="#f6fbff")
        if len(keys) == 1:
            paste_agent(image, draw, keys[0], (x1 + 50, y1 + 68, x2 - 50, y2 - 18), fonts)
        else:
            mid = (x1 + x2) // 2
            paste_agent(image, draw, keys[0], (x1 + 14, y1 + 68, mid - 6, y2 - 18), fonts)
            paste_agent(image, draw, keys[1], (mid + 6, y1 + 68, x2 - 14, y2 - 18), fonts)

    draw.text((1550, 24), "Live Coordination", font=fonts["heading"], fill="#f4fbff")
    draw.ellipse((1850, 35, 1860, 45), fill="#35d27f")
    draw.text((1868, 28), "Live", font=fonts["small"], fill="#a8bed2")
    feed = [
        ("nova", "Nova Chief", "All commands route through Nova first."),
        ("ace", "Ace Sales", "Visit brief and proposal queue ready."),
        ("mina", "Mina Care", "Follow-up reminders are waiting."),
        ("atlas", "Atlas Invest", "DCA needs allocation truth first."),
        ("vera", "Vera Shield", "Risk checks active."),
        ("keno", "Keno Expert", "Product fit support ready."),
        ("dara", "Dara Docs", "PDF and slide QA ready."),
        ("lina", "Lina Voice", "Email tone variants ready."),
        ("luna", "Luna Balance", "Life planner online."),
        ("nimo", "Nimo Vault", "Drive paths mapped."),
    ]
    y = 86
    for i, (key, name, text) in enumerate(feed, 1):
        avatar = load_avatar(AGENTS[key][3])
        avatar.thumbnail((52, 52), Image.Resampling.LANCZOS)
        draw.ellipse((1548, y, 1604, y + 56), fill="#0a1a2b", outline=AGENTS[key][4], width=2)
        image.paste(avatar, (1550 + (54 - avatar.width) // 2, y + 2 + (52 - avatar.height) // 2), avatar)
        draw.text((1620, y + 6), str(i), font=fonts["medium_bold"], fill=AGENTS[key][4])
        draw.text((1650, y + 4), name, font=fonts["medium_bold"], fill="#edf8ff")
        draw.text((1650, y + 28), text, font=fonts["small"], fill="#aebfd1")
        y += 76

    metrics = [
        ("Active Agents", "10 / 10"),
        ("Tasks in Progress", "23"),
        ("System Health", "100%"),
        ("Storage", "Google Drive"),
        ("Pipeline", "Input -> Nova -> Agents -> QC -> Drive"),
    ]
    x = 600
    for label, value in metrics:
        draw.text((x, height - 55), label, font=fonts["small"], fill="#8fa8bd")
        draw.text((x, height - 31), value, font=fonts["medium_bold"], fill="#eaf7ff")
        x += 220

    out = OUTDIR / "ou-ai-command-office-canva-board.png"
    image.save(out, quality=95)
    print(out)


if __name__ == "__main__":
    main()
