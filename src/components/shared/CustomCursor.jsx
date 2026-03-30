import { useEffect, useRef } from 'react';

const CustomCursor = () => {
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        let mx = 0, my = 0, cx = 0, cy = 0;
        let animId;

        const onMouseMove = (e) => {
            mx = e.clientX;
            my = e.clientY;
        };

        const loop = () => {
            cx += (mx - cx) * 0.12;
            cy += (my - cy) * 0.12;
            cursor.style.left = cx - 14 + 'px'; // center the 28px circle
            cursor.style.top  = cy - 14 + 'px';
            animId = requestAnimationFrame(loop);
        };

        loop();
        document.addEventListener('mousemove', onMouseMove);

        // Big cursor on interactive elements
        const targets = document.querySelectorAll('a, button, h1, h2, h3, select, input, textarea, [role="button"]');
        const addBig    = () => cursor.classList.add('cursor-big');
        const removeBig = () => cursor.classList.remove('cursor-big');

        targets.forEach(el => {
            el.addEventListener('mouseenter', addBig);
            el.addEventListener('mouseleave', removeBig);
        });

        // Also handle dynamically added elements via delegation
        const delegateIn  = (e) => { if (e.target.closest('a, button, h1, h2, h3, select, input, textarea, [role="button"]')) addBig(); };
        const delegateOut = (e) => { if (e.target.closest('a, button, h1, h2, h3, select, input, textarea, [role="button"]')) removeBig(); };
        document.addEventListener('mouseover',  delegateIn);
        document.addEventListener('mouseout',   delegateOut);

        // Hide on leave, show on enter
        const hideCursor = () => cursor.classList.add('cursor-hidden');
        const showCursor = () => cursor.classList.remove('cursor-hidden');
        document.addEventListener('mouseleave', hideCursor);
        document.addEventListener('mouseenter', showCursor);

        return () => {
            cancelAnimationFrame(animId);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover',  delegateIn);
            document.removeEventListener('mouseout',   delegateOut);
            document.removeEventListener('mouseleave', hideCursor);
            document.removeEventListener('mouseenter', showCursor);
            targets.forEach(el => {
                el.removeEventListener('mouseenter', addBig);
                el.removeEventListener('mouseleave', removeBig);
            });
        };
    }, []);

    return <div ref={cursorRef} id="custom-cursor" />;
};

export default CustomCursor;