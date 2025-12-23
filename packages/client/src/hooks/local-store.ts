import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { z } from 'zod';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

// In-memory cache to store the parsed and validated values.
const valueCache = new Map<string, unknown>();
// Map to store listeners for each localStorage key
const listeners = new Map<string, Set<() => void>>();

/**
 * Dispatches a change event to all listeners for a given key.
 * @param {string} key - The localStorage key that has changed.
 */
function emitChange(key: string) {
    const keyListeners = listeners.get(key);
    if (keyListeners) {
        keyListeners.forEach((callback) => callback());
    }
}

/**
 * A custom hook to synchronize state with localStorage.
 *
 * @param key The key for the localStorage item.
 * @param initialValue The initial value to use if none is found in localStorage.
 * @param schema An optional Zod schema for validation.
 * @returns A tuple containing the current value and a function to update it.
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
    schema?: z.ZodType<T>
): [T, SetValue<T>] {
    const getSnapshot = useCallback(() => {
        return (valueCache.get(key) as T) ?? initialValue;
    }, [key, initialValue]);

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            if (!listeners.has(key)) {
                listeners.set(key, new Set());
            }
            listeners.get(key)!.add(onStoreChange);

            return () => {
                listeners.get(key)?.delete(onStoreChange);
            };
        },
        [key]
    );

    const storedValue = useSyncExternalStore(
        subscribe,
        getSnapshot,
        () => initialValue // Server snapshot
    );

    const setValue: SetValue<T> = useCallback(
        (value) => {
            try {
                const currentValue = getSnapshot();
                const newValue = value instanceof Function ? value(currentValue) : value;

                if (schema) {
                    const result = schema.safeParse(newValue);
                    if (!result.success) {
                        console.warn(
                            `Zod validation failed when setting localStorage key “${key}”:`,
                            result.error
                        );
                        return; // Do not set invalid value
                    }
                }

                window.localStorage.setItem(key, JSON.stringify(newValue));
                valueCache.set(key, newValue); // Update the cache
                emitChange(key); // Notify listeners in the same tab
            } catch (error) {
                console.warn(`Error setting localStorage key “${key}”:`, error);
            }
        },
        [key, getSnapshot, schema]
    );

    // Effect to initialize value from localStorage and subscribe to cross-tab changes.
    useEffect(() => {
        const readAndCache = () => {
            try {
                const item = window.localStorage.getItem(key);
                if (item === null) {
                    // If no value is present, set the initial value.
                    window.localStorage.setItem(key, JSON.stringify(initialValue));
                    valueCache.set(key, initialValue);
                } else {
                    const parsedItem = JSON.parse(item);
                    if (schema) {
                        const result = schema.safeParse(parsedItem);
                        if (result.success) {
                            valueCache.set(key, result.data);
                        } else {
                            console.warn(
                                `Zod validation failed on init for localStorage key “${key}”:`,
                                result.error
                            );
                            valueCache.set(key, initialValue);
                        }
                    } else {
                        valueCache.set(key, parsedItem);
                    }
                }
                emitChange(key); // Notify that the value is ready
            } catch (error) {
                console.warn(`Error initializing localStorage key “${key}”:`, error);
                valueCache.set(key, initialValue);
                emitChange(key);
            }
        };

        // Initialize the value on first mount
        if (!valueCache.has(key)) {
            readAndCache();
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key) {
                readAndCache(); // Re-read and cache on cross-tab changes
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, initialValue, schema]);

    return [storedValue, setValue];
}
