export const runtime = 'edge';

declare const serve: (handler: (req: Request) => Response | Promise<Response>) => void;

serve(() => {
  return new Response(JSON.stringify({ status: 'ready' }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
});
