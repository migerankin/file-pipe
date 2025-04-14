import argparse
import os

def write_to_file(step: str, content: str):
    """
    将文本内容写入transfer文件夹下的txt文件中
    
    Args:
        step (str): 步骤序号，用作文件名
        content (str): 要写入的文本内容
    """
    try:
        # 构建transfer文件夹的路径
        transfer_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../transfer')
        
        # 确保transfer文件夹存在
        if not os.path.exists(transfer_dir):
            os.makedirs(transfer_dir)
        
        # 构建完整的文件路径
        file_path = os.path.join(transfer_dir, f"{step}.txt")
        
        # 写入文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"成功写入文件: {file_path}")
        return True
        
    except Exception as e:
        print(f"写入文件时发生错误: {str(e)}")
        return False

def main():
    # 设置命令行参数解析器
    parser = argparse.ArgumentParser()
    parser.add_argument('test_step')
    parser.add_argument('test_content')
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 调用转换函数
    write_to_file(args.test_step, args.test_content)

if __name__ == "__main__":
    main()
