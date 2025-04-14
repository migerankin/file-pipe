import os
import argparse
import pandas as pd

def process_text(step: str) -> bool:
    """
    从文本文件中读取内容并解析为表格，保存为 Excel 文件。

    Args:
        step (str): 步骤序号，用于确定输入文件和输出文件路径。

    Returns:
        bool: 如果成功返回 True，否则返回 False。
    """
    # 构建输入输出文件路径
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../transfer')
    
    # 获取上一步的文件路径
    prev_step = str(int(step) - 1)
    input_txt = os.path.join(base_dir, f"{prev_step}.txt")
    input_path = os.path.join(base_dir, f"{prev_step}.path")
    
    # 优先尝试读取.txt文件，如果不存在则尝试.path文件
    text_file_path = ""
    if os.path.isfile(input_txt):
        text_file_path = input_txt
    elif os.path.isfile(input_path):
        text_file_path = get_text_path(input_path)
        
    if not text_file_path:
        print(f"找不到有效的文本文件: {input_txt} 或 {input_path}")
        return False

    # 读取文本文件内容
    try:
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text_data = f.read().strip()
    except Exception as e:
        print(f"读取文本文件失败: {str(e)}")
        return False

    # 解析文本数据
    lines = text_data.split('\n')
    data = []
    columns = set()

    # 检查每行的键是否一致
    first_line_keys = None

    for line in lines:
        try:
            # 按逗号分割键值对
            pairs = line.split(',')
            row_data = {}
            current_keys = set()

            for pair in pairs:
                # 按冒号分割键和值
                if ': ' not in pair:
                    raise ValueError(f"行格式错误，缺少 ': ' 分隔符: {line}")
                key, value = pair.split(': ')
                key = key.strip()  # 去除多余空格
                value = value.strip()
                row_data[key] = value
                current_keys.add(key)

            # 检查当前行的键是否与第一行一致
            if first_line_keys is None:
                first_line_keys = current_keys  # 第一行作为基准
            elif current_keys != first_line_keys:
                raise ValueError(f"行键不一致，无法转换为表格: {line}")

            # 将解析后的行数据添加到列表中
            data.append(row_data)
            columns.update(current_keys)

        except ValueError as e:
            print(f"解析错误: {str(e)}")
            return False

    # 将集合转换为列表，确保列名顺序一致
    columns = list(columns)

    # 将数据转换为DataFrame
    df = pd.DataFrame(data, columns=columns)

    # 构建输出文件路径
    output_excel = os.path.join(base_dir, f"{step}.xlsx")

    # 将DataFrame保存为Excel文件
    try:
        df.to_excel(output_excel, index=False)
        print(f"数据已成功保存到 {output_excel}")
        return True
    except Exception as e:
        print(f"保存Excel文件失败: {str(e)}")
        return False

def get_text_path(file_path: str) -> str:
    """
    获取文本文件路径，支持从.path文件中读取路径。

    Args:
        file_path (str): 文件路径。

    Returns:
        str: 文本文件路径，如果无效则返回空字符串。
    """
    try:
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

def main():
    # 设置命令行参数解析器
    parser = argparse.ArgumentParser(description="从文本文件中提取数据并保存为Excel文件")
    parser.add_argument('step', help="步骤序号，用于确定输入文件和输出文件路径")

    # 解析命令行参数
    args = parser.parse_args()

    # 执行文本处理
    if not process_text(args.step):
        print("处理失败，请检查输入文件或日志。")

if __name__ == "__main__":
    main()