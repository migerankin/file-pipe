import os
import argparse

def save_path(step: str, source_path: str):
    """
    将源文件路径写入 transfer 目录下的 .path 文件
    
    Args:
        step (str): 步骤序号，用作目标文件名
        source_path (str): 源文件路径
    """
    try:
        # 检查源文件是否存在
        if not os.path.isfile(source_path):
            print(f"源文件不存在: {source_path}")
            return False
            
        # 构建目标目录路径
        base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../transfer')
        
        # 确保目标目录存在
        if not os.path.exists(base_dir):
            os.makedirs(base_dir)
            
        # 构建目标文件路径
        target_file = os.path.join(base_dir, f"{step}.path")
        
        # 将源文件路径写入 .path 文件
        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(source_path)
            
        print(f"文件路径已保存: {target_file}")
        return True
        
    except Exception as e:
        print(f"保存路径时出错: {str(e)}")
        return False

def main():
    # 设置命令行参数解析器
    parser = argparse.ArgumentParser(description="保存文件路径到 transfer 目录")
    parser.add_argument('step', help="步骤序号")
    parser.add_argument('source_path', help="源文件路径")
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 执行路径保存
    save_path(args.step, args.source_path)

if __name__ == "__main__":
    main()
