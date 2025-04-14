const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
    transpileDependencies: true,
    chainWebpack: config => {
        config.plugins.delete('progress')
        config.plugins.delete('progress-bar')
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                extraResources: [
                    {
                        from: '../utils',
                        to: 'utils',
                        filter: ['**/*']
                    }
                ],
                files: [
                    "**/*"
                ],
                asar: true,
            }
        }
    }
}) 