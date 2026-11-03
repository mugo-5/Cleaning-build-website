const ALLOWED_SERVICES = new Set([
  'Sofa Deep Cleaning',
  'Mattress Cleaning',
  'House Cleaning',
  'Office Cleaning',
  'Move-Out Cleaning',
  'Carpet Cleaning',
  'Laundry Wash',
  'Floor Scrubbing',
]);

const MAX_BODY_BYTES = 16 * 1024;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) {
    return json({ error: 'Quote service is not configured.' }, 503);
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return json({ error: 'Send the quote request as JSON.' }, 415);
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ error: 'The request is too large.' }, 413);
  }

  let payload;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json({ error: 'The request is too large.' }, 413);
    }
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: 'The request body must be valid JSON.' }, 400);
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json({ error: 'The request body must be a JSON object.' }, 400);
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
  const service = typeof payload.service === 'string' ? payload.service.trim() : '';
  const details = typeof payload.details === 'string' ? payload.details.trim() : '';

  if (name.length < 2 || name.length > 100) {
    return json({ error: 'Name must be between 2 and 100 characters.' }, 400);
  }
  if (phone.length < 7 || phone.length > 25 || !/^\+?[0-9 ()-]+$/.test(phone)) {
    return json({ error: 'Enter a valid phone number.' }, 400);
  }
  if (!ALLOWED_SERVICES.has(service)) {
    return json({ error: 'Select a valid cleaning service.' }, 400);
  }
  if (details.length > 2000) {
    return json({ error: 'Project details must be 2,000 characters or fewer.' }, 400);
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO quote_requests (name, phone, service, details) VALUES (?, ?, ?, ?)'
    ).bind(name, phone, service, details).run();

    return json({ ok: true, requestId: result.meta.last_row_id }, 201);
  } catch (error) {
    console.error('Could not save quote request:', error);
    return json({ error: 'We could not save your request. Please try again.' }, 500);
  }
}
