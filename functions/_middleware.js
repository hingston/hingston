// Keep search engines pointed at the canonical host and URLs.
// - hingston.pages.dev (production alias) 301s to genealogy.hingston.org
// - preview deployments (*.hingston.pages.dev) stay reachable but are marked noindex
// - /index.htm is a legacy URL from the old Cambridge site; Google still knows it
const LEGACY_REDIRECTS = {
  "/index.htm": "/",
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "hingston.pages.dev") {
    url.hostname = "genealogy.hingston.org";
    return Response.redirect(url.toString(), 301);
  }
  const legacy = LEGACY_REDIRECTS[url.pathname];
  if (legacy) {
    url.pathname = legacy;
    return Response.redirect(url.toString(), 301);
  }
  const response = await context.next();
  if (url.hostname.endsWith(".pages.dev")) {
    const marked = new Response(response.body, response);
    marked.headers.set("X-Robots-Tag", "noindex");
    return marked;
  }
  return response;
}
