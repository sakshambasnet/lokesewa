import * as SecureStore from 'expo-secure-store';

// SecureStore warns above ~2 KB per value, and Supabase sessions can be bigger.
// So we split each value into chunks and store a chunk count under the main key.
const CHUNK_SIZE = 1800;

const chunkKey = (key: string, index: number) => `${key}.${index}`;

async function removeItem(key: string): Promise<void> {
  const count = Number(await SecureStore.getItemAsync(key));
  if (Number.isInteger(count)) {
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(chunkKey(key, i));
    }
  }
  await SecureStore.deleteItemAsync(key);
}

async function getItem(key: string): Promise<string | null> {
  const count = Number(await SecureStore.getItemAsync(key));
  if (!Number.isInteger(count) || count <= 0) return null;

  const chunks: string[] = [];
  for (let i = 0; i < count; i++) {
    const chunk = await SecureStore.getItemAsync(chunkKey(key, i));
    if (chunk === null) return null;
    chunks.push(chunk);
  }
  return chunks.join('');
}

async function setItem(key: string, value: string): Promise<void> {
  await removeItem(key);
  const count = Math.ceil(value.length / CHUNK_SIZE);
  for (let i = 0; i < count; i++) {
    await SecureStore.setItemAsync(
      chunkKey(key, i),
      value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
    );
  }
  await SecureStore.setItemAsync(key, String(count));
}

/** Storage adapter for Supabase Auth backed by expo-secure-store (rules.md §4.6). */
export const secureStorage = { getItem, setItem, removeItem };
