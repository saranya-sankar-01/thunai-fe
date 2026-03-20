import {debounce,DebouncedFunc} from "lodash"
import { useEffect, useMemo, useRef } from "react"
export const useDebounceFn = <T extends (...args:any[]) =>any>(fn:T, delay: number = 500):DebouncedFunc<T> => {
    const funcRef = useRef(fn);

    useEffect(() => {
        funcRef.current = fn;
    },[fn]);

    const debouncedFn = useMemo(() => {
        const wrapper = (...args: Parameters<T>) => {
            funcRef.current(...args)
        }
        return debounce(wrapper, delay)
    }, [delay])

    useEffect(() => {
        return () => debouncedFn.cancel()
    }, [debouncedFn]);

    return debouncedFn;
} 