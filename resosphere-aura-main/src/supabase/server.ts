import { createServerClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// For Vite/React apps, we use the browser client with cookie handling
// This is a compatibility layer for server-side patterns
export function createClient() {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookies = document.cookie.split(';');
        const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));
        return cookie ? cookie.split('=')[1] : null;
      },
      set(name: string, value: string, options: any) {
        let cookie = `${name}=${value}`;
        if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
        if (options?.path) cookie += `; path=${options.path}`;
        if (options?.domain) cookie += `; domain=${options.domain}`;
        if (options?.secure) cookie += '; secure';
        if (options?.httpOnly) cookie += '; httponly';
        if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
        document.cookie = cookie;
      },
      remove(name: string, options: any) {
        this.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });
}
