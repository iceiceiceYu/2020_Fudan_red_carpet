import axios from 'axios';
import {message} from 'antd/lib/index';


export const baseUrl = `https://yst.fudan.edu.cn/redCarpet/api`;
// export const baseUrl = `http://localhost:8080`; // local test

export const emptyFunction = () => {
};

const API = axios.create({
    baseURL: `${baseUrl}/admin`,
    withCredentials: true
});

API.onLogout = () => {
    console.log("logout");
};

API.interceptors.response.use(res => {
    console.log(res);
    if (res.data.msg !== "") {
        if (res.data.status === 1) {
            message.success(res.data.msg)
        } else {
            message.error(res.data.msg);
        }
        if (res.data.status === 0) {
            API.onLogout();
        }
    }
    return res;
}, err => {
    console.log(err);
    API.onLogout();
    return Promise.resolve(err);
});


export default API;