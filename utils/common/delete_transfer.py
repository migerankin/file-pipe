import os
import shutil

def delete_transfer_files():
    """
    删除 transfer 目录下的所有文件
    """
    try:
        # 获取 transfer 目录的路径
        transfer_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../transfer')
        
        # 如果目录不存在，直接返回
        if not os.path.exists(transfer_dir):
            print("transfer 目录不存在")
            return True
            
        # 遍历并删除目录中的所有文件
        for filename in os.listdir(transfer_dir):
            file_path = os.path.join(transfer_dir, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
                    print(f"已删除文件: {filename}")
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
                    print(f"已删除目录: {filename}")
            except Exception as e:
                print(f"删除 {filename} 时出错: {str(e)}")
                return False
                
        print("已清空 transfer 目录")
        return True
        
    except Exception as e:
        print(f"清理 transfer 目录时出错: {str(e)}")
        return False

if __name__ == "__main__":
    delete_transfer_files()
