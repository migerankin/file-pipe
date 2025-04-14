import argparse
import os
import jieba
import jieba.analyse
import jieba.posseg as pseg

def get_text_path(file_path: str) -> str:
    """
    获取文本文件路径，支持从.path文件中读取路径。

    Args:
        file_path (str): 文件路径。

    Returns:
        str: 文本文件路径，如果无效则返回空字符串。
    """
    try:
        print(f"获取文本文件路径: {file_path}")
        # 如果是.path文件，读取其中的路径
        if file_path.endswith('.path'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                
            # 检查路径是否存在且为txt文件
            if not os.path.isfile(content):
                print(f"路径文件指向的文件不存在: {content}")
                return ""
                
            if not content.lower().endswith('.txt'):
                print(f"不支持的文件类型: {content}")
                return ""
                
            return content
            
        # 如果是直接的txt文件
        elif file_path.endswith('.txt'):
            if os.path.isfile(file_path):
                return file_path
            print(f"文本文件不存在: {file_path}")
            return ""
            
        return ""
        
    except Exception as e:
        print(f"读取文件路径失败: {str(e)}")
        return ""
    
def process_text(step: str, kind: str):
    """
    从文本文件中读取内容并进行分析，根据 kind 参数执行关键词提取或分词，结果保存到 step.txt 文件中。

    Args:
        step (str): 当前步骤编号，用于构建输出文件名。
        kind (int): 分析类型，1 为关键词提取并输出权重与词性，2 为分词功能（搜索引擎模式）。
    """
    # 构建输入输出文件路径
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../transfer')
    
    # 获取上一步的文件路径
    prev_step = str(int(step) - 1)
    input_txt = os.path.join(base_dir, f"{prev_step}.txt")
    input_path = os.path.join(base_dir, f"{prev_step}.path")
    
    # 优先尝试读取.txt文件，如果不存在则尝试.path文件
    text_path = ""
    if os.path.isfile(input_txt):
        text_path = input_txt
    elif os.path.isfile(input_path):
        text_path = get_text_path(input_path)
        
    if not text_path:
        print(f"找不到有效的文本文件: {input_txt} 或 {input_path}")
        return False
    
    # 读取文本内容
    with open(text_path, 'r', encoding='utf-8') as f:
        text = f.read().strip()
    
    # 根据 kind 参数执行不同的分析
    if kind == "keyword":
        # 关键词提取并输出权重与词性
        keywords = jieba.analyse.extract_tags(text, topK=20, withWeight=True, allowPOS=('n', 'v', 'ns', 'vn', 'nz'))
        result = []
        for word, weight in keywords:
            # 获取词性
            pos = [flag for w, flag in pseg.lcut(word)][0]
            result.append(f"关键词: {word}, 权重: {weight:.4f}, 词性: {pos}")
        output = "\n".join(result)
    elif kind == "segment":
        # 分词功能（搜索引擎模式）
        words = jieba.lcut_for_search(text)
        output = " ".join(words)
    else:
        print(f"无效的 kind 参数: {kind}")
        return False
    
    # 构建输出文件路径
    output_file = os.path.join(base_dir, f"{step}.txt")
    
    # 将结果写入输出文件
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output)
    
    print(f"分析完成，结果已保存到: {output_file}")
    return True


def main():
    # 设置命令行参数解析器
    parser = argparse.ArgumentParser(description="文本摘要")
    parser.add_argument('step', help="步骤序号")
    parser.add_argument('kind', help="分析类型")
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 执行语音识别
    process_text(args.step, args.kind)

if __name__ == "__main__":
    main()