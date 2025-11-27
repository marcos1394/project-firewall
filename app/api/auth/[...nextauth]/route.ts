import { handlers } from "@/auth" // Importamos la config que hicimos en auth.ts

// Exportamos los métodos GET y POST que NextAuth necesita para manejar
// los callbacks, el inicio de sesión y el cierre de sesión.
export const { GET, POST } = handlers