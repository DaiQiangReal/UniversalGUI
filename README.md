## 说明
![electron](https://img.shields.io/badge/electron-8.2.0+-green.svg) ![React](https://img.shields.io/badge/React-16.13.1+-green.svg) ![antd](https://img.shields.io/badge/antd-4.0.4+-green.svg) ![build](https://img.shields.io/badge/build-passed-green.svg)
​		

​这是一个通用的机器学习算法结果展示程序,通过 socket 与 机器学习程序通信,让研究人员无需编写任何代码,就能方便的演示 算法效果。

优点:具有点击图片放大,自适应图片大小,能够演示机器学习程序即时标记视频。
全平台,支持 Ubuntu Windows7 以上。

Windows 双击 exe 运行,linux 直接把 run 文件拖入终端运行(如果运行失败请 chmod+x 赋予执行权限)

先运行本程序,当用户点击按钮,选择文件之后,程序会将文件路径传给你所编写的机
器学习程序,机器学习程序预测之后将标记的图片和预测结果传给本程序,本程序会进行显
示。

![eg1](https://github.com/DaiQiangReal/UniversalGUI/blob/master/eg1.png?raw=true)

![eg2](https://github.com/DaiQiangReal/UniversalGUI/blob/master/eg2.png?raw=true)
## 编译前端

```shell
yarn build
yarn pack
```

详细打包细节 参考 electron-builder 文档 也可使用electron-packager

打包完成，运行后会自动监听Socket

## 使用后端

需要 opencv-python 依赖 已有请忽略

```shell
conda remove opencv
conda install -c menpo opencv
pip install --upgrade pip
pip install opencv-contrib-python
```



整个过程,机器学习研究员只需写三行代码。研究员无需关心任何界面细节。

1.将 UniversalGUI.py 放在你工作目录

2.在你的程序里 import * from UniversalGUI

3.运行前端展示程序

(img 为 opencv 格式 BGR 通道)
sendOriginImg(img) #这行代码将会把图片显示在展示程序原始图片区域

sendSignedImg(img) #这行程序将会把图片显示在标记图片区域

sendResult("识别结果:\n 当前液面 10%")

你需要编写两个函数
whenUserChooseImage(imagePath) #当用户点击选择图片的时候这个函数会被自动执行,
imagePath 即 是用户选择的图片路径,你在这里调用你的机器学习程序预测图片,然后用
前文的 send 函数来显示预测结果。

whenUserChooseVideo(VideoPath) #当用户点击选择视频的时候这个函数会被自动执行,
VideoPath 即 是用户选择的视频路径,你在这里调用你的机器学习程序循环预测视频每一
帧,然后用前文的 send 函数来显示预测结果和当前标记的帧。

waitForUserClickChooseFils(whenUserChooseImage,whenUserChooseVideo)
将 你 编 写 得 的 两 个 函 数 填 入 waitForUserClickChooseFils 中 ,( 不 要 加 括 号 ),waitForUserClickChooseFils 会阻塞程序,等待用户的操作来自动调用机器学习程序,预测结果返回给展示程序。

![backendEg](https://github.com/DaiQiangReal/UniversalGUI/blob/master/backendEg.png?raw=true)
