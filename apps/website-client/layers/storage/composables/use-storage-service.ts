import { StorageKey } from '../types';

export interface StorageService {
  set(key: StorageKey, value: string): void;
  delete(key: StorageKey): void;
  has(key: StorageKey): boolean;
  get(key: StorageKey): string | null;
  getOrThrow(key: StorageKey): string;
}

export function useStorageService(): StorageService {
  function set(key: StorageKey, value: string): void {
    if (import.meta.client) {
      localStorage.setItem(key, value);
    }
  }

  function del(key: StorageKey): void {
    if (import.meta.client) {
      localStorage.removeItem(key);
    }
  }

  function has(key: StorageKey): boolean {
    if (import.meta.client) {
      return localStorage.getItem(key) !== null;
    }

    return false;
  }

  function get(key: StorageKey): string | null {
    if (import.meta.client) {
      return localStorage.getItem(key);
    }

    return null;
  }

  function getOrThrow(key: StorageKey): string {
    if (import.meta.client) {
      const value: string | null = localStorage.getItem(key);

      if (value === null) {
        throw new Error(`Storage key ${key} not found`);
      }

      return value;
    }

    throw new Error('Cannot access storage on server');
  }

  return { set, delete: del, has, get, getOrThrow };
}
