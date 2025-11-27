// Obtener Token de Servidor (Client Credentials Flow)
export async function getMicrosoftToken() {
  const tenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID
  const clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID
  const clientSecret = process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Faltan credenciales de Microsoft en .env")
  }

  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
  
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })

  const data = await res.json()
  
  if (!res.ok) {
    throw new Error(`Error obteniendo token Microsoft: ${data.error_description || data.error}`)
  }

  return data.access_token
}

// Obtener Usuarios del Directorio
export async function fetchMicrosoftUsers(accessToken: string) {
  // Pedimos solo los campos necesarios para ahorrar ancho de banda
  const url = 'https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,userPrincipalName,jobTitle&$top=999'
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(`Error en Graph API: ${data.error?.message}`)
  }

  return data.value // Array de usuarios
}