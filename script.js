class ImageSubtitleGenerator {
    constructor() {
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.currentZoom = 1;
        this.maxZoom = 3;
        this.minZoom = 0.1;
        this.generatedImageData = null;
        this.saved = true;
        
        this.initializeElements();
        this.bindEvents();
        this.updateCharCount();
    }

    initializeElements() {
        // 获取所有需要的DOM元素
        this.elements = {
            fileInput: document.getElementById('fileInput'),
            uploadBtn: document.getElementById('uploadBtn'),
            uploadArea: document.getElementById('uploadArea'),
            fileInfo: document.getElementById('fileInfo'),
            fileName: document.getElementById('fileName'),
            removeBtn: document.getElementById('removeBtn'),
            previewPlaceholder: document.getElementById('previewPlaceholder'),
            
            // 设置控件
            subtitleHeight: document.getElementById('subtitleHeight'),
            fontSize: document.getElementById('fontSize'),
            textColor: document.getElementById('textColor'),
            textColorHex: document.getElementById('textColorHex'),
            bgColor: document.getElementById('bgColor'),
            bgColorHex: document.getElementById('bgColorHex'),
            fontFamily: document.getElementById('fontFamily'),
            fontWeight: document.getElementById('fontWeight'),
            textAlign: document.getElementById('textAlign'),
            lineHeight: document.getElementById('lineHeight'),
            bgOpacity: document.getElementById('bgOpacity'),
            opacityValue: document.getElementById('opacityValue'),
            
            // 内容和操作
            subtitleText: document.getElementById('subtitleText'),
            charCount: document.getElementById('charCount'),
            generateBtn: document.getElementById('generateBtn'),
            saveBtn: document.getElementById('saveBtn'),
            imageQuality: document.getElementById('imageQuality'),
            
            // 预览控制
            zoomInBtn: document.getElementById('zoomInBtn'),
            zoomOutBtn: document.getElementById('zoomOutBtn'),
            resetZoomBtn: document.getElementById('resetZoomBtn')
        };
    }

    bindEvents() {
        // 文件上传事件
        this.elements.uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.fileInput.click();
        });

        this.elements.uploadArea.addEventListener('click', (e) => {
            if (e.target.closest('#removeBtn') || e.target.closest('#uploadBtn')) return;
            this.elements.fileInput.click();
        });
        
        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });
        
        this.elements.removeBtn.addEventListener('click', () => {
            this.removeImage();
        });

        // 拖拽上传
        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('dragover');
        });
        
        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('dragover');
        });
        
        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // 设置控件事件
        const settingInputs = [
            'subtitleHeight', 'fontSize', 'textColor', 'bgColor', 
            'fontFamily', 'fontWeight', 'textAlign', 'lineHeight', 'bgOpacity'
        ];
        
        settingInputs.forEach(id => {
            this.elements[id].addEventListener('input', () => {
                this.updatePreview();
            });
        });

        // 颜色输入同步
        this.elements.textColor.addEventListener('input', (e) => {
            this.elements.textColorHex.value = e.target.value;
            this.updatePreview();
        });
        
        this.elements.textColorHex.addEventListener('input', (e) => {
            if (this.isValidHexColor(e.target.value)) {
                this.elements.textColor.value = e.target.value;
                this.updatePreview();
            }
        });
        
        this.elements.bgColor.addEventListener('input', (e) => {
            this.elements.bgColorHex.value = e.target.value;
            this.updatePreview();
        });
        
        this.elements.bgColorHex.addEventListener('input', (e) => {
            if (this.isValidHexColor(e.target.value)) {
                this.elements.bgColor.value = e.target.value;
                this.updatePreview();
            }
        });

        // 透明度显示更新
        this.elements.bgOpacity.addEventListener('input', (e) => {
            this.elements.opacityValue.textContent = e.target.value;
        });

        // 字幕内容变化
        this.elements.subtitleText.addEventListener('input', () => {
            this.updateCharCount();
            this.updatePreview();
        });

        // 操作按钮
        this.elements.generateBtn.addEventListener('click', () => {
            this.generateImage();
        });
        
        this.elements.saveBtn.addEventListener('click', () => {
            this.saveImage();
        });

        // 预览控制
        this.elements.zoomInBtn.addEventListener('click', () => {
            this.zoomIn();
        });
        
        this.elements.zoomOutBtn.addEventListener('click', () => {
            this.zoomOut();
        });
        
        this.elements.resetZoomBtn.addEventListener('click', () => {
            this.resetZoom();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        if (!this.elements.saveBtn.disabled) {
                            this.saveImage();
                        }
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (!this.elements.generateBtn.disabled) {
                            this.generateImage();
                        }
                        break;
                }
            }
        });
    }

    handleFileSelect(file) {
        if (!file) return;
        
        // 验证文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('请选择有效的图片文件（JPEG、PNG、GIF、WebP）');
            return;
        }
        
        // 验证文件大小（10MB）
        if (file.size > 10 * 1024 * 1024) {
            alert('文件大小不能超过 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadImage(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    }

    loadImage(src, fileName) {
        const img = new Image();
        img.onload = () => {
            this.originalImage = img;
            this.showFileInfo(fileName);
            this.setupCanvas();
            this.updatePreview();
            this.elements.generateBtn.disabled = false;
        };
        img.onerror = () => {
            alert('图片加载失败，请重试');
        };
        img.src = src;
    }

    showFileInfo(fileName) {
        this.elements.fileName.textContent = fileName;
        this.elements.fileInfo.style.display = 'flex';
        this.elements.uploadArea.querySelector('.upload-placeholder').style.display = 'none';
    }

    removeImage() {
        this.originalImage = null;
        this.elements.fileInfo.style.display = 'none';
        this.elements.uploadArea.querySelector('.upload-placeholder').style.display = 'block';
        this.elements.previewPlaceholder.style.display = 'flex';
        this.canvas.style.display = 'none';
        this.elements.generateBtn.disabled = true;
        this.elements.saveBtn.disabled = true;
        this.generatedImageData = null;
        this.saved = true;
        this.elements.fileInput.value = '';
        this.resetZoom();
    }

    setupCanvas() {
        if (!this.originalImage) return;
        
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = this.originalImage;
        
        // 计算适合的尺寸
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.display = 'block';
        this.elements.previewPlaceholder.style.display = 'none';
    }

    updatePreview() {
        if (!this.originalImage) return;

        this.invalidateGeneratedImage();
        
        this.drawImageWithSubtitles();
    }

    drawImageWithSubtitles() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // 获取字幕设置和文本
        const settings = this.getSubtitleSettings();
        const text = this.elements.subtitleText.value.trim();
        const lines = text ? text.split('\n').filter(line => line.trim()) : [];

        // 基于原始图片比例，计算预览图像的初始尺寸
        const maxWidth = 800; // 预览区域最大宽度
        const maxHeight = 600; // 预览区域最大高度
        const ratio = Math.min(1, maxWidth / this.originalImage.width, maxHeight / this.originalImage.height);
        const previewImgWidth = this.originalImage.width * ratio;
        const previewImgHeight = this.originalImage.height * ratio;

        // 计算因字幕增加的高度
        const lineHeight = this.getSubtitleLineHeight(settings);
        const addedHeight = Math.max(0, lines.length - 1) * lineHeight;

        // 设置画布最终的尺寸
        canvas.width = previewImgWidth;
        canvas.height = previewImgHeight + addedHeight;

        // 清空并绘制
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.originalImage, 0, 0, previewImgWidth, previewImgHeight);

        if (!text || lines.length === 0) return;

        // 绘制字幕
        this.drawSubtitlesWithCutting(ctx, lines, settings, previewImgHeight, lineHeight, previewImgWidth);
    }

    getSubtitleSettings() {
        return {
            height: parseInt(this.elements.subtitleHeight.value),
            fontSize: parseInt(this.elements.fontSize.value),
            textColor: this.elements.textColor.value,
            bgColor: this.elements.bgColor.value,
            fontFamily: this.elements.fontFamily.value,
            fontWeight: this.elements.fontWeight.value,
            textAlign: this.elements.textAlign.value,
            lineHeight: parseFloat(this.elements.lineHeight.value),
            bgOpacity: parseFloat(this.elements.bgOpacity.value)
        };
    }

    getSubtitleLineHeight(settings) {
        return Math.max(settings.height, settings.fontSize * settings.lineHeight);
    }

    drawSubtitlesWithCutting(ctx, lines, settings, originalHeight, lineHeight, imageWidth) {
        const canvas = ctx.canvas;

        // 设置字体
        ctx.font = `${settings.fontWeight} ${settings.fontSize}px ${settings.fontFamily}`;
        ctx.textAlign = settings.textAlign;
        ctx.textBaseline = 'middle';

        // 计算原图和预览图的比例（用于坐标转换）
        const scale = this.originalImage.height / originalHeight;

        // 绘制每一行字幕
        lines.forEach((line, index) => {
            let targetY, sourceY;

            if (index === 0) {
                // 第一行：在原图底部
                targetY = originalHeight - lineHeight;

                // 绘制阴影遮罩（只在图片宽度范围内）
                const bgColorRgb = this.hexToRgb(settings.bgColor);
                ctx.fillStyle = `rgba(${bgColorRgb.r}, ${bgColorRgb.g}, ${bgColorRgb.b}, ${settings.bgOpacity})`;
                ctx.fillRect(0, targetY, imageWidth, lineHeight);

            } else {
                // 后续行：复制第1行字幕的背景（原图底部）
                targetY = originalHeight + (index - 1) * lineHeight;

                // 关键：将预览坐标转换为原图坐标
                // 第1行在预览图的位置是 originalHeight - lineHeight
                // 对应原图的位置是 this.originalImage.height - (lineHeight * scale)
                const originalLineHeight = lineHeight * scale;
                sourceY = this.originalImage.height - originalLineHeight;

                // 从原图底部复制背景（与第1行字幕背景相同）
                ctx.drawImage(
                    this.originalImage,
                    0, sourceY, this.originalImage.width, originalLineHeight,  // 源：原图底部
                    0, targetY, imageWidth, lineHeight   // 目标：当前字幕行位置
                );

                // 绘制阴影遮罩（只在图片宽度范围内）
                const bgColorRgb = this.hexToRgb(settings.bgColor);
                ctx.fillStyle = `rgba(${bgColorRgb.r}, ${bgColorRgb.g}, ${bgColorRgb.b}, ${settings.bgOpacity})`;
                ctx.fillRect(0, targetY, imageWidth, lineHeight);
            }
            
            // 绘制文字
            ctx.fillStyle = settings.textColor;
            
            let textX;
            switch (settings.textAlign) {
                case 'left':
                    textX = 20;
                    break;
                case 'right':
                    textX = imageWidth - 20;
                    break;
                case 'center':
                default:
                    textX = imageWidth / 2;
                    break;
            }
            
            const textY = targetY + lineHeight / 2;
            
            // 添加文字描边以提高可读性
            ctx.strokeStyle = settings.bgColor;
            ctx.lineWidth = 2;
            ctx.strokeText(line, textX, textY);
            ctx.fillText(line, textX, textY);
        });
    }
    
    // 保留原方法用于高质量输出
    drawSubtitles(ctx, text, settings) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return;

        const canvas = ctx.canvas;
        const lineHeight = this.getSubtitleLineHeight(settings);

        // 在预览时，使用画布的尺寸
        const targetHeight = this.originalImage ? this.originalImage.height : canvas.height;
        const imageWidth = this.originalImage ? this.originalImage.width : canvas.width;

        this.drawSubtitlesWithCutting(ctx, lines, settings, targetHeight, lineHeight, imageWidth);
    }

    generateImage() {
        if (!this.originalImage) return;
        
        this.elements.generateBtn.classList.add('loading');
        
        // 使用setTimeout确保UI更新
        setTimeout(() => {
            try {
                // 获取字幕文本和设置
                const text = this.elements.subtitleText.value.trim();
                const lines = text ? text.split('\n').filter(line => line.trim()) : [];
                const settings = this.getSubtitleSettings();
                
                // 创建高质量画布
                const outputCanvas = document.createElement('canvas');
                const outputCtx = outputCanvas.getContext('2d');
                
                // 计算输出画布尺寸
                const originalWidth = this.originalImage.width;
                const originalHeight = this.originalImage.height;
                const scale = originalWidth / this.canvas.width;
                const scaledLineHeight = this.getSubtitleLineHeight(settings) * scale;
                
                outputCanvas.width = originalWidth;
                outputCanvas.height = originalHeight + (Math.max(0, lines.length - 1) * scaledLineHeight);
                
                // 绘制原图
                outputCtx.drawImage(this.originalImage, 0, 0);
                
                // 绘制字幕（如果有）
                if (text && lines.length > 0) {
                    const scaledSettings = {
                        ...settings,
                        fontSize: settings.fontSize * scale,
                        height: settings.height * scale
                    };
                    
                    this.drawSubtitlesWithCutting(outputCtx, lines, scaledSettings, originalHeight, scaledLineHeight, originalWidth);
                }
                
                // 更新预览（使用生成的图片）
                const generatedImage = new Image();
                generatedImage.onload = () => {
                    // 重新调整预览画布尺寸以匹配生成的图片比例
                    const previewScale = Math.min(1, 800 / generatedImage.width, 600 / generatedImage.height);
                    this.canvas.width = generatedImage.width * previewScale;
                    this.canvas.height = generatedImage.height * previewScale;
                    
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.drawImage(generatedImage, 0, 0, this.canvas.width, this.canvas.height);
                    this.elements.saveBtn.disabled = false;
                    this.elements.generateBtn.classList.remove('loading');
                };
                
                generatedImage.src = outputCanvas.toDataURL('image/png', 1.0);
                this.generatedImageData = outputCanvas.toDataURL('image/png', 1.0);
                this.saved = false;
                
            } catch (error) {
                console.error('生成图片失败:', error);
                alert('生成图片失败，请重试');
                this.elements.generateBtn.classList.remove('loading');
            }
        }, 100);
    }

    saveImage() {
        if (!this.generatedImageData) {
            alert('请先生成图片');
            return;
        }
        
        const quality = parseFloat(this.elements.imageQuality.value);
        const format = quality === 1 ? 'image/png' : 'image/jpeg';
        
        // 创建下载链接
        const link = document.createElement('a');
        
        if (format === 'image/jpeg') {
            // 转换为JPEG格式
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 白色背景（JPEG不支持透明）
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                const jpegData = canvas.toDataURL('image/jpeg', quality);
                link.href = jpegData;
                link.download = `subtitle-image-${Date.now()}.jpg`;
                link.click();
                this.saved = true;
            };
            
            img.src = this.generatedImageData;
        } else {
            link.href = this.generatedImageData;
            link.download = `subtitle-image-${Date.now()}.png`;
            link.click();
            this.saved = true;
        }
    }

    // 预览控制方法
    zoomIn() {
        if (this.currentZoom < this.maxZoom) {
            this.currentZoom = Math.min(this.currentZoom * 1.2, this.maxZoom);
            this.applyZoom();
        }
    }

    zoomOut() {
        if (this.currentZoom > this.minZoom) {
            this.currentZoom = Math.max(this.currentZoom / 1.2, this.minZoom);
            this.applyZoom();
        }
    }

    resetZoom() {
        this.currentZoom = 1;
        this.applyZoom();
    }

    applyZoom() {
        this.canvas.style.transform = `scale(${this.currentZoom})`;
        this.canvas.style.transformOrigin = 'center';
    }

    // 工具方法
    updateCharCount() {
        const text = this.elements.subtitleText.value;
        this.elements.charCount.textContent = text.length;
    }

    invalidateGeneratedImage() {
        if (!this.generatedImageData) return;

        this.generatedImageData = null;
        this.saved = true;
        this.elements.saveBtn.disabled = true;
    }

    isValidHexColor(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    hexToRgb(hex) {
        let normalized = hex.replace('#', '');
        if (normalized.length === 3) {
            normalized = normalized.split('').map(char => char + char).join('');
        }

        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.imageSubtitleGenerator = new ImageSubtitleGenerator();
});

// 添加一些实用的全局功能
window.addEventListener('beforeunload', (e) => {
    // 如果有未保存的更改，提醒用户
    const generator = window.imageSubtitleGenerator;
    if (generator && generator.generatedImageData && !generator.saved) {
        e.preventDefault();
        e.returnValue = '您有未保存的图片，确定要离开吗？';
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('发生错误:', e.error);
    // 可以在这里添加错误报告功能
});

// 性能监控
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('页面加载时间:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}
