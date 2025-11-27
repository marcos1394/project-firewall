import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { createClient } from "@supabase/supabase-js"

// 1. Cliente Supabase Privado (Service Role si fuera necesario, pero Anon funciona si RLS permite insert)
// Usamos las variables públicas para mantenerlo simple en este scope
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // PROVEEDOR 1: GOOGLE WORKSPACE
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { 
        params: { 
          prompt: "consent", 
          access_type: "offline", 
          response_type: "code" 
        } 
      },
    }),
    // PROVEEDOR 2: MICROSOFT 365 (ENTRA ID)
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      // CORRECCIÓN IMPORTANTE: Usamos 'issuer' para cumplir con OIDC y evitar error de tipo 'tenantId'
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
    }),
  ],
  pages: {
    signIn: '/login', // Nuestra página de login personalizada
    error: '/login',  // Si hay error, volver al login
  },
  callbacks: {
    // A. REGISTRO/LOGIN AUTOMÁTICO (JIT PROVISIONING)
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        // Buscamos si el usuario ya existe para no sobrescribir roles si ya tiene uno asignado
        // Solo actualizamos metadatos básicos (nombre, avatar, ultimo login)
        const { error } = await supabase
          .from('users')
          .upsert({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            provider: account?.provider,
            last_login: new Date().toISOString()
            // NOTA: No enviamos 'role' ni 'organization_id' aquí para no resetearlos 
            // si ya fueron asignados manualmente en la DB.
          }, { onConflict: 'email' })

        if (error) {
          console.error("Error crítico guardando usuario en Supabase:", error)
          return false // Bloquear login si falla la DB
        }
        
        return true // Login exitoso
      } catch (e) {
        console.error("SignIn Exception:", e)
        return false
      }
    },
    
    // B. INYECCIÓN DE DATOS EN SESIÓN (TENANT ISOLATION)
    // Esto permite que 'await auth()' en el frontend nos diga de qué empresa es el usuario
    async session({ session }) {
      if (session.user?.email) {
        // Consultamos los permisos reales en la base de datos
        const { data: dbUser } = await supabase
          .from('users')
          .select('role, id, organization_id')
          .eq('email', session.user.email)
          .single()
        
        if (dbUser) {
          // Extendemos el objeto session (usamos ts-ignore o casting porque NextAuth types son estrictos)
          // @ts-ignore
          session.user.role = dbUser.role || 'user'
          // @ts-ignore
          session.user.dbId = dbUser.id
          // @ts-ignore
          session.user.orgId = dbUser.organization_id // <--- LA CLAVE DEL AISLAMIENTO
        }
      }
      return session
    },

    // C. PROTECCIÓN DE RUTAS (MIDDLEWARE LITE)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      
      // Protegemos todas las rutas que empiecen con /admin-lab
      const isProtected = nextUrl.pathname.startsWith('/admin-lab')
      
      if (isProtected) {
        if (isLoggedIn) return true
        return false // Redirige automáticamente a la página configurada en pages.signIn
      }
      return true
    },
  },
})