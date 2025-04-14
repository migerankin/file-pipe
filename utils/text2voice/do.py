import os
import argparse
import pyttsx3

def read_file_content(file_path: str) -> str:
    """
    读取文件内容，支持直接读取文本文件或从.path文件中读取路径
    
    Args:
        file_path (str): 文件路径
        
    Returns:
        str: 文件内容
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            
        # 如果是.path文件，需要读取其中的路径并进一步读取内容
        if file_path.endswith('.path'):
            if not os.path.isfile(content):
                print(f"路径文件指向的文件不存在: {content}")
                return ""
                
            # 检查文件扩展名
            if not content.lower().endswith('.txt'):
                print(f"不支持的文件类型: {content}")
                return ""
                
            # 读取实际文件内容
            with open(content, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                
        return content
        
    except Exception as e:
        print(f"读取文件失败: {str(e)}")
        return ""

def text_to_speech(step: str, lang: str):
    """
    将文本转换为语音
    
    Args:
        step (str): 步骤序号
        lang (str): 语言类型，'en'为英语，'zh'为中文
    """
    try:
        # 构建输入输出文件路径
        base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../transfer')
        
        # 获取上一步的文件路径
        prev_step = str(int(step) - 1)
        input_txt = os.path.join(base_dir, f"{prev_step}.txt")
        input_path = os.path.join(base_dir, f"{prev_step}.path")
        
        # 优先尝试读取.txt文件，如果不存在则尝试.path文件
        if os.path.isfile(input_txt):
            text = read_file_content(input_txt)
        elif os.path.isfile(input_path):
            text = read_file_content(input_path)
        else:
            print(f"找不到输入文件: {input_txt} 或 {input_path}")
            return False
            
        if not text:
            print("输入文件为空")
            return False
            
        # 确保输出目录存在
        if not os.path.exists(base_dir):
            os.makedirs(base_dir)
            
        # 构建输出文件路径
        output_file = os.path.join(base_dir, f"{step}.mp3")
        
        # 初始化 pyttsx3 引擎
        engine = pyttsx3.init()

        # 设置中文语音（可能因系统不同需要手动设置voice）
        voices = engine.getProperty('voices')
        found_chinese_voice = False
        print("可用语音列表：")
        for idx, voice in enumerate(voices):
            try:
                print(f"{idx}: {voice.name}, id={voice.id}, langs={voice.languages}")
                # 兼容性判断
                langs = voice.languages if isinstance(voice.languages, list) else []
                if any('zh' in (lang.decode() if isinstance(lang, bytes) else str(lang)).lower() for lang in langs) or 'chinese' in voice.name.lower():
                    engine.setProperty('voice', voice.id)
                    found_chinese_voice = True
                    print(f"已选用中文语音: {voice.name}")
                    break
            except Exception as ve:
                print(f"跳过异常语音项: {str(ve)}")
        
        if not found_chinese_voice:
            print("未找到中文语音，使用默认语音")


        # 保存语音
        engine.save_to_file(text, output_file)
        engine.runAndWait()

        print(f"语音生成完成，已保存至: {output_file}")
        return True
        
    except Exception as e:
        print(f"生成语音时出错: {str(e)}")
        return False

def main():
    # 设置命令行参数解析器
    parser = argparse.ArgumentParser(description="文本转语音")
    parser.add_argument('step', help="步骤序号")
    # parser.add_argument('lang', help="语言类型 (en 或 zh)")
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 执行文本转语音
    text_to_speech(args.step, 'zh')

if __name__ == "__main__":
    main()
