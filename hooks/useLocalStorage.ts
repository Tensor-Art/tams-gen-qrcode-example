import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'

const isServer = typeof window === 'undefined'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  opts?: {
    onSet?: (value: T) => void
  },
) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => initialValue)
  const [inited, setInited] = useState(false)

  const initialize = () => {
    if (isServer) {
      return initialValue
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
    }
  }

  /* prevents hydration error so that state is only initialized after server is defined */
  useEffect(() => {
    if (!isServer) {
      const result = initialize()
      setStoredValue(result)
      setInited(true)
      if (opts?.onSet) {
        opts.onSet(result)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value: T | ((v: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function
            ? (v: T) => {
                const ret = value(v)
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem(key, JSON.stringify(ret))
                }
                return ret
              }
            : () => {
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem(key, JSON.stringify(value))
                }
                return value
              }
        setStoredValue(valueToStore)
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error)
      }
    },
    [key],
  )

  return [storedValue, setValue, inited] as const
}
