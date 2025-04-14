export const UNIT_CONFIG = {
    path: 'path', // 文件路径
    input: 'input', // 输入
    textarea: 'textarea', // 文本域输入
    select: 'select', // 选择
    file: 'file' // 文件
}

export const UNIT_TYPE = {
    input: 'input',
    process: 'process',
    output: 'output'
}

export const DATA_CIRCLE_ID = {
    input: 'input',
    output: 'output'
}

export const FILE_TYPE = {
    txt: 'TXT',
    img: 'IMG', // jpg、png
    audio: 'MP3', // mp3
    video: 'MP4', // mp4
    xlsx: 'XLSX', // xlsx
    pdf: 'PDF', // pdf
    json: 'JSON', // json
    folder: 'FOLDER', // 文件夹
    none: 'NONE', // 无
}

export const FILE_TYPE_COLOR = {
    [FILE_TYPE.txt]: '#8899aa',
    [FILE_TYPE.img]: '#ffa931',
    [FILE_TYPE.audio]: '#b39ddb',
    [FILE_TYPE.video]: '#ff9cf9',
    [FILE_TYPE.xlsx]: '#16d46b',
    [FILE_TYPE.pdf]: '#f61b14',
    [FILE_TYPE.json]: '#0084c8',
    [FILE_TYPE.folder]: '#ffe68b',
    [FILE_TYPE.none]: '#252525',
}

export const UNIT_NAMES = [
    // 文件输入
    {
        type: UNIT_TYPE.input,
        defaultPosition: { x: 0, y: 0 },
        path: '/start/from_localfile',
        en: "InputLocalFile",
        zh: "本地文件",
        component: "InputLocalFile",
        description: "读取本地文件作为输入",
        transform: [],
        config: [{
            type: UNIT_CONFIG.file,
            fileType: FILE_TYPE.none,
            val: "",
            des: "",
            options: [],
            required: true
        }],
        circleInput: [],
        circleOutput: [
            {
                type: FILE_TYPE.txt,
                color: FILE_TYPE_COLOR[FILE_TYPE.txt]
            },
            {
                type: FILE_TYPE.img,
                color: FILE_TYPE_COLOR[FILE_TYPE.img]
            },
            {
                type: FILE_TYPE.audio,
                color: FILE_TYPE_COLOR[FILE_TYPE.audio]
            },
            {
                type: FILE_TYPE.video,
                color: FILE_TYPE_COLOR[FILE_TYPE.video]
            },
            {
                type: FILE_TYPE.xlsx,
                color: FILE_TYPE_COLOR[FILE_TYPE.xlsx]
            },
            {
                type: FILE_TYPE.pdf,
                color: FILE_TYPE_COLOR[FILE_TYPE.pdf]
            },
            {
                type: FILE_TYPE.json,
                color: FILE_TYPE_COLOR[FILE_TYPE.json]
            }
        ]
    },
    // 文件输入
    // {
    //     type: UNIT_TYPE.input,
    //     defaultPosition: { x: 0, y: 0 },
    //     path: '',
    //     en: "InputFolder",
    //     zh: "文件夹",
    //     component: "InputFolder",
    //     description: "读取本地文件夹作为输入",
    //     transform: [],
    //     config: [{
    //         type: UNIT_CONFIG.path,
    //         fileType: FILE_TYPE.folder,
    //         val: "",
    //         des: "",
    //         options: [],
    //         required: true
    //     }],
    //     circleInput: [],
    //     circleOutput: [
    //         {
    //             type: FILE_TYPE.folder,
    //             color: FILE_TYPE_COLOR[FILE_TYPE.folder]
    //         }
    //     ]
    // },
    // 文本域输入
    {
        type: UNIT_TYPE.input,
        defaultPosition: { x: 0, y: 0 },
        path: '/start/from_textarea',
        en: "InputTextArea",
        zh: "文本域",
        component: "InputTextArea",
        description: "在文本域中手动输入文本",
        transform: [],
        config: [{
            type: UNIT_CONFIG.textarea,
            val: "",
            des: "",
            options: [],
            required: true
        }],
        circleInput: [],
        circleOutput: [
            {
                type: FILE_TYPE.txt,
                color: FILE_TYPE_COLOR[FILE_TYPE.txt]
            }
        ]
    },

    // 英汉翻译
    {
        type: UNIT_TYPE.process,
        defaultPosition: { x: 0, y: 0 },
        path: '/text2text/translator',
        en: "TranslationEnglishChinese",
        zh: "英汉翻译",
        component: "TranslationEnglishChinese",
        description: "将中英文本相互转换",
        transform: [FILE_TYPE.txt, FILE_TYPE.txt],
        config: [
            {
                type: UNIT_CONFIG.select,
                des: "翻译方向",
                val: "zh_en",
                options: [
                    { label: "中译英", value: "zh_en" },
                    { label: "英译中", value: "en_zh" },
                ],
            },
        ],
        circleInput: [
            {
                type: FILE_TYPE.txt,
                color: FILE_TYPE_COLOR[FILE_TYPE.txt]
            }
        ],
        circleOutput: [
            {
                type: FILE_TYPE.txt,
                color: FILE_TYPE_COLOR[FILE_TYPE.txt]
            }
        ]
    },
    // 语音识别
    {
        type: UNIT_TYPE.process,
        defaultPosition: { x: 0, y: 0 },
        path: '/voice2text/do',
        en: "SpeechRecognition",
        zh: "语音识别",
        component: "SpeechRecognition",
        description: "将人声转化为文字",
        transform: [FILE_TYPE.audio, FILE_TYPE.txt],
        config: [],
        circleInput: [
            {
                type: FILE_TYPE.audio,
                color: FILE_TYPE_COLOR[FILE_TYPE.audio]
            }
        ],
        circleOutput: [
            {
                type: FILE_TYPE.txt,
                color: FILE_TYPE_COLOR[FILE_TYPE.txt]
            }
        ]
    },
    // 语音生成
    {
        type: UNIT_TYPE.process,
        defaultPosition: { x: 0, y: 0 },
        path: '/text2voice/do',
        en: "SpeechGeneration",
        zh: "语音生成",
        component: "SpeechGeneration",
        description: "将文字转化为AI人声",
        transform: [FILE_TYPE.txt, FILE_TYPE.audio],
        config: [],
        circleInput: [
            {
                type: FILE_TYPE.txt,
                color: FILE_TYPE_COLOR[FILE_TYPE.txt]
            }
        ],
        circleOutput: [
            {
                type: FILE_TYPE.audio,
                color: FILE_TYPE_COLOR[FILE_TYPE.audio]
            }
        ]
    },
    // 图片识别物体标注
    {
        type: UNIT_TYPE.process,
        defaultPosition: { x: 0, y: 0 },
        path: '/img2text/imgrecognition',
        en: "PictureToAnnotation",
        zh: "图片识别",
        component: "PictureToAnnotation",
        description: "识别并框选标注图片中的物体",
        transform: [FILE_TYPE.img, FILE_TYPE.img],
        config: [],
        circleInput: [
            {
                type: FILE_TYPE.img,
                color: FILE_TYPE_COLOR[FILE_TYPE.img]
            }
        ],
        circleOutput: [
            {
                type: FILE_TYPE.img,
                color: FILE_TYPE_COLOR[FILE_TYPE.img]
            }
        ]
    },
    // 图片识别文字
    {
        type: UNIT_TYPE.process,
        defaultPosition: { x: 0, y: 0 },
        path: '/img2text/textrecognition',
        en: "PictureToText",
        zh: "图片识别",
        component: "PictureToText",
        description: "识别图片中的文字字符",
        transform: [FILE_TYPE.img, FILE_TYPE.txt],
        config: [],
        circleInput: [
            {
                type: FILE_TYPE.img,
                color: FILE_TYPE_COLOR[FILE_TYPE.img]
            }
        ],
        circleOutput: [
            {
                type: FILE_TYPE.txt,
                color: FILE_TYPE_COLOR[FILE_TYPE.txt]
            }
        ]
    },
    // API请求
    {
        type: UNIT_TYPE.process,
        defaultPosition: { x: 0, y: 0 },
        path: '',
        en: "SendApiRequest",
        zh: "发送API请求",
        component: "SendApiRequest",
        description: "发送API请求获取JSON数据",
        transform: [FILE_TYPE.none, FILE_TYPE.json],
        config: [{
            type: UNIT_CONFIG.input,
            val: "",
            des: "请输入API地址...",
            options: [],
            required: true
        }, {
            type: UNIT_CONFIG.select,
            val: "",
            des: "请求方式",
            options: [
                {
                    value: 'get',
                    label: 'GET'
                },
                {
                    value: 'post',
                    label: 'POST'
                }
            ],
            required: true
        }, {
            type: UNIT_CONFIG.textarea,
            val: "",
            des: "请输入请求体...",
            options: [],
            required: false
        }, {
            type: UNIT_CONFIG.textarea,
            val: "",
            des: "请输入Cookie...",
            options: [],
            required: false
        }, {
            type: UNIT_CONFIG.textarea,
            val: "",
            des: "请输入请求头...",
            options: [],
            required: false
        }],
        circleInput: [],
        circleOutput: [
            {
                type: FILE_TYPE.json,
                color: FILE_TYPE_COLOR[FILE_TYPE.json]
            }
        ]
    },
    // JSON数据解析
    {
        type: UNIT_TYPE.process,
        defaultPosition: { x: 0, y: 0 },
        path: '',
        en: "JSONDataParsing",
        zh: "JSON数据解析",
        component: "JSONDataParsing",
        description: "解析JSON数据存入表格文件",
        transform: [FILE_TYPE.json, FILE_TYPE.xlsx],
        config: [
            {
                type: UNIT_CONFIG.input,
                val: "",
                des: "请输入需要解析的JSON节点...",
                options: [],
                required: true
            },
            {
                type: UNIT_CONFIG.select,
                val: "",
                des: "节点类型",
                options: [
                    {
                        value: 'string',
                        label: '字符串'
                    },
                    {
                        value: 'object',
                        label: '对象'
                    }
                ],
                required: true
            },
            {
                type: UNIT_CONFIG.select,
                val: "",
                des: "添加序号",
                options: [
                    {
                        value: 'xlsx_num_true',
                        label: '是'
                    },
                    {
                        value: 'xlsx_num_false',
                        label: '否'
                    }
                ],
                required: true
            },
            {
                type: UNIT_CONFIG.select,
                val: "",
                des: "添加当前日期",
                options: [
                    {
                        value: 'xlsx_date_true',
                        label: '是'
                    },
                    {
                        value: 'xlsx_date_false',
                        label: '否'
                    }
                ],
                required: true
            }
        ],
        circleInput: [
            {
                type: FILE_TYPE.json,
                color: FILE_TYPE_COLOR[FILE_TYPE.json]
            }
        ],
        circleOutput: [
            {
                type: FILE_TYPE.xlsx,
                color: FILE_TYPE_COLOR[FILE_TYPE.xlsx]
            },
            {
                type: FILE_TYPE.txt,
                color: FILE_TYPE_COLOR[FILE_TYPE.txt]
            }
        ]
    },


    // 文件输出
    {
        type: UNIT_TYPE.output,
        defaultPosition: { x: 0, y: 0 },
        path: '/end/to_path',
        en: "OutputLocalFile",
        zh: "本地目录",
        component: "OutputLocalFile",
        description: "将处理结果保存至本地目录中",
        transform: [],
        config: [{
            type: UNIT_CONFIG.path,
            val: "",
            des: "",
            options: [],
            required: true
        }],
        circleInput: [
            {
                type: FILE_TYPE.txt,
                color: FILE_TYPE_COLOR[FILE_TYPE.txt]
            },
            {
                type: FILE_TYPE.img,
                color: FILE_TYPE_COLOR[FILE_TYPE.img]
            },
            {
                type: FILE_TYPE.audio,
                color: FILE_TYPE_COLOR[FILE_TYPE.audio]
            },
            {
                type: FILE_TYPE.video,
                color: FILE_TYPE_COLOR[FILE_TYPE.video]
            },
            {
                type: FILE_TYPE.xlsx,
                color: FILE_TYPE_COLOR[FILE_TYPE.xlsx]
            },
            {
                type: FILE_TYPE.pdf,
                color: FILE_TYPE_COLOR[FILE_TYPE.pdf]
            },
            {
                type: FILE_TYPE.json,
                color: FILE_TYPE_COLOR[FILE_TYPE.json]
            },
            {
                type: FILE_TYPE.folder,
                color: FILE_TYPE_COLOR[FILE_TYPE.folder]
            }
        ],
        circleOutput: []
    },
    // 通知
    {
        type: UNIT_TYPE.output,
        defaultPosition: { x: 0, y: 0 },
        path: '/end/to_notification',
        en: "OutputNotification",
        zh: "通知提醒",
        component: "OutputNotification",
        description: "文本输出至电脑通知",
        transform: [],
        config: [{
            type: UNIT_CONFIG.input,
            val: "",
            des: "通知标题",
            options: [],
            required: true
        }],
        circleInput: [
            {
                type: FILE_TYPE.txt,
                color: FILE_TYPE_COLOR[FILE_TYPE.txt]
            }
        ],
        circleOutput: []
    },
]