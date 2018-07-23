
const USER_TOKEN_KEY = 'user_token';

const setToken = (token) => {
    localStorage.setItem(USER_TOKEN_KEY, token);
};

const getToken = () => {
    return localStorage.getItem(USER_TOKEN_KEY);
};

const removeToken = () => {
    localStorage.removeItem(USER_TOKEN_KEY);
};

export {
    setToken,
    getToken,
    removeToken,
}