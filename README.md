# 图片字幕生成器

一个简单的纯前端静态工具：上传图片，在浏览器本地添加多行字幕，并导出生成后的图片。

## 特点

- 纯静态页面，无数据库，无生产后端。
- 图片处理在浏览器本地完成，不上传用户图片。
- 支持 JPEG、PNG、GIF、WebP 输入。
- 支持字幕高度、字体大小、颜色、对齐和透明度调整。
- 可直接部署到 Vercel、宝塔静态站点或任意 Nginx 静态目录。

## 运行

直接打开 `index.html` 即可使用。

如需本地 HTTP 预览：

```bash
python server.py
```

`server.py` 仅用于本地预览，生产部署不需要。

## 生产部署文件

最小部署只需要：

- `index.html`
- `script.js`
- `style.css`
- `image.png`

## 恢复说明

该项目对应 `subtitle.hnwen17.top`。旧宝塔记录目录为 `/www/wwwroot/subtitle-generator`，但当前线上旧 IP 返回的不是本项目页面；恢复时应以本仓库静态文件为准。
