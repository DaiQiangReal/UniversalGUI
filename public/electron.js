// 引入electron并创建一个Browserwindow
const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const url = require('url');
const electron=require("electron");
// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;

function createWindow() {
//创建浏览器窗口,宽高自定义具体大小你开心就好
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 720,
        minWidth:1200,
        minHeight:720,

        webPreferences: {
            javascript: true,
            plugins: true,
            nodeIntegration: true, // 不集成 Nodejs
            webSecurity: false,

        }
    });
    /*
     加载应用----- electron-quick-start中默认的加载入口*/
    mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true
    }));

    // 加载应用----适用于 react 项目
    // mainWindow.loadURL('http://localhost:3000/');

    // 打开开发者工具，默认不打开
    // mainWindow.webContents.openDevTools()
    // 关闭window时触发下列事件.
    mainWindow.on('closed', function () {
        mainWindow = null
    })

}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', ()=>{
    const menu = electron.Menu.buildFromTemplate(template);
    electron.Menu.setApplicationMenu(menu); // 设置菜单部分
    createWindow();
});
// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
    // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
app.on('activate', function () {
    // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
    if (mainWindow === null) {
        createWindow()
    }
});

let template = [
    {
        label: ' 操作 ',
        submenu: [  {
            label: '重新加载',
            accelerator: 'CmdOrCtrl+R',
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    // on reload, start fresh and close any old
                    // open secondary windows
                    if (focusedWindow.id === 1) {
                        BrowserWindow.getAllWindows().forEach(function (win) {
                            if (win.id > 1) {
                                win.close()
                            }
                        })
                    }
                    focusedWindow.reload()
                }
            }
        }]
    },
    {
        label: ' 窗口 ',
        role: 'window',
        submenu: [{
            label:"全屏展示",
            accelerator:"CmdOrCtrl+F",
            role:"togglefullscreen"
        },{
            label: '最小化',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        },{
            label:"临时缩放+10%",
            accelerator:"Shift+P",
            role:"zoomin"
        }, {
            label:"临时缩放-10%",
            accelerator:"Shift+L",
            role:"zoomout"
        },{
            label:"缩放回正常大小",
            accelerator:"Shift+N",
            role:"resetzoom"
        },{
            label: '关闭',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        }, ]
    },
    {
        label: ' 帮助 ',
        role: 'help',
        submenu: [
            {
                label:"使用说明",
                accelerator: 'CmdOrCtrl+Q',
                click:()=>{
                    const options = {
                        type: 'info',
                        title: '信息',
                        message: helpInfo,
                    };
                    dialog.showMessageBox(options)
                }
            }]
    }
];



// 你可以在这个脚本中续写或者使用require引入独立的js文件.
ipcMain.on('choosePicFiledialog', event=>{
    dialog.showOpenDialog({}).then((files) => {
        console.log(files);
        if (files) {// 如果有选中
            // 发送选择的对象给子进程
                event.sender.send('selectedPicItem', files.filePaths[0])
        }
    }).catch(e=>console.log(e));

});
ipcMain.on('chooseVideoFiledialog', event=>{
    dialog.showOpenDialog({}).then((files) => {
        console.log(files);
        if (files) {// 如果有选中
            // 发送选择的对象给子进程
            event.sender.send('selectedVideoItem', files.filePaths[0])
        }
    }).catch(e=>console.log(e));

});


var helpInfo="这是一个通用的机器学习算法结果展示程序，通过socket 与 机器学习程序通信，让研究人员无需编写任何代码，就能方便的演示 算法效果。\n" +
    "优点：具有点击图片放大，自适应图片大小，能够演示机器学习程序即时标记视频。\n" +
    "全平台，支持Ubuntu Windows7 以上 以及Macos X。\n" +
    "\t先运行本程序，当用户点击按钮，选择文件之后，程序会将文件路径传给你所编写的机器学习程序，机器学习程序预测之后将标记的图片和预测结果传给本程序，本程序会进行显示。\n" +
    "整个过程，机器学习研究员只需写三行代码。研究员无需关心任何界面细节。\n" +
    "\n" +
    "1.将UniversalGUI.py 放在你工作目录\n" +
    "2.在你的程序里 import * from UniversalGUI\n" +
    "3.运行展示程序\n" +
    "（img为opencv格式 BGR通道）\n" +
    "sendOriginImg(img) #这行代码将会把图片显示在展示程序原始图片区域\n" +
    "sendSignedImg(img) #这行程序将会把图片显示在标记图片区域\n" +
    "\tsendResult(\"识别结果：\\n 当前液面10%\")\n" +
    " # 这行代码将会把当前帧预测的结果发送给演示程序，演示程序会立即显示\n" +
    "\n" +
    "你需要编写两个函数\n" +
    "whenUserChooseImage(imagePath) #当用户点击选择图片的时候这个函数会被自动执行，imagePath即 是用户选择的图片路径，你在这里调用你的机器学习程序预测图片，然后用前文的send函数来显示预测结果。\n" +
    "whenUserChooseVideo(VideoPath) #当用户点击选择视频的时候这个函数会被自动执行，VideoPath即 是用户选择的视频路径，你在这里调用你的机器学习程序循环预测视频每一帧，然后用前文的send函数来显示预测结果和当前标记的帧。\n" +
    "\n" +
    "waitForUserClickChooseFils(whenUserChooseImage,whenUserChooseVideo)\n" +
    "将你编写得的两个函数填入waitForUserClickChooseFils 中，（不要加括号），waitForUserClickChooseFils 会阻塞程序，等待用户的操作来自动调用机器学习程序，预测结果返回给展示程序。\n";