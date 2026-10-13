const TRUSTPILOT_INTEGRATION_KEY = "Z9YUxsMe76FQnuql";

const TRUSTPILOT_SNIPPET = `(function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
f.parentNode.insertBefore(a,f)})(window,document,'script', 'https://invitejs.trustpilot.com/tp.min.js', 'tp');
tp('register', '${TRUSTPILOT_INTEGRATION_KEY}');`;

// Trustpilot invitation tracking. Rendered as a plain <script> inside <head>
// (not next/script) because Trustpilot's domain verifier reads the raw HTML and
// cannot see scripts that next/script injects on the client. The snippet itself
// loads tp.min.js async, so it does not block rendering.
export function TrustpilotScript() {
  return <script id="trustpilot-invite" dangerouslySetInnerHTML={{ __html: TRUSTPILOT_SNIPPET }} />;
}
