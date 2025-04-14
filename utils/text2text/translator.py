import os
import argparse
from translate import Translator

def read_file_content(file_path: str) -> str:
    """
    读取文件内容，支持直接读取文本文件或从.path文件中读取路径
    
    Args:
        file_path (str): 文件路径
        
    Returns:
        str: 文件内容
        
    Raises:
        FileNotFoundError: 当文件不存在时
        ValueError: 当文件类型不支持时
        IOError: 当读取文件失败时
        Exception: 其他未预期的错误
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            
        # 如果是.path文件，需要读取其中的路径并进一步读取内容
        if file_path.endswith('.path'):
            if not os.path.isfile(content):
                raise FileNotFoundError(f"路径文件指向的文件不存在: {content}")
                
            # 检查文件扩展名
            if not content.lower().endswith('.txt'):
                raise ValueError(f"不支持的文件类型: {content}")
                
            # 读取实际文件内容
            with open(content, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                
        return content
        
    except FileNotFoundError as e:
        raise FileNotFoundError(f"文件不存在: {str(e)}")
    except ValueError as e:
        raise ValueError(f"文件类型错误: {str(e)}")
    except IOError as e:
        raise IOError(f"读取文件失败: {str(e)}")
    except Exception as e:
        raise Exception(f"未预期的错误: {str(e)}")

def translate_text(step: str, trans_type: str):
    """
    将文本文件中的内容进行中英互译
    
    Args:
        step (str): 步骤序号
        trans_type (str): 翻译类型，'zh_en'为中译英，'en_zh'为英译中
        
    Raises:
        FileNotFoundError: 当输入文件不存在时
        ValueError: 当翻译类型不支持或输入为空时
        IOError: 当读写文件失败时
        Exception: 翻译过程中的其他错误
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
            raise FileNotFoundError(f"找不到输入文件: {input_txt} 或 {input_path}")
            
        if not text:
            raise ValueError("输入文件为空")
            
        # 设置翻译器
        if trans_type == 'zh_en':
            translator = Translator(from_lang='zh', to_lang='en')
        elif trans_type == 'en_zh':
            translator = Translator(from_lang='en', to_lang='zh')
        else:
            raise ValueError(f"不支持的翻译类型: {trans_type}")
            
        # 执行翻译
        translated_text = translator.translate(text)
        
        # 确保输出目录存在
        if not os.path.exists(base_dir):
            os.makedirs(base_dir)
            
        # 写入翻译结果
        output_file = os.path.join(base_dir, f"{step}.txt")
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(translated_text)
            
        return True
        
    except FileNotFoundError as e:
        raise FileNotFoundError(f"文件访问错误: {str(e)}")
    except ValueError as e:
        raise ValueError(f"参数错误: {str(e)}")
    except IOError as e:
        raise IOError(f"文件读写错误: {str(e)}")
    except Exception as e:
        raise Exception(f"翻译过程中出错: {str(e)}")

def main():
    # 设置命令行参数解析器
    parser = argparse.ArgumentParser(description="中英文本互译")
    parser.add_argument('step', help="步骤序号")
    parser.add_argument('trans_type', help="翻译类型 (zh_en 或 en_zh)")
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 执行翻译
    translate_text(args.step, args.trans_type)

if __name__ == "__main__":
    main()
