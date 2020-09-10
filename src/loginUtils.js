export const getCookieValue = (name) => {
    if (!document.cookie) {
        return;
    }
    const cookies = document.cookie.split(';');
    const keyvalpairs = cookies.map(cookie => {
        const [cookieName, value] = cookie.split('=');
        return { name: cookieName.trim(), value };
    });
    const cookie = keyvalpairs.find(pair => pair.name === name);
    if (cookie) {
        return cookie.value;
    }
};

export const checkRegistration = () => {
    const hash = getCookieValue('user');
    // user cookie exists
    if (hash) {
        return fetch(`/cookieSignon/${hash}`)
            .catch(err => {
                rej({ error: 'fetch failed', err });
            });
    }
    // no cookie, signin/signup
    return new Promise((res, rej) => {
        rej({ noop: 1 })
    });
}