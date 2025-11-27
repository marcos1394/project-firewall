import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Solicitamos acceso al perfil y email
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      authorization: {
        params: {
          tenant: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
        },
      },
    }),
  ],
  pages: {
    signIn: '/login', // Crearemos una página de login personalizada bonita
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Aquí podemos persistir datos extra si queremos
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      return session
    },
    // INTERCEPTOR DE SEGURIDAD (Middleware Logic)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      
      // Protegemos todo lo que esté bajo /dashboard o /admin-lab
      const isProtected = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/admin-lab')
      
      if (isProtected) {
        if (isLoggedIn) return true
        return false // Redirige a login
      }
      return true
    },
  },
})