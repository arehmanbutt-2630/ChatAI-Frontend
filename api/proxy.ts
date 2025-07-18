export default async function handler(req, res) {
  const targetUrl = `http://56.228.31.91:5000${req.url}`; // No trailing slash

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  });

  const data = await response.text();
  res.status(response.status).send(data);
}
