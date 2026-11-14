import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';

const KEY = 'jabarin-session.json';

function sessionFile() {
  return new File(Paths.document, KEY);
}

export async function readStoredToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    }
    const file = sessionFile();
    if (!file.exists) return null;
    const raw = await file.text();
    return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch {
    return null;
  }
}

export async function writeStoredToken(token: string | null) {
  try {
    if (Platform.OS === 'web') {
      if (token) globalThis.localStorage?.setItem(KEY, token);
      else globalThis.localStorage?.removeItem(KEY);
      return;
    }
    const file = sessionFile();
    if (token) file.writeSync(token);
    else if (file.exists) file.delete();
  } catch {
    // Penyimpanan lokal gagal tidak boleh memblokir pemakaian aplikasi.
  }
}
