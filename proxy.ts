import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Exportamos la función nombrada 'proxy' como dicta la documentación de Next.js 16
export function proxy(request: NextRequest) {
  // 1. Obtenemos la cookie de sesión
  const authCookie = request.cookies.get('kinetis_admin_session')
  const secret = process.env.ADMIN_SECRET || 'secret' // Fallback por seguridad

  // 2. Verificamos si la cookie coincide con el secreto
  if (authCookie?.value !== secret) {
    // Si no es válida, redirigimos al login
    // Usamos request.url para construir la URL absoluta correctamente
    return NextResponse.redirect(new URL('/admin-login', request.url))
  }

  // 3. Si todo está bien, dejamos pasar la petición
  return NextResponse.next()
}

// Configuración: Solo ejecutamos el Proxy en las rutas de admin
export const config = {
  matcher: '/admin-lab/:path*',
}