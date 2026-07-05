export const runtime = 'edge';

declare const serve: (handler: (req: Request) => Response | Promise<Response>) => void;

serve((_req) => {
  const url = new URL('http://x' + (_req as unknown as Request).url);
  const tankId = url.pathname.split('/').filter(Boolean).pop() ?? 'unknown';
  return new Response(JSON.stringify({ tank: { id: tankId }, livestock: [], open_alerts: [] }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
});
