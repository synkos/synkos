import UIKit
import Capacitor

class ViewController: CAPBridgeViewController {
    override func webViewDidLoad() {
        super.webViewDidLoad()
        // Disable WKWebView rubber-band bounce so fixed header/footer stay in place
        webView?.scrollView.bounces = false
        webView?.scrollView.alwaysBounceVertical = false
    }
}
