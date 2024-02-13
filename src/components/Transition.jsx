import React from 'react'
import { animated, useSpring, useTransition } from '@react-spring/web'

const Transition = () => {
    const transitions = useSpring({
        from: { opacity: 0, transform: 'translate3d(100%, 0, 0)' },
        to: { opacity: 1, transform: 'translate3d(0%, 0, 0)' },
    });

    return transitions((style, item) => (
        <animated.div style={style}>{item}</animated.div>
    ));
};

export default Transition