if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/worker')
            .then((reg) => {
                console.log('Service worker registered.', reg);
            });
    });
}