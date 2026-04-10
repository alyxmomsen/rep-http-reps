import React, { useEffect, useState } from 'react';

function AnotherOnePage() {
    const [state, setState] = useState('hello world');

    useEffect(() => {
        alert();
    }, [state]);

    return (
        <div className="" style={{ color: 'red', backgroundColor: 'bisque' }}>
            <nav>
                <div>hello world</div>
            </nav>
        </div>
    );
}

export default AnotherOnePage;
