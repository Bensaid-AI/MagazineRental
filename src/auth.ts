import { supabase } from '@/lib/supabaseClient'



export async function signUp(
  provider: string,
  credentials: { email: string; password: string; fullName: string }
) {
  if (provider === 'credentials') {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName,
        },
      },
    });

    if (error) {
      throw {
        type: 'SignupError',
        error: error.message,
      };
    }

    return data;
  }

  throw new Error('Unsupported auth provider');
}
