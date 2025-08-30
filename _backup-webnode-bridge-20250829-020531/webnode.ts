export async function fetchWebnode(url: string) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } })
  if (!res.ok) throw new Error(`Webnode fetch failed: ${res.status} ${res.statusText}`)
  let html = await res.text()

  // Odstraň <script> a inline on* handlery
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "")
  html = html.replace(/ on\w+="[^"]*"/gi, "").replace(/ on\w+='[^']*'/gi, "")

  // Ponech iframes pouze pro YouTube/Vimeo
  html = html.replace(/<iframe(?![^>]*(youtube|vimeo)).*?<\/iframe>/gi, "")

  // Přepiš relativní cesty na absolutní (href, src, url(...))
  const absolutize = (m: string, q: string, u: string) => {
    try { return `${m.split(q+u)[0]}${q}${new URL(u, url).toString()}${q}` } catch { return m }
  }
  html = html.replace(/href=(")(.*?)\1/gi, (m, q, u) => absolutize(m, q, u))
  html = html.replace(/src=(")(.*?)\1/gi,  (m, q, u) => absolutize(m, q, u))
  html = html.replace(/url\((["'])(.*?)\1\)/gi, (m, q, u) => {
    try { return `url(${q}${new URL(u, url).toString()}${q})` } catch { return m }
  })

  // Skryj cookie lištu/Webnode overlaye (best-effort)
  html = html.replace(/<div[^>]*cookie[^>]*>[\s\S]*?<\/div>/gi, "")

  return html
}
