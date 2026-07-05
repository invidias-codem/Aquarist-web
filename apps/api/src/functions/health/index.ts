export const runtime = 'edge';

declare const serve: (handler: (req: Request) => Response | Promise<Response>) => void;

serve((_req) => {
  return new Response(JSON.stringify({ health: 'ok', service: 'aquarist-api' }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
});
