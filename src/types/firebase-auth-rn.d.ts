import type { Persistence } from 'firebase/auth';

// Metro resolves `firebase/auth` to the React Native build, which exports
// getReactNativePersistence, but the package's default typings omit it.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
