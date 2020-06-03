import socket
import cv2
import base64


def __send(message, port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(('localhost', port))
    sock.send(message.encode("utf-8"))
    sock.send("socketEnd".encode("utf-8"))
    sock.close()


def __cvtPicToBase64(img):
    return str(base64.b64encode(cv2.imencode('.jpg', img)[1].tostring()))[2:-1]


def waitForUserClickChooseFils(whenUserChooseImg, whenUserChooseVideo):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('localhost', 6001))  # 配置soket，绑定IP地址和端口号
    sock.listen(5)  # 设置最大允许连接数，各连接和server的通信遵循FIFO原则
    while True:  # 循环轮询socket状态，等待访问
        connection, address = sock.accept()
        try:
            connection.settimeout(500)
            message = str(connection.recv(1024000000), encoding="utf-8")
            if message[0] == '0':
                whenUserChooseImg(message[1:])
            if message[0] == '1':
                whenUserChooseVideo(message[1:])
        except socket.timeout:
            pass
        connection.close()


def sendResult(resultStr):
    __send(resultStr, 6000)


def sendOriginImg(img):
    __send(__cvtPicToBase64(img), 6002)


def sendSignedImg(img):
    __send(__cvtPicToBase64(img), 6003)


if __name__ == '__main__':
    # 示例代码
    def whenUserChooseImage(ImagePath):  # 此函数将会在用户选择完图片之后被自动运行
        # ImagePath 为用户选择的图片路径
        img = cv2.imread(ImagePath)
        sendOriginImg(img)  # 这行代码将会把图片显示在展示程序原始图片区域
        #
        #你在这里调用机器学习程序预测结果并且标记好图片
        #
        sendSignedImg(img)  # 这行程序将会把图片显示在标记图片区域


    def whenUserChooseVideo(VideoPath):  # 此函数将会在用户选择完视频之后被自动运行
        # VideoPath为用户选择的文件路径
        img = cv2.imread(VideoPath)
        #
        # 机器学习程序在这里循环读取视频每一帧
        # 机器学习程序 预测这个视频的每一帧，并且标记好图片
        #
        sendSignedImg(img)  # 这行代码将会把标记的帧发送给展示程序，展示程序会立即显示
        sendResult("识别结果：\n 当前液面10%")  # 这行代码将会把当前帧预测的结果发送给演示程序，演示程序会立即显示
        #
        # 视频预测完毕循环结束
        #


    waitForUserClickChooseFils(whenUserChooseImage, whenUserChooseVideo)
    # 将上方编写的两个函数填入这个函数的参数内，
    # 只填入函数名称不要加括号(因为在这里这两个函数本质上是回调函数)
    # 这个函数会立即阻塞程序进程，等待用户的操作来自动调用机器学习程序，预测结果返回给展示程序
