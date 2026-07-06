#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的HTTP服务器，用于本地预览图片字幕生成器
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

def start_server(port=8000):
    """启动HTTP服务器"""
    try:
        # 切换到脚本所在目录
        script_dir = Path(__file__).parent
        os.chdir(script_dir)
        
        # 创建服务器
        handler = http.server.SimpleHTTPRequestHandler
        
        # 添加MIME类型支持
        handler.extensions_map.update({
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        })
        
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"\n🚀 服务器已启动！")
            print(f"📱 本地访问地址: http://localhost:{port}")
            print(f"🌐 网络访问地址: http://127.0.0.1:{port}")
            print(f"📁 服务目录: {script_dir}")
            print(f"\n按 Ctrl+C 停止服务器\n")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n👋 服务器已停止")
    except OSError as e:
        if e.errno == 10048:  # Windows端口被占用
            print(f"❌ 端口 {port} 已被占用，尝试使用端口 {port + 1}")
            start_server(port + 1)
        else:
            print(f"❌ 启动服务器失败: {e}")
    except Exception as e:
        print(f"❌ 发生错误: {e}")

if __name__ == "__main__":
    # 检查命令行参数
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ 端口号必须是数字")
            sys.exit(1)
    
    start_server(port)