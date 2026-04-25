# ⚡ OPX-QR (Formerly EvilQR Revival)

> **OPX-QR** is the ultimate modernized revival of the original **EvilQR** QRLJacking toolkit. 
> Completely rebuilt for 2025/2026 by **OP AMINUL FF**, it features advanced iframe bypasses, tainted canvas decryption, and seamless platform support for modern security research.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-blue)](https://github.com/OP-AMINUL-FF/evilqr-revival)
[![YouTube](https://img.shields.io/badge/YouTube-OP%20AMINUL%20FF-red?logo=youtube)](https://www.youtube.com/@OPAMINULFF/)

---

## 📌 What is OPX-QR (EvilQR)?

**OPX-QR** is an advanced toolkit demonstrating a **QRLJacking** attack — allowing remote account takeover through sign-in QR code phishing.

It consists of:
- 🧩 **A Chrome browser extension** — extracts the sign-in QR code from the target login page
- 🖥️ **A Go HTTP server** — receives the QR code and displays it on a hosted phishing page

The victim scans the phishing page's QR code thinking it's from the real site — and the attacker gains access to their account.

> 📺 Original demo video: [Watch on YouTube](https://www.youtube.com/watch?v=8pfodWzqMcU)
> 
> 📝 Original blog post: [breakdev.org/evilqr-phishing](https://breakdev.org/evilqr-phishing)

---

## 🔁 About OPX-QR (This Revival)

The original **EvilQR** by [Kuba Gretzky (@mrgretzky)](https://twitter.com/mrgretzky) stopped working with modern platforms due to DOM changes and outdated selectors.

This **Revival version, now known as OPX-QR**, was completely overhauled, updated, and fixed by **OP AMINUL FF** to bypass modern security measures (like Alipay's Tainted Canvas) and work flawlessly in 2025/2026.

### ✅ What Was Fixed & Improved

| Fix | Details |
|-----|---------|
| 🎯 **Steam QR Detection** | Added `scan-all-qr` smart scanner — finds canvas/SVG/img automatically |
| 💬 **Discord** | Updated CSS selector for new React DOM structure |
| 📱 **WhatsApp Web** | Multi-fallback selector for canvas QR element |
| 🎵 **TikTok** | Logo now served locally (no external URL issues) |
| 💰 **Binance** | Logo now served locally, QR detection working |
| 🐛 **Extension Error Fix** | Fixed `authSelector` not initialized — caused `querySelector(undefined)` crash |
| 🖼️ **QR Display Size** | Fixed `o.style = "display:block"` overriding CSS width/height |
| 📐 **QR Image Scaling** | QR code now always displays at 180×180px |
| 🔌 **Message Listener** | Moved to top-level for reliable registration before page load |
| 🏷️ **Platform Branding** | Added proper logos, colors, and messages for each platform |
| 🔄 **Smart Canvas Scan** | Filters blank canvases, detects square-ratio SVGs (QR pattern) |

### 🎯 Supported Platforms

| Platform | Status |
|----------|--------|
| Discord | ✅ Working |
| Telegram Web | ✅ Working |
| WhatsApp Web | ✅ Working |
| Binance | ✅ Working |
| TikTok | ✅ Working |
| Steam | ✅ Working (Revival fix) |
| Roblox | ✅ Working (New) |
| WeChat | ✅ Working (New) |
| Bilibili | ✅ Working (New) |
| KuCoin | ✅ Working (New) |
| Alipay | ✅ Working (New) |
| Weibo | ✅ Working (New) |

---

## 👨‍💻 Developers

### Original Developer
**Kuba Gretzky** ([@mrgretzky](https://twitter.com/mrgretzky))  
📝 Blog: [breakdev.org](https://breakdev.org/evilqr-phishing)

### Revival Developer
**OP AMINUL FF**  
📺 YouTube: [youtube.com/@OPAMINULFF](https://www.youtube.com/@OPAMINULFF/)  
🌐 Website: [opaminulff.vercel.app](https://opaminulff.vercel.app/)  
🐙 GitHub: [github.com/OP-AMINUL-FF](https://github.com/OP-AMINUL-FF)

---

## ⚙️ Configuration

The parameters are hardcoded into the extension and server source — change them before deploying.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `API_TOKEN` | Token to authenticate with the REST API | `00000000-0000-0000-0000-000000000000` |
| `QRCODE_ID` | ID binding extracted QR to phishing page | `11111111-1111-1111-1111-111111111111` |
| `BIND_ADDRESS` | IP:Port the server listens on | `127.0.0.1:35000` |
| `API_URL` | External URL of the phishing server | `http://127.0.0.1:35000` |

### Files to edit:

**`server/core/config.go`:**
```go
const API_TOKEN = "00000000-0000-0000-0000-000000000000"
const BIND_ADDRESS = "127.0.0.1:35000"
```

**`server/templates/index.html`:**
```js
const API_URL = "http://127.0.0.1:35000";
const QRCODE_ID = "11111111-1111-1111-1111-111111111111";
```

**`extension/background.js`:**
```js
const API_TOKEN = "00000000-0000-0000-0000-000000000000";
const API_URL = "http://127.0.0.1:35000";
const QRCODE_ID = "11111111-1111-1111-1111-111111111111";
```

---

## 🚀 Installation

### Chrome Extension

1. Open Chrome → go to `chrome://extensions/`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `/extension` folder
5. Pin the **Evil QR** icon to the toolbar

> Full guide: [Chrome Extension Dev Basics](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)

### Server (Go)

Requires **Go 1.20+** → [Install Go](https://go.dev/doc/install)

Go to the `/server` directory and build:

**Windows:**
```bat
build_run.bat
```

**Linux:**
```bash
chmod 700 build.sh
./build.sh
```

Built binaries go to `./build/`.

---

## 🧪 Usage

**1. Start the server:**
```bash
# Linux
./build/evilqr-server -d ./templates

# Windows
.\build\evilqr-server.exe -d .\templates
```

**2. Open a supported login page:**
```
https://discord.com/login
https://web.telegram.org/k/
https://web.whatsapp.com
https://store.steampowered.com/login/
https://accounts.binance.com/en/login
https://www.tiktok.com/login/qrcode
https://www.roblox.com/login
https://web.wechat.com/
https://www.bilibili.com/
https://www.kucoin.com/ucenter/signin
https://alipay.com/
https://weibo.com/login.php
```

**3. Wait for the QR code to appear**, then click the **Evil QR** extension icon. The icon will light up if the QR is detected. (Note: Auto-capture feature will also try to detect it automatically).

**4. Open the phishing page:** `http://127.0.0.1:35000`

The victim's QR code will appear on the phishing page with platform-appropriate branding.

---

## ⚠️ Disclaimer

This tool is for **educational purposes and authorized security research only**.  
Using this tool without explicit permission from the target is **illegal** and unethical.  
The developers are **not responsible** for any misuse of this software.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

Original work © Kuba Gretzky  
Revival & fixes © OP AMINUL FF
