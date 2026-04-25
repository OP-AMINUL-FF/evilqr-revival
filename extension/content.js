var lastButtonClicked = 0;

var qrdoc = undefined;
var qrwin = undefined;
qrdoc = document;
qrwin = window;

// Identify if we are in an iframe
const isIframe = window !== window.top;
if (isIframe) {
    console.log("EvilQR: Scanning inside iframe:", window.location.host);
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.message) {
        case "get-image":
            var img = qrdoc.querySelector(request.selector);
            if (img !== null) {
                switch (img.tagName.toUpperCase()) {
                    case "IMG":
                        sendResponse({ imgSrc: img.src, host: qrwin.location.host });
                        break;
                    case "CANVAS":
                        sendResponse({ imgSrc: img.toDataURL(), host: qrwin.location.host });
                        break;
                    case "SVG":
                        var svg_obj = new XMLSerializer().serializeToString(img);
                        var img_src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg_obj)));
                        sendResponse({ imgSrc: img_src, host: qrwin.location.host });
                        break;
                    case "DIV":
                        html2canvas(img).then(canvas => {
                            sendResponse({ imgSrc: canvas.toDataURL(), host: qrwin.location.host });
                        });
                        return true;
                }
            }
            break;
        case "scan-all-qr":
            // 1. Try canvas elements - require 1500+ chars (blank small canvas < 500)
            var allCanvases = qrdoc.querySelectorAll('canvas');
            for (var ci = 0; ci < allCanvases.length; ci++) {
                try {
                    var canvasEl = allCanvases[ci];
                    var cRect = canvasEl.getBoundingClientRect();
                    if (cRect.width < 50 || cRect.height < 50) continue;
                    var cData = canvasEl.toDataURL('image/png');
                    if (cData && cData.length > 1500) {
                        sendResponse({ imgSrc: cData, host: qrwin.location.host });
                        return;
                    }
                } catch (e2) { }
            }
            // 2. Try SVG elements - must be roughly square (QR codes are square)
            var allSvgs = qrdoc.querySelectorAll('svg');
            for (var si = 0; si < allSvgs.length; si++) {
                try {
                    var svgEl = allSvgs[si];
                    var sRect = svgEl.getBoundingClientRect();
                    var ratio = sRect.width / sRect.height;
                    // QR code SVGs are square (ratio ~1.0), skip non-square SVGs
                    if (sRect.width > 80 && ratio > 0.8 && ratio < 1.2) {
                        var svgData = new XMLSerializer().serializeToString(svgEl);
                        var svgSrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                        sendResponse({ imgSrc: svgSrc, host: qrwin.location.host });
                        return;
                    }
                } catch (e3) { }
            }
            // 3. Try img data URIs (large enough to be a QR code)
            var dataUriImgs = qrdoc.querySelectorAll('img[src^="data:"]');
            for (var di = 0; di < dataUriImgs.length; di++) {
                var dImg = dataUriImgs[di];
                if (dImg.src && dImg.src.length > 5000) {
                    sendResponse({ imgSrc: dImg.src, host: qrwin.location.host });
                    return;
                }
            }
            // 4. Try regular http img elements that are square and visible
            var httpImgs = qrdoc.querySelectorAll('img[src]');
            for (var hi = 0; hi < httpImgs.length; hi++) {
                try {
                    var hImg = httpImgs[hi];
                    var hRect = hImg.getBoundingClientRect();
                    var hRatio = hRect.width / hRect.height;
                    if (hRect.width > 80 && hRatio > 0.8 && hRatio < 1.2 && !hImg.src.startsWith('data:')) {
                        var tCanvas = document.createElement('canvas');
                        tCanvas.width = hImg.naturalWidth || hRect.width;
                        tCanvas.height = hImg.naturalHeight || hRect.height;
                        var tCtx = tCanvas.getContext('2d');
                        tCtx.drawImage(hImg, 0, 0);
                        var tData = tCanvas.toDataURL('image/png');
                        if (tData && tData.length > 1500) {
                            sendResponse({ imgSrc: tData, host: qrwin.location.host });
                            return;
                        }
                    }
                } catch (e4) { }
            }
            sendResponse(undefined);
            break;
        case "item-exists":
            var o = qrdoc.querySelector(request.selector);
            if (o !== null) {
                sendResponse({ exists: true });
            } else {
                sendResponse({ exists: false });
            }
            break;
        case "click-button":
            if (Date.now() - lastButtonClicked >= 5000) {
                var btn = qrdoc.querySelector(request.selector);
                if (btn !== null) {
                    lastButtonClicked = Date.now();
                    btn.click();
                }
            }
            break;
        case "get-location":
            sendResponse({ location: qrwin.location });
            break;
    }
});

// Auto-Capture MutationObserver Logic
var autoScanTimeout = null;
var lastAutoDetectedSrc = "";

function performAutoScan() {
    // 1. Try canvas elements
    var allCanvases = qrdoc.querySelectorAll('canvas');
    for (var ci = 0; ci < allCanvases.length; ci++) {
        try {
            var canvasEl = allCanvases[ci];
            var cRect = canvasEl.getBoundingClientRect();
            if (cRect.width < 50 || cRect.height < 50) continue;

            // Fix for Alipay Tainted Canvas
            var cData = "";
            try {
                cData = canvasEl.toDataURL('image/png');
            } catch (taintError) {
                console.log("Canvas is tainted (likely Alipay). Attempting DOM bypass...");

                // Alipay obfuscates the URL by injecting it into an inline script
                // We will search all script tags for the 'barcode: "https://qr.alipay.com...' payload
                var scripts = qrdoc.getElementsByTagName('script');
                var qrUrl = "";
                for (var i = 0; i < scripts.length; i++) {
                    var scriptContent = scripts[i].innerHTML || scripts[i].textContent;
                    // Look for the specific Alipay format
                    var match = scriptContent.match(/barcode:\s*"(https:\/\/qr\.alipay\.com\/[^"]+)"/);
                    if (match && match[1]) {
                        // Unescape HTML entities (Alipay uses &amp;)
                        qrUrl = match[1].replace(/&amp;/g, '&');
                        break;
                    }
                }

                // If we found the URL, we generate a QR code for it via a public API
                if (qrUrl !== "" && qrUrl !== lastAutoDetectedSrc) {
                    lastAutoDetectedSrc = qrUrl; // Use the URL as the unique identifier for this scan

                    var apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`;

                    fetch(apiUrl)
                        .then(response => response.blob())
                        .then(blob => {
                            var reader = new FileReader();
                            reader.onloadend = function () {
                                var base64data = reader.result;
                                chrome.runtime.sendMessage({ message: "qr-auto-detected", imgSrc: base64data, host: qrwin.location.host });
                            }
                            reader.readAsDataURL(blob);
                        }).catch(e => console.error("Failed to generate bypass QR", e));
                }
                continue;
            }

            if (cData && cData.length > 1500 && cData !== lastAutoDetectedSrc) {
                lastAutoDetectedSrc = cData;
                chrome.runtime.sendMessage({ message: "qr-auto-detected", imgSrc: cData, host: qrwin.location.host });
                return;
            }
        } catch (e) { }
    }
    // 2. Try SVG elements
    var allSvgs = qrdoc.querySelectorAll('svg');
    for (var si = 0; si < allSvgs.length; si++) {
        try {
            var svgEl = allSvgs[si];
            var sRect = svgEl.getBoundingClientRect();
            var ratio = sRect.width / sRect.height;
            if (sRect.width > 80 && ratio > 0.8 && ratio < 1.2) {
                var svgData = new XMLSerializer().serializeToString(svgEl);
                var svgSrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                if (svgSrc !== lastAutoDetectedSrc) {
                    lastAutoDetectedSrc = svgSrc;
                    chrome.runtime.sendMessage({ message: "qr-auto-detected", imgSrc: svgSrc, host: qrwin.location.host });
                    return;
                }
            }
        } catch (e) { }
    }
    // 3. Try img elements
    var allImgs = qrdoc.querySelectorAll('img');
    for (var di = 0; di < allImgs.length; di++) {
        var dImg = allImgs[di];
        try {
            var iRect = dImg.getBoundingClientRect();
            var iRatio = iRect.width / iRect.height;
            // Ensure the image is visible and square-ish
            if (iRect.width > 50 && iRatio > 0.8 && iRatio < 1.2 && iRect.top >= 0 && iRect.left >= 0) {
                if (dImg.src && dImg.src !== lastAutoDetectedSrc) {
                    lastAutoDetectedSrc = dImg.src;
                    chrome.runtime.sendMessage({ message: "qr-auto-detected", imgSrc: dImg.src, host: qrwin.location.host });
                    return;
                }
            }
        } catch (e) { }
    }
}

// Initial scan on load
performAutoScan();

var observer = new MutationObserver((mutations) => {
    // Debounce the scan to avoid heavy processing.
    // 500ms is a sweet spot: fast enough for Bilibili, but gives the iframe time to load
    if (autoScanTimeout) clearTimeout(autoScanTimeout);
    autoScanTimeout = setTimeout(performAutoScan, 500);
});

// Periodic fallback scan (every 2 seconds) for platforms like Bilibili that load late
setInterval(performAutoScan, 2000);

// Start observing the document body for changes
if (qrdoc.body) {
    observer.observe(qrdoc.body, { childList: true, subtree: true });
} else {
    window.addEventListener('DOMContentLoaded', () => {
        if (qrdoc.body) observer.observe(qrdoc.body, { childList: true, subtree: true });
    });
}
