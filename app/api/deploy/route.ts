import { timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

function matchesSecret(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

function authorize(request: Request) {
  const deployToken = process.env.DEPLOY_WEBHOOK_TOKEN;
  if (!deployToken || deployToken.length < 32)
    return NextResponse.json({ error: 'Deployment is not configured.' }, { status: 503 });
  const authorization = request.headers.get('authorization') ?? '';
  const suppliedToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!matchesSecret(suppliedToken, deployToken))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
}

async function deploymentRequest(method: 'GET' | 'PATCH', image?: string) {
  const host = process.env.KUBERNETES_SERVICE_HOST;
  if (!host) throw new Error('Kubernetes API is unavailable.');
  const port = process.env.KUBERNETES_SERVICE_PORT_HTTPS || '443';
  const namespace = process.env.POD_NAMESPACE;
  if (!namespace) throw new Error('Kubernetes namespace is not configured.');
  const token = await readFile('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
  return fetch(
    `https://${host.includes(':') ? `[${host}]` : host}:${port}/apis/apps/v1/namespaces/${encodeURIComponent(namespace)}/deployments/family-bank`,
    {
      method,
      headers: {
        authorization: `Bearer ${token.trim()}`,
        'content-type': 'application/strategic-merge-patch+json',
      },
      ...(image
        ? {
            body: JSON.stringify({
              spec: { template: { spec: { containers: [{ name: 'family-bank', image }] } } },
            }),
          }
        : {}),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    },
  );
}

export async function GET(request: Request) {
  const denied = authorize(request);
  if (denied) return denied;
  try {
    const response = await deploymentRequest('GET');
    if (!response.ok) throw new Error(`Kubernetes returned ${response.status}.`);
    const deployment = await response.json();
    const status = deployment.status ?? {};
    const replicas = deployment.spec.replicas ?? 1;
    const image = deployment.spec.template.spec.containers.find(
      (container: { name: string }) => container.name === 'family-bank',
    )?.image;
    const ready =
      replicas > 0 &&
      status.observedGeneration >= deployment.metadata.generation &&
      status.updatedReplicas === replicas &&
      status.replicas === replicas &&
      status.availableReplicas === replicas;
    return NextResponse.json({ image, ready }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Deployment status is unavailable.' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const denied = authorize(request);
  if (denied) return denied;

  let image = '';
  try {
    image = String((await request.json()).image ?? '');
  } catch {
    return NextResponse.json(
      { error: 'Expected JSON containing an image digest.' },
      { status: 400 },
    );
  }
  if (!/^ghcr\.io\/pec1985\/family-bank@sha256:[a-f0-9]{64}$/.test(image)) {
    return NextResponse.json(
      { error: 'Image must be a sha256 digest from the Banky GHCR package.' },
      { status: 400 },
    );
  }

  if (!process.env.KUBERNETES_SERVICE_HOST)
    return NextResponse.json({ error: 'Kubernetes API is unavailable.' }, { status: 503 });

  try {
    const response = await deploymentRequest('PATCH', image);
    if (!response.ok) {
      console.error('Kubernetes refused the Banky deployment update:', response.status);
      return NextResponse.json(
        { error: 'Kubernetes could not update the deployment.' },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, image });
  } catch (error) {
    console.error('Banky deployment update failed:', error);
    return NextResponse.json({ error: 'Kubernetes could not be reached.' }, { status: 502 });
  }
}
