import argparse
import os
from plyer import notification

def get_previous_file_content(step: str) -> str:
    """
    获取上一步的文件内容，优先尝试 {step-1}.txt，如果不存在则尝试 {step-1}.path

    Args:
        step (str): 当前步骤编号

    Returns:
        str: 文件内容，如果文件不存在则返回空字符串
    """
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../transfer')
    prev_step = str(int(step) - 1)
    
    # 尝试 {step-1}.txt
    txt_file = os.path.join(base_dir, f"{prev_step}.txt")
    if os.path.isfile(txt_file):
        with open(txt_file, 'r', encoding='utf-8') as f:
            return f.read().strip()
    
    # 尝试 {step-1}.path
    path_file = os.path.join(base_dir, f"{prev_step}.path")
    if os.path.isfile(path_file):
        with open(path_file, 'r', encoding='utf-8') as f:
            content_path = f.read().strip()
            if os.path.isfile(content_path):  # 检查路径是否存在
                with open(content_path, 'r', encoding='utf-8') as content_f:
                    return content_f.read().strip()
    
    return ""

def send_notification(step: str, title: str):
    """
    发送通知

    Args:
        step (str): 当前步骤编号
        title (str): 通知标题
    """
    message = get_previous_file_content(step)
    if not message:
        print(f"警告: 未找到有效的上一步文件内容 (step={step})")
        return

    notification.notify(
        title=title,
        message=message,
        app_name="FilePipe",
        timeout=5
    )
    print(f"通知已发送: {title}")

if __name__ == "__main__":
    # 设置命令行参数解析器
    parser = argparse.ArgumentParser(description='发送文件处理通知')
    parser.add_argument('step',  help='当前步骤编号')
    parser.add_argument('title',  help='通知标题')
    args = parser.parse_args()

    # 发送通知
    send_notification(args.step, args.title)