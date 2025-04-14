import os
import argparse
from ultralytics import YOLO

# 支持的图片格式
IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff']

def find_input_image(step):
    try:
        step = int(step)
    except ValueError:
        raise Exception(f"step 参数无效，必须是整数：{step}")

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../transfer"))
    prev_step = str(step - 1)

    # 遍历所有可能的图片扩展名
    for ext in IMAGE_EXTENSIONS:
        candidate_path = os.path.join(base_dir, prev_step + ext)
        if os.path.isfile(candidate_path):
            return candidate_path, ext

    # 检查是否有 .path 文件
    path_file = os.path.join(base_dir, prev_step + ".path")
    if os.path.isfile(path_file):
        try:
            with open(path_file, 'r', encoding='utf-8') as f:
                image_path = f.read().strip()
            if os.path.isfile(image_path) and os.path.splitext(image_path)[1].lower() in IMAGE_EXTENSIONS:
                return image_path, os.path.splitext(image_path)[1].lower()
            else:
                raise Exception(f"{prev_step}.path 中的路径不是有效图片：{image_path}")
        except Exception as e:
            raise Exception(f"读取 {prev_step}.path 时出错：{e}")

    raise Exception(f"未找到 step {step - 1} 的图片或 path 文件")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('step', help='当前步骤编号')
    args = parser.parse_args()

    try:
        image_path, ext = find_input_image(args.step)
        print(f"检测图片路径：{image_path}")
        
        try:
            model = YOLO("../../models_pyuse/yolo11x.pt")
        except Exception as e:
            print(f"模型加载失败: {e}")
            return

        # 执行检测
        results = model(image_path)

        # 构造输出路径
        out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), f"../../transfer/{args.step}{ext}"))
        results[0].save(out_path)

        print(f"检测完成，结果已保存：{out_path}")

    except Exception as e:
        print(f"处理失败: {e}")

if __name__ == '__main__':
    main()
