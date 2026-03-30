export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('FLAIR_CLIENT_ID set:', !!process.env.FLAIR_CLIENT_ID)
  console.log('FLAIR_CLIENT_SECRET set:', !!process.env.FLAIR_CLIENT_SECRET)

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.FLAIR_CLIENT_ID,
    client_secret: process.env.FLAIR_CLIENT_SECRET,
  })

  const response = await fetch('https://api.flair.co/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const data = await response.json()

  if (!response.ok) {
    return res.status(response.status).json(data)
  }

  return res.status(200).json(data)
}
