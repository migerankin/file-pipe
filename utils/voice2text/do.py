import os
import argparse
from funasr import AutoModel
from funasr.utils.postprocess_utils import rich_transcription_postprocess
from pydub import AudioSegment
import torch

def get_audio_path(file_path: str) -> str:
    """
    获取音频文件路径，支持从.path文件中读取路径
    
    Args:
        file_path (str): 文件路径
        
    Returns:
        str: 音频文件路径，如果无效则返回空字符串
    """
    try:
        # 如果是.path文件，读取其中的路径
        if file_path.endswith('.path'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                
            # 检查路径是否存在且为mp3文件
            if not os.path.isfile(content):
                print(f"路径文件指向的文件不存在: {content}")
                return ""
                
            if not content.lower().endswith('.mp3'):
                print(f"不支持的文件类型: {content}")
                return ""
                
            return content
            
        # 如果是直接的mp3文件
        elif file_path.endswith('.mp3'):
            if os.path.isfile(file_path):
                return file_path
            print(f"音频文件不存在: {file_path}")
            return ""
            
        return ""
        
    except Exception as e:
        print(f"读取文件路径失败: {str(e)}")
        return ""


def convert_to_wav(input_path: str, output_path: str) -> bool:
    """
    将任意格式音频转换为 wav 格式
    """
    try:
        audio = AudioSegment.from_file(input_path)
        audio.export(output_path, format="wav")
        return True
    except Exception as e:
        print(f"音频格式转换失败: {str(e)}")
        return False

def speech_to_text(step: str) -> bool:
    """
    将语音文件转换为文本，支持非标准 mp3 转换为 wav 后识别
    """
    try:
        # 路径构建
        base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../transfer')
        prev_step = str(int(step) - 1)
        input_mp3 = os.path.join(base_dir, f"{prev_step}.mp3")
        input_path = os.path.join(base_dir, f"{prev_step}.path")
        input_wav = os.path.join(base_dir, f"{prev_step}.wav")

        # 获取音频路径并转换
        audio_path = ""
        if os.path.isfile(input_mp3):
            if convert_to_wav(input_mp3, input_wav):
                audio_path = input_wav
            else:
                print("音频格式转换失败，无法识别")
                return False
        elif os.path.isfile(input_path):
            mp3_from_path = get_audio_path(input_path)
            if mp3_from_path and convert_to_wav(mp3_from_path, input_wav):
                audio_path = input_wav
            else:
                print("路径文件中的音频无效或转换失败")
                return False
        else:
            print(f"找不到有效的音频文件: {input_mp3} 或 {input_path}")
            return False

        # 初始化识别模型
        model = AutoModel(
            model="iic/SenseVoiceSmall",
            trust_remote_code=True,
            remote_code="./model.py",
            vad_model="fsmn-vad",
            vad_kwargs={"max_single_segment_time": 30000},
            device="cuda:0" if torch.cuda.is_available() else "cpu"
        )

        # 执行识别
        res = model.generate(
            input=audio_path,
            cache={},
            language="auto",
            use_itn=True,
            batch_size_s=60,
            merge_vad=True,
            merge_length_s=15,
        )

        text = rich_transcription_postprocess(res[0]["text"])

        if not text:
            print("无法识别语音内容")
            return False

        # 写入输出
        if not os.path.exists(base_dir):
            os.makedirs(base_dir)

        output_file = os.path.join(base_dir, f"{step}.txt")
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(text)

        print(f"语音识别完成，结果已保存至: {output_file}")
        return True

    except Exception as e:
        print(f"语音识别过程中出错: {str(e)}")
        return False

def main():
    # 设置命令行参数解析器
    parser = argparse.ArgumentParser(description="语音转文字")
    parser.add_argument('step', help="步骤序号")
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 执行语音识别
    speech_to_text(args.step)

if __name__ == "__main__":
    main()
