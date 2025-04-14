import axios from 'axios';

// 创建axios实例
const service = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 5000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * 用户注册
 */
export function register(data) {
    return service.post('/register', data)
        .then(response => {
            // console.log(response.data);
            return response.data;
        })
        .catch(error => {
            // console.error('注册请求失败:', error);
            if (error.response) {
                return error.response.data;
            }
            return {
                code: 500,
                message: '网络请求失败，请检查服务器连接'
            };
        });
}
/**
 * 用户登
 */
export function log(data) {
    return service.post('/log', data)
        .then(response => {
            // console.log(response.data);
            return response.data;
        })
        .catch(error => {
            // console.error('登录请求失败:', error);
            if (error.response) {
                return error.response.data;
            }
            return {
                code: 500,
                message: '网络请求失败，请检查服务器连接'
            };
        });
}
/**
 * 获取用户数据
 */
export const getUserData = async (id = null) => {
    return service.post('/userdata', id)
        .then(response => {
            // console.log(response.data);
            return response.data;
        })
        .catch(error => {
            // console.error('用户信息请求失败:', error);
            if (error.response) {
                return error.response.data;
            }
            return {
                code: 500,
                message: '网络请求失败，请检查服务器连接'
            };
        });
};
/**
 * 更改用户信息
 */
export const uploadUsername = async (data) => {
    return service.post('/uploadusername', data)
        .then(response => {
            // console.log(response.data);
            return response.data;
        })
        .catch(error => {
            // console.error('用户信息请求失败:', error);
            if (error.response) {
                return error.response.data;
            }
            return {
                code: 500,
                message: '网络请求失败，请检查服务器连接'
            };
        });
};
/**
 * 收藏/取消收藏模板
 */
export const collectModel = async (data) => {
    return service.post('/collectmodel', data)
        .then(response => {
            // console.log(response.data);
            return response.data;
        })
        .catch(error => {
            // console.error('用户信息请求失败:', error);
            if (error.response) {
                return error.response.data;
            }
            return {
                code: 500,
                message: '网络请求失败，请检查服务器连接'
            };
        });
};