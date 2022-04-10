# Ob生成B站视频时间戳笔记
一个用于获取B站视频信息，配合[Media Extend插件](https://github.com/aidenlx/media-extended)以及其[B站视频拓展插件](https://github.com/aidenlx/mx-bili-plugin)做时间戳笔记的脚本。
使用场景更多的是分集知识类视频。
## 目录
 - [Ob生成B站视频时间戳笔记](#Ob生成B站视频时间戳笔记)
  * [简介](#简介)
  * [实现思路](#实现思路)
  * [使用方法](#使用方法)
    + [基本使用](#基本使用)
    + [字段解释](#字段解释)
## 简介
一个用于获取B站视频信息，配合[Media Extend插件](https://github.com/aidenlx/media-extended)以及其[B站视频拓展插件](https://github.com/aidenlx/mx-bili-plugin)做时间戳笔记的脚本。
![Pasted image 20220410214411.png](https://github.com/LumosLovegood/myScripts/blob/main/BilibiliVideo/assets/Pasted%20image%2020220410214411.png)
![Pasted image 20220410214620.png](https://github.com/LumosLovegood/myScripts/blob/main/BilibiliVideo/assets/Pasted%20image%2020220410214620.png)
## 实现思路
- 脚本获取输入的哔哩哔哩网址对应的页面文档
- 解析文档获取相关元素信息（分集信息在某个scrip标签里，可以多试几次找找）
- 之后就是配合大佬的[Media Extend插件](https://github.com/aidenlx/media-extended)以及其[B站视频拓展插件](https://github.com/aidenlx/mx-bili-plugin)使用了
## 使用方法
视频演示地址：

### 基本使用
1. 安装并启用[Quickadd](https://github.com/chhoumann/quickadd)插件
2. 下载需要的脚本文件[bilibili.js](https://github.com/LumosLovegood/myScripts/blob/main/BilibiliVideo/bilibili.js)以及[示例模板](https://github.com/LumosLovegood/myScripts/blob/main/BilibiliVideo/VideoNote.md)(之后可以自定义模板)
3. 在Quickadd中新建一个Macro命令，命令设置中添加User Script为[bilibili.js](https://github.com/LumosLovegood/myScripts/blob/main/BilibiliVideo/bilibili.js)，再添加一个以[示例模板](https://github.com/LumosLovegood/myScripts/blob/main/BilibiliVideo/VideoNote.md)为模板的Template命令，完成之后点亮该命令的⚡符号以启用命令。
4. 命令面板启动该命令即可使用。
5. 如果想要更方便的话可以使用[Button](https://github.com/shabegom/buttons)插件为这个命令添加一个按钮。
6. 使用Button插件创建图标按钮的简单方法可以查看视频[Obsidian使用技巧：一站式搜索并生成读书/电影笔记](https://www.bilibili.com/video/BV1E3411W7ZTb)的后半部分。

### 自定义模板
模板中可以使用以下字段
- {{VALUE:title}} ，视频标题
- {{VALUE:author}} ，视频上传者
- {{VALUE:videoDate}}，视频发布日期
- {{VALUE:link}}，视频的B站地址
- {{VALUE:cover}}，视频封面地址，可以配合banner插件做笔记banner
- {{VALUE:parts}}，视频分集信息（没有的话返回“没有找到分集信息🔍”）
- {{VALUE:intro}}，视频简介

例如这样使用。
```
# {{VALUE:title}}

{{VALUE:cover}}

{{VALUE:intro}}
```

遇到问题或者有想法欢迎提交[issue](https://github.com/LumosLovegood/myScripts/issues)。
