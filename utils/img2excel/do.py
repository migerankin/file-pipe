import os
import cv2
from img2table.document import Image
from img2table.ocr import TesseractOCR
import pandas as pd
from PIL import Image as PILImage

# 获取当前脚本的绝对路径
base_dir = os.path.dirname(os.path.abspath(__file__))

# 设置 TESSDATA_PREFIX 环境变量
tessdata_dir = os.path.join(base_dir, '../../models_pyuse')
os.environ['TESSDATA_PREFIX'] = tessdata_dir

# 初始化OCR引擎
language = 'chi_sim'
ocr = TesseractOCR(lang=language)

# 加载图片
img_path = os.path.join(base_dir, "200111-61a612876727c.jpg")

# 图片预处理
img = cv2.imread(img_path)

# 转换为灰度图
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 使用高斯模糊去噪
blurred = cv2.GaussianBlur(gray, (5, 5), 0)

# 使用自适应阈值进行二值化
img_bin = cv2.adaptiveThreshold(
    blurred,
    255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY,
    11,  # 邻域大小
    2    # 常数项
)

# 应用形态学操作来增强边缘
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
img_bin = cv2.morphologyEx(img_bin, cv2.MORPH_CLOSE, kernel)

# 保存处理后的图片
processed_img_path = os.path.join(base_dir, "processed_image.png")
cv2.imwrite(processed_img_path, img_bin)

# 使用 img2table 提取表格，设置更宽松的表格检测参数
img = Image(src=processed_img_path)
tables = img.extract_tables(
    ocr=ocr,
    min_confidence=50,     # 降低最小置信度
    line_scale=40,         # 调整线条缩放
    cell_thresh=0.1        # 降低单元格检测阈值
)

# 处理提取的表格
if tables:
    for i, table in enumerate(tables):
        df = pd.DataFrame(table)
        print(f"Table {i+1}:")
        print(df)
        # 保存为 CSV
        output_path = os.path.join(base_dir, f"extracted_table_{i+1}.csv")
        df.to_csv(output_path, index=False)
else:
    print("未检测到表格。")