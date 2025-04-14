'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { promises as fs } from 'fs'
const fsSync = require('fs')  // 添加这行，用于同步操作
const { spawn } = require('child_process')
const path = require('path')
const isDevelopment = process.env.NODE_ENV !== 'production'
const https = require('https')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    icon: path.join(__dirname, './public/logo.ico'),
    width: 1450,
    height: 1000,
    minWidth: 1450,
    minHeight: 1000,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  // Remove the menu bar
  win.removeMenu()

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// 修改现有的 select-file 处理器为 select-folder
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return {
    ...result,
    fileType: 'folder'
  };
});

// 添加新的文件选择处理器
ipcMain.handle('select-file', async (event, fileType) => {
  // 根据文件类型设置过滤器
  let filters = [{ name: 'All Files', extensions: ['*'] }];

  if (fileType !== 'NONE') {
    switch (fileType) {
      case 'TXT':
        filters = [{ name: 'Text Files', extensions: ['txt'] }];
        break;
      case 'IMG':
        filters = [{ name: 'Image Files', extensions: ['jpg', 'jpeg', 'png'] }];
        break;
      case 'MP3':
        filters = [{ name: 'Audio Files', extensions: ['mp3', 'wav'] }];
        break;
      case 'MP4':
        filters = [{ name: 'Video Files', extensions: ['mp4'] }];
        break;
      case 'XLSX':
        filters = [{ name: 'Excel Files', extensions: ['xlsx'] }];
        break;
      case 'PDF':
        filters = [{ name: 'PDF Files', extensions: ['pdf'] }];
        break;
      case 'JSON':
        filters = [{ name: 'JSON Files', extensions: ['json'] }];
        break;
    }
    // 添加 All Files 选项
    filters.push({ name: 'All Files', extensions: ['*'] });
  }

  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: filters
  });

  // 获取文件扩展名并确定文件类型
  let resultFileType = 'NONE';
  if (result.filePaths.length > 0) {
    const ext = result.filePaths[0].split('.').pop().toLowerCase();
    switch (ext) {
      case 'txt':
        resultFileType = 'TXT';
        break;
      case 'mp3':
      case 'wav':
        resultFileType = 'MP3';
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
        resultFileType = 'IMG';
        break;
      case 'mp4':
        resultFileType = 'MP4';
        break;
      case 'xlsx':
        resultFileType = 'XLSX';
        break;
      case 'pdf':
        resultFileType = 'PDF';
        break;
      case 'json':
        resultFileType = 'JSON';
        break;
    }
  }

  return {
    ...result,
    fileType: resultFileType
  };
});

// 修改 getScriptPath 函数
function getScriptPath(scriptPath) {
  if (process.env.NODE_ENV === 'development') {
    // 开发环境下使用项目根目录
    return path.join(__dirname, '../..', scriptPath)
  } else {
    // 生产环境下使用打包后的资源目录
    return path.join(app.getAppPath(), '..', 'utils', scriptPath.replace('utils/', ''))
  }
}

// 添加 IPC 处理程序
ipcMain.handle('run-python', async (event, { script, args = [] }) => {
  return new Promise((resolve, reject) => {
    if (!script) {
      reject(new Error('Script path is required'))
      return
    }

    const scriptPath = getScriptPath(script)
    // console.log('Running script:', scriptPath)

    // 检查文件是否存在
    if (!require('fs').existsSync(scriptPath)) {
      reject(new Error(`Script not found: ${scriptPath}`))
      return
    }
    const lasttime = Date.now();
    const pythonProcess = spawn('python', [scriptPath, ...(args || [])])

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data
      // console.log('Python stdout:', data.toString())
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data
      // console.error('Python stderr:', data.toString())
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
        console.log('耗时：', Date.now() - lasttime);
      } else {
        reject(new Error(`Python script failed with code ${code}\n${stderr}`))
      }
    })
  })
})

// 检查模型文件是否存在
ipcMain.handle('check-model-exists', async (event, modelPath) => {
  try {
    let fullPath;
    if (process.env.NODE_ENV === 'development') {
      // 开发环境下使用项目根目录
      fullPath = path.join(__dirname, '../../models_pyuse', modelPath);
    } else {
      // 生产环境下使用打包后的资源目录
      fullPath = path.join(app.getAppPath(), '../models_pyuse', modelPath);
    }

    console.log('Checking model path:', fullPath);
    await fs.access(fullPath);
    return true;
  } catch (error) {
    console.log('Model not found:', error);
    return false;
  }
});

// 下载模型文件
ipcMain.handle('download-model', async (event, { url, path: modelPath }) => {
  return new Promise((resolve, reject) => {
    let fullPath;
    if (process.env.NODE_ENV === 'development') {
      fullPath = path.join(__dirname, '../../models_pyuse', modelPath);
    } else {
      fullPath = path.join(app.getAppPath(), '../models_pyuse', modelPath);
    }

    console.log('Downloading model to:', fullPath);
    const dir = path.dirname(fullPath);

    // 使用 fs.promises 创建目录
    fs.mkdir(dir, { recursive: true })
      .then(() => {
        // 使用普通的 fs 创建写入流
        const file = fsSync.createWriteStream(fullPath);

        https.get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`));
            return;
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve();
          });

          file.on('error', (err) => {
            fsSync.unlink(fullPath, () => reject(err));
          });
        }).on('error', (err) => {
          fsSync.unlink(fullPath, () => reject(err));
        });
      })
      .catch(reject);
  });
});

// 删除模型文件
ipcMain.handle('delete-model', async (event, modelPath) => {
  try {
    let fullPath;
    if (process.env.NODE_ENV === 'development') {
      fullPath = path.join(__dirname, '../../models_pyuse', modelPath);
    } else {
      fullPath = path.join(app.getAppPath(), '../models_pyuse', modelPath);
    }

    console.log('Deleting model from:', fullPath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.log('Delete model failed:', error);
    throw error; // 重新抛出错误以便前端捕获
  }
});

ipcMain.handle('check-python', async () => {
  return new Promise((resolve, reject) => {
    const process = spawn('python', ['--version']);

    let stdout = '';
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    let stderr = '';
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        // Python 已安装，返回版本信息
        const version = stdout.trim() || stderr.trim();
        resolve(version);
      } else {
        // Python 未安装或出错
        reject(new Error('Python not found'));
      }
    });
  });
});

ipcMain.handle('check-python-lib', async (event, libName) => {
  return new Promise((resolve, reject) => {
    const script = `
import importlib
import pkg_resources
try:
    importlib.import_module('${libName}')
    try:
        version = pkg_resources.get_distribution('${libName}').version
        print(version)
    except:
        print("Unknown")
except ImportError:
    exit(1)
`;

    const process = spawn('python', ['-c', script]);

    let stdout = '';
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        // 库已安装
        resolve(stdout.trim() || 'Unknown');
      } else {
        // 库未安装
        reject(new Error(`${libName} not installed`));
      }
    });
  });
});

// 添加 IPC 处理器
ipcMain.handle('get-similar-files', async (event, filePath) => {
  try {
    // 获取目录和文件扩展名
    const directory = path.dirname(filePath);
    const extension = path.extname(filePath);

    // 使用 Promise 包装 fs.readdir
    const files = await new Promise((resolve, reject) => {
      fs.readdir(directory, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    // 过滤出相同后缀的文件并构建完整路径
    const similarFiles = files
      .filter(file => path.extname(file).toLowerCase() === extension.toLowerCase())
      .map(file => path.join(directory, file));

    return similarFiles;
  } catch (error) {
    throw new Error(`无法读取文件夹: ${error.message}`);
  }
});

// 获取配置文件路径
function getConfigPath() {
  if (process.env.NODE_ENV === 'development') {
    // 开发环境下使用项目根目录
    return path.join(__dirname, '../src/config.json');
  } else {
    // 生产环境下使用打包后的资源目录
    return path.join(app.getAppPath(), './config.json');
  }
}

// 获取用户信息文件路径
function getUserInfoPath() {
  if (process.env.NODE_ENV === 'development') {
    // 开发环境下使用项目根目录
    return path.join(__dirname, '../src/user.json');
  } else {
    // 生产环境下使用打包后的资源目录
    return path.join(app.getAppPath(), './user.json');
  }
}

// 读取用户信息
ipcMain.handle('get-user-info', async () => {
  try {
    const userPath = getUserInfoPath();
    const data = await fs.readFile(userPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取用户信息失败:', error);
    return {
      islogin: false,
      id: null,
      avatar: "",
      username: "",
    };
  }
});

// 更新用户信息
ipcMain.handle('update-user-info', async (event, userData) => {
  try {
    const userPath = getUserInfoPath();
    await fs.writeFile(userPath, JSON.stringify(userData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
});

// 读取配置
ipcMain.handle('get-configs', async () => {
  try {
    const configPath = getConfigPath();
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取配置失败:', error);
    return {};
  }
});

// 更新配置
ipcMain.handle('update-config', async (event, { key, value }) => {
  try {
    const configPath = getConfigPath();
    let config = {};

    try {
      const data = await fs.readFile(configPath, 'utf8');
      config = JSON.parse(data);
    } catch (error) {
      console.error('读取配置文件失败:', error);
      // 如果文件不存在，创建一个新的配置文件
      await fs.writeFile(configPath, JSON.stringify({}, null, 2));
    }

    config[key] = value;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log('配置已更新:', configPath, config); // 添加日志
    return true;
  } catch (error) {
    console.error('更新配置失败:', error);
    throw error;
  }
});

// 打开输出文件夹
// ipcMain.handle('open-output-folder', async () => {
//   const outputPath = path.join(app.getAppPath(), '../output');
//   await shell.openPath(outputPath);
// });

// 处理保存文件对话框
ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog({
    ...options,
    properties: ['createDirectory']
  });
  return result;
});

// 处理文件保存
ipcMain.handle('save-file', async (event, { filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('保存文件失败:', error);
    throw error;
  }
});

// 处理打开文件对话框
ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result;
});

// 处理文件读取
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('读取文件失败:', error);
    throw error;
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
