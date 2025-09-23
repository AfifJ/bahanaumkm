import { useEffect } from 'react'

const ScrollToTop = () => {
    useEffect(() => {
        window.scrollTo({
            top: 0,
        });
    }, []);
    return (
        <></>
    )
}

export default ScrollToTop