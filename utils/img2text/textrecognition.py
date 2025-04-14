import argparse
import pytesseract
from PIL import ImageEnhance,Image, ImageFilter
import os

# 获取当前脚本的绝对路径
base_dir = os.path.dirname(os.path.abspath(__file__))
# 设置 TESSDATA_PREFIX 环境变量
tessdata_dir = os.path.join(base_dir, '../../models_pyuse')
os.environ['TESSDATA_PREFIX'] = tessdata_dir

language = 'chi_sim'

def get_image_path(file_path: str) -> str:
    """
    获取图片文件路径，支持从.path文件中读取路径
    
    Args:
        file_path (str): 文件路径
        
    Returns:
        str: 图片文件路径，如果无效则返回空字符串
    """
    try:
        # 如果是.path文件，读取其中的路径
        if file_path.endswith('.path'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                
            # 检查路径是否存在且为图片文件
            if not os.path.isfile(content):
                print(f"路径文件指向的文件不存在: {content}")
                return ""
                
            # 检查文件是否为图片格式（可以根据需要扩展支持的格式）
            if not content.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
                print(f"不支持的文件类型: {content}")
                return ""
                
            return content
            
        # 如果是直接的图片文件
        elif file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
            if os.path.isfile(file_path):
                return file_path
            print(f"图片文件不存在: {file_path}")
            return ""
            
        return ""
        
    except Exception as e:
        print(f"读取文件路径失败: {str(e)}")
        return ""

def ocr_image(step):
    # 构建输入输出文件路径
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../transfer')
    
    # 获取上一步的文件路径
    prev_step = str(int(step) - 1)
    prev_step_file = os.path.join(base_dir, f"{prev_step}.path")
    prev_step_txt = os.path.join(base_dir, f"{prev_step}.txt")
    output_file = os.path.join(base_dir, f"{step}.txt")
    
    # 优先尝试读取.path文件，如果不存在则尝试.txt文件
    image_path = ""
    if os.path.isfile(prev_step_file):
        image_path = get_image_path(prev_step_file)
    elif os.path.isfile(prev_step_txt):
        with open(prev_step_txt, 'r', encoding='utf-8') as file:
            image_path = file.readline().strip()  # 读取第一行并去除换行符
    
    if not image_path:
        print(f"找不到有效的图片文件: {prev_step_file} 或 {prev_step_txt}")
        return False

    # 检查图片文件是否存在
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"图片文件 {image_path} 不存在")

    # 使用 pytesseract 进行文字识别
    image = Image.open(image_path)
    image = image.convert('L')  # 转换为灰度图
    enhancer = ImageEnhance.Contrast(image) # type: ignore
    image = enhancer.enhance(2)  # 提高对比度
    image = image.filter(ImageFilter.MedianFilter())  # type: ignore # 应用中值滤波去噪
    image = image.point(lambda x: 0 if x < 140 else 255)  # 二值化
    text = pytesseract.image_to_string(image, lang=language)

    # 将识别结果写入新的文本文件
    with open(output_file, 'w') as file:
        file.write(text)

    print(f"识别结果已保存到 {output_file}")

def main():
    # 设置命令行参数解析器
    parser = argparse.ArgumentParser(description="图片文字识别")
    parser.add_argument('step', help="步骤序号")
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 执行语音识别
    ocr_image(args.step)

if __name__ == "__main__":
    main()