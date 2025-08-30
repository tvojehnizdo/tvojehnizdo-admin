export function corsJson(body:any, init?: ResponseInit){
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...(init?.headers || {})
  };
  return new Response(JSON.stringify(body), { status: init?.status ?? 200, headers });
}
export function preflight(req: Request){
  if (req.method === "OPTIONS") {
    return corsJson({ ok:true }, { status: 204 });
  }
  return null;
}
