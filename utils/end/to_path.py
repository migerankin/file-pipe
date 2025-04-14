import os
import platform
import subprocess
import argparse
import shutil
import glob
import json
from datetime import datetime

def get_config():
    """读取配置文件"""
    try:
        # 获取配置文件路径
        config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../electron-vue/src/config.json')
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        return config
    except Exception as e:
        print(f"读取配置文件失败: {str(e)}")
        return {"openFolderAfterComplete": True}  # 默认值

def copy_and_open(step, target_path: str):
    """
    将transfer文件夹下对应步骤的文件复制到目标路径，根据配置决定是否打开目标文件夹
    
    Args:
        step: 步骤序号
        target_path (str): 目标文件夹路径
    """
    try:
        # 构建源文件路径（transfer目录）
        base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../transfer')
        prev_step = str(int(step) - 1)
        source_pattern = os.path.join(base_dir, f"{prev_step}.*")
        
        # 获取当前时间戳
        timestamp = datetime.now().strftime("%Y-%m-%d %H-%M-%S")
        
        # 查找匹配的源文件（任意后缀）
        source_files = glob.glob(source_pattern)
        if not source_files:
            print(f"未找到步骤 {prev_step} 的源文件")
            return False
            
        # 确保目标目录存在
        if not os.path.exists(target_path):
            os.makedirs(target_path)
            
        # 复制文件
        for source_file in source_files:
            # 获取源文件名和扩展名
            file_name, file_ext = os.path.splitext(os.path.basename(source_file))
            # 构建新文件名（添加时间戳）
            new_file_name = f"{timestamp}{file_ext}"
            # 构建目标文件完整路径
            target_file = os.path.join(target_path, new_file_name)
            # 复制文件
            shutil.copy2(source_file, target_file)
            print(f"已复制文件: {source_file} -> {target_file}")
        
        # 读取配置
        config = get_config()
        
        # 根据配置决定是否打开文件夹
        if config.get('openFolderAfterComplete', True):
            # 打开目标文件夹
            system = platform.system().lower()
            if system == 'windows':
                os.startfile(target_path)
            elif system == 'darwin':  # macOS
                subprocess.run(['open', target_path])
            elif system == 'linux':
                subprocess.run(['xdg-open', target_path])
            else:
                print(f"不支持的操作系统: {system}")
                return False
            
        return True
        
    except Exception as e:
        print(f"操作失败: {str(e)}")
        return False

def main():
    # 设置命令行参数解析器
    parser = argparse.ArgumentParser(description="复制文件并打开目标文件夹")
    parser.add_argument('step', help="步骤序号")
    parser.add_argument('target_path', help="目标文件夹路径")
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 执行复制和打开操作
    copy_and_open(args.step, args.target_path)

if __name__ == "__main__":
    main()
