const DEV_CLIENT_ID = import.meta.env.VITE_FLAIR_CLIENT_ID
const DEV_CLIENT_SECRET = import.meta.env.VITE_FLAIR_CLIENT_SECRET

let tokenData = null

async function getToken() {
  if (tokenData && Date.now() < tokenData.expiresAt - 60_000) {
    return tokenData.accessToken
  }

  let res
  if (DEV_CLIENT_ID) {
    // Dev: call Flair directly via Vite proxy using local credentials
    res = await fetch('/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: DEV_CLIENT_ID,
        client_secret: DEV_CLIENT_SECRET,
      }),
    })
  } else {
    // Prod: use serverless function (credentials stay server-side)
    res = await fetch('/api/token', { method: 'POST' })
  }

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Auth failed ${res.status}: ${errText}`)
  }

  const data = await res.json()
  tokenData = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  return tokenData.accessToken
}

async function apiFetch(path, options = {}) {
  const token = await getToken()
  const res = await fetch(`/flair/api${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    console.error(`API ${options.method ?? 'GET'} ${path} → ${res.status}`, text)
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json()
}

// ── Structures ────────────────────────────────────────────────────────────────

export async function getStructures() {
  const { data } = await apiFetch('/structures')
  return data
}

export async function getStructure(id) {
  const { data } = await apiFetch(`/structures/${id}`)
  return data
}

export async function updateStructure(id, attributes) {
  const { data } = await apiFetch(`/structures/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: { id, type: 'structures', attributes } }),
  })
  return data
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

export async function getStructureRooms(structureId) {
  const { data } = await apiFetch(`/structures/${structureId}/rooms`)
  return data
}

export async function updateRoom(id, attributes) {
  const { data } = await apiFetch(`/rooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: { id, type: 'rooms', attributes } }),
  })
  return data
}

// ── Pucks ─────────────────────────────────────────────────────────────────────

export async function getRoomPucks(roomId) {
  const { data } = await apiFetch(`/rooms/${roomId}/pucks`)
  return data
}

// ── Puck 2s ───────────────────────────────────────────────────────────────────

export async function getStructurePuck2s(structureId) {
  const { data } = await apiFetch(`/structures/${structureId}/puck2s`)
  return data
}

export async function getRoomPuck2s(roomId) {
  const { data } = await apiFetch(`/rooms/${roomId}/puck2s`)
  return data
}

export async function updatePuck2(id, attributes) {
  const { data } = await apiFetch(`/puck2s/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: { id, type: 'puck2s', attributes } }),
  })
  return data
}

// ── Vents ─────────────────────────────────────────────────────────────────────

export async function getRoomVents(roomId) {
  const { data } = await apiFetch(`/rooms/${roomId}/vents`)
  return data
}

export async function updateVent(id, attributes) {
  const { data } = await apiFetch(`/vents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: { id, type: 'vents', attributes } }),
  })
  return data
}

// ── Weather ───────────────────────────────────────────────────────────────────

export async function getStructureWeather(structureId) {
  const { data } = await apiFetch(`/structures/${structureId}/current-weather`)
  return data
}

// ── Schedules ─────────────────────────────────────────────────────────────────

export async function getStructureSchedules(structureId) {
  const { data } = await apiFetch(`/structures/${structureId}/schedules`)
  return data
}


// ── Thermostats ───────────────────────────────────────────────────────────────

export async function getStructureThermostats(structureId) {
  const { data } = await apiFetch(`/structures/${structureId}/thermostats`)
  return data
}

export async function updateThermostat(id, attributes) {
  const { data } = await apiFetch(`/thermostats/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: { id, type: 'thermostats', attributes } }),
  })
  return data
}

// ── Remote Sensors ────────────────────────────────────────────────────────────

export async function getStructureRemoteSensors(structureId) {
  const { data } = await apiFetch(`/structures/${structureId}/remote-sensors`)
  return data
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export async function getStructureAlerts(structureId) {
  const { data } = await apiFetch(`/structures/${structureId}/alerts`)
  return data
}

// ── HVAC Units ────────────────────────────────────────────────────────────────

export async function getStructureHvacUnits(structureId) {
  const { data } = await apiFetch(`/structures/${structureId}/hvac-units`)
  return data
}

export async function getPuck2HvacUnits(puck2Id) {
  const { data } = await apiFetch(`/puck2s/${puck2Id}/hvac-units`)
  return data
}

export async function updateHvacUnit(id, attributes) {
  const { data } = await apiFetch(`/hvac-units/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: { id, type: 'hvac-units', attributes } }),
  })
  return data
}
