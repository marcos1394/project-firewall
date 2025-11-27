import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } },
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      // CORRECCIÓN AQUÍ: Usamos 'issuer' en lugar de 'tenantId'
      // Esta es la URL estándar de OIDC para Microsoft Entra
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        const { error } = await supabase
          .from('users')
          .upsert({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            provider: account?.provider,
            last_login: new Date().toISOString()
          }, { onConflict: 'email' })

        if (error) {
          console.error("Error guardando usuario:", error)
          return false
        }
        
        return true
      } catch (e) {
        console.error("SignIn Error:", e)
        return false
      }
    },
    
    async session({ session }) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('role, id')
        .eq('email', session.user.email)
        .single()
      
      if (dbUser) {
        // @ts-ignore
        session.user.role = dbUser.role
        // @ts-ignore
        session.user.dbId = dbUser.id
      }
      return session
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected = nextUrl.pathname.startsWith('/admin-lab')
      
      if (isProtected) {
        if (isLoggedIn) return true
        return false
      }
      return true
    },
  },
})