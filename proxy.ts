import { auth } from "@/auth"

// En lugar de escribir lógica manual con cookies,
// exportamos la función 'auth' que ya contiene toda la seguridad.
// NextAuth se encarga de validar la sesión y redirigir si es necesario.
export const proxy = auth

export const config = {
  // Matcher actualizado:
  // Intercepta todo EXCEPTO archivos estáticos, imágenes y la API de autenticación
  // Esto asegura que el login de Google/Microsoft no sea bloqueado por el propio proxy
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}s