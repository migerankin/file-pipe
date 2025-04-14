import { FILE_TYPE } from '../assets/data/data_test.js';
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
 * 获取模型数据
 * @param {string} searchText - 搜索文本
 * @param {Array} selectedTags - 选中的标签
 * @param {Array} mykeys - 要获取的模型的key数组
 * @returns {Promise<Array>} 过滤后的模型数据
 */
export async function getModelsData(searchText = '', selectedTags = []) {
    try {
        // 发送请求获取数据
        const response = await service.post('/allmodel');

        // 获取接口返回的数据
        let filteredData = response.data.data;

        // 根据搜索文本筛选
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filteredData = filteredData.filter(item =>
                item.title.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower)
            );
        }

        // 根据选中的标签筛选
        if (selectedTags.length > 0) {
            filteredData = filteredData.filter(item =>
                selectedTags.some(tag => JSON.parse(item.file_type).includes(tag))
            );
        }
        return {
            ...response.data,
            data: filteredData
        };

    } catch (error) {
        // console.error('用户信息请求失败:', error);

        return {
            code: 500,
            message: '网络请求失败，请检查服务器连接'
        };
    }
}

/**
 * 上传模板
 */
export const uploadModel = async (data) => {
    return service.post('/uploadmodel', data)
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
 * 删除模板
 */
export const deleteModel = async (data) => {
    return service.post('/deletemodel', data)
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
 * 更新模板
 */
export const editModel = async (data) => {
    return service.post('/editmodel', data)
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
 * 更新模板信息
 * @param {Object} data 更新数据
 * @param {string} data.id 用户ID
 * @param {string} data.mykey 模板唯一标识
 * @param {string} data.title 模板标题
 * @param {string} data.description 模板描述
 * @param {string} data.instructions 使用说明
 * @param {string} data.cover_img 封面图片
 * @param {number} data.last_update 最后更新时间
 * @param {string} [data.file] 更新的JSON文件内容（可选）
 * @param {string} [data.file_type] 文件类型（可选，JSON字符串）
 * @param {string} [data.transform_type] 转换类型（可选，JSON字符串）
 * @returns {Promise}
 */
export function updateModel(data) {
    return axios.post('/updateModel', data)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            // console.error('更新模板失败:', error);
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
 * 获取所有可用的标签
 * @returns {Array} 标签列表
 */
export function getAvailableTags() {
    return FILE_TYPE;
} 