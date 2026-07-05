export const runtime = 'edge';

declare const serve: (handler: (req: Request) => Response | Promise<Response>) => void;

serve((_req) => new Response('Aquarist API placeholder', { status: 200 }));
