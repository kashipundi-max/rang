const ZENTRY_WORKSPACE_ID = "47345f70-4895-4ff6-bcf8-153034225cae";

// zen-try widget. Rendered as a plain <script> inside <head> (not next/script)
// so the tag is present in the raw HTML for the vendor to detect. Loaded async
// so it does not block rendering.
export function ZenTryWidget() {
  return <script async src="https://zen-try.site/widget.js" data-workspace-id={ZENTRY_WORKSPACE_ID} />;
}
