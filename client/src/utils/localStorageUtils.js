
const USER_TOKEN_KEY = 'user_token';

const setToken = (username, token) => {
    localStorage.setItem(username, token);
};

const getToken = (username) => {
    return localStorage.getItem(username);
};

const removeToken = (username) => {
    localStorage.removeItem(username);
};

export {
    setToken,
    getToken,
    removeToken,
}