import React, {Component} from 'react';
import {Button, Card, Col, Empty, Modal, Row, Tooltip} from 'antd';
// import {ipcRenderer} from "electron";
import 'antd/dist/antd.css';
import './App.css';

const {Meta} = Card;
const {ipcRenderer, remote} = window.require("electron");

const net = window.require("net");

function ZoomedImg(props) {
    return (
        <Modal
            visible={props.visible}
            title={"放大图片"}
        >Test</Modal>
    );
}

class OriginPic extends Component {
    constructor(props) {
        super(props);
        this.state = {imgBase64: "", imgBase64Temp: "", modalVisible: false}
    }

    componentDidMount() {
        let port = 6002;
        let hostname = '127.0.0.1';
        let server = new net.createServer();

        server.on('connection', (client) => {
            client.on('data', msg => { //接收client发来的信息
                if (String(msg).endsWith("socketEnd")) {
                    this.setState({imgBase64: this.state.imgBase64Temp + msg.slice(0, -9)});
                    this.setState({imgBase64Temp: ""})
                } else
                    this.setState({imgBase64Temp: this.state.imgBase64Temp + String(msg)});

            });

        });
        server.on("error", e => {
            remote.dialog.showErrorBox('绑定端口失败', '请检查本机6002端口是否被占用\n错误代码：' + e);
        });
        server.listen(port, hostname, () => {
            console.log(`服务器运行在：http://${hostname}:${port}`);
        });
    }

    render() {
        if (this.state.imgBase64 === "")
            return (
                <div>
                    <Tooltip placement="right" title="原始图片" arrowPointAtCenter>
                        <Card title="原始图片" bordered={false} style={{width: 600}} className="OriginPic">
                            <Empty description={"尚未选择文件"}/>
                        </Card>

                    </Tooltip>
                </div>
            );
        let base64 = "data:image/jpg;base64," + this.state.imgBase64;
        return (
            <div>
                <Tooltip placement="right" title="原始图片" arrowPointAtCenter>
                    <Card title="原始图片" bordered={false} style={{width: 600}} className="OriginPic"
                          onClick={() => this.setState({modalVisible: true})}>
                        <img className={"image"} src={base64}/>

                    </Card>
                </Tooltip>
                <Modal title={"放大图片"}
                       centered
                       visible={this.state.modalVisible}
                       onCancel={() => {
                           this.setState({modalVisible: false})
                       }}
                       footer={""}
                       width={"90vw"}
                >
                    <img className={"zoomedImage"} src={base64} onClick={() => this.setState({modalVisible: false})}/>
                </Modal>
            </div>
        );
    }
}

class SignedPic extends Component {
    constructor(props) {
        super(props);
        this.state = {imgBase64: "", imgBase64Temp: "", modalVisible: false}
    }

    componentDidMount() {
        let port = 6003;
        let hostname = '127.0.0.1';
        let server = new net.createServer();

        server.on('connection', (client) => {
            client.on('data', msg => { //接收client发来的信息
                if (String(msg).endsWith("socketEnd")) {
                    this.setState({imgBase64: this.state.imgBase64Temp + msg.slice(0, -9)});
                    this.setState({imgBase64Temp: ""})
                } else
                    this.setState({imgBase64Temp: this.state.imgBase64Temp + String(msg)});

            });

        });
        server.on("error", e => {
            remote.dialog.showErrorBox('绑定端口失败', '请检查本机6003端口是否被占用\n错误代码：' + e);
        });
        server.listen(port, hostname, () => {
            console.log(`服务器运行在：http://${hostname}:${port}`);
        });
    }

    render() {
        if (this.state.imgBase64 === "")
            return (
                <div>
                    <Tooltip placement="right" title="标记图片" arrowPointAtCenter>
                        <Card title="标记图片" bordered={false} style={{width: 600}} className={"SignedPic"}>
                            <Empty description={"暂无数据"}/>
                        </Card>

                    </Tooltip>
                </div>
            );
        let base64 = "data:image/jpg;base64," + this.state.imgBase64;
        return (
            <div>
                <Tooltip placement="right" title="标记图片" arrowPointAtCenter>
                    <Card title="标记图片" bordered={false} style={{width: 600}} className="SignedPic">
                        <img className={"image"} src={base64} onClick={() => this.setState({modalVisible: true})}/>
                    </Card>
                </Tooltip>
                <Modal title={"放大图片"}
                       centered
                       visible={this.state.modalVisible}
                       onCancel={() => {
                           this.setState({modalVisible: false})
                       }}
                       footer={""}
                       width={"90vw"}
                >
                    <img className={"zoomedImage"} src={base64} onClick={() => this.setState({modalVisible: false})}/>
                </Modal>
            </div>
        );
    }
}

class ControlButtons extends Component {
    constructor(props) {
        super(props);
        this.state = {picButtonLoading: false, videoButtonLoading: false};
        this.chooseFileButtonClicked = this.chooseFileButtonClicked.bind(this);
        this.getPath = this.getPath.bind(this);

    }

    static sendMessage(buttonID, path) {
        let connect;
        connect = new net.connect({port: 6001});
        connect.on("connect", function () {
            // 连接成功之后
            connect.write(buttonID + path, "utf8");
        });
        connect.on("error", function (e) {
            remote.dialog.showErrorBox('操作错误', '请检查机器学习程序是否设置正确，是否打开');
        });
    }

    componentDidMount() {
        ipcRenderer.on('selectedPicItem', (event, filePath) => this.getPath(event, filePath, 0));
        ipcRenderer.on('selectedVideoItem', (event, filePath) => this.getPath(event, filePath, 1));
    }

    getPath(event, filePath, buttonID) {
        switch (buttonID) {
            case 0:
                this.setState({picButtonLoading: false});
                if (filePath !== undefined)
                    ControlButtons.sendMessage(0, filePath);
                break;
            case 1:
                this.setState({videoButtonLoading: false});
                if (filePath !== undefined)
                    ControlButtons.sendMessage(1, filePath);
                break;
        }
    }

    chooseFileButtonClicked(buttonID) {
        switch (buttonID) {
            case 0:
                ipcRenderer.send('choosePicFiledialog');
                this.setState({picButtonLoading: true});
                break;
            case 1:
                ipcRenderer.send('chooseVideoFiledialog');
                this.setState({videoButtonLoading: true});
                break;
        }
    }

    render() {
        return (
            <div>
                <div className={"oneButton"}>
                    <Button type={"primary"} size={"large"} loading={this.state.picButtonLoading}
                            onClick={() => this.chooseFileButtonClicked(0)}>
                        选择图片文件</Button>
                </div>
                <div className={"oneButton"}>
                    <Button type={"primary"} size={"large"} loading={this.state.videoButtonLoading}
                            onClick={() => this.chooseFileButtonClicked(1)}>
                        选择视频文件</Button>
                </div>
            </div>
        );
    }
}

class BackendMessage extends Component {
    constructor(props) {
        super(props);
        this.state = {message: "", messageTemp: ""}
    }

    componentDidMount() {

        const port = 6000;
        const hostname = '127.0.0.1';
        const server = new net.createServer();

        server.on('connection', (client) => {
            client.on('data', msg => { //接收client发来的信息
                if (String(msg).endsWith("socketEnd")) {
                    this.setState({message: this.state.messageTemp + msg.slice(0, -9)});
                    this.setState({messageTemp: ""})
                } else
                    this.setState({messageTemp: this.state.messageTemp + String(msg)});

            });

        });
        server.listen(port, hostname, () => {
            // console.log(`服务器运行在：http://${hostname}:${port}`);
        });
    }

    render() {
        return (
            <div>
                <div>
                    <Tooltip placement="topLeft" title="计算结果" arrowPointAtCenter>
                        <div className={"messageBlock"}>
                            {this.state.message}
                        </div>
                    </Tooltip>
                </div>
            </div>
        );
    }


}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {input: ""}

    }

    componentDidMount() {
        window.addEventListener("keydown", function (event) {
            if (event.preventDefaulted) {
                return; // Do nothing if event already handled
            }

            switch (event.code) {
                case "KeyW":
                    this.setState({input: "w"});
                    break;
                case "KeyH":
                    if (this.state.input !== "w")
                        this.setState({input: ""});
                    else {
                        this.setState({input: "wh"});
                        break;
                    }
                case "KeyO":
                    if (this.state.input !== "wh")
                        this.setState({input: ""});
                    else {
                        this.setState({input: ""});
                        alert("作者:代强 2020年3月28日23:21:10")
                    }
                    break;
                default:
                    this.setState({input:""})
            }
            //
            // // Consume the event so it doesn't get handled twice
            // event.preventDefault();
        }.bind(this), true);
    }

    render() {
        return (
            <div className="App">
                <Row>
                    <Col xs={1}/>
                    <Col xs={14}>
                        <Row>

                            <Col xs={24}>
                                <div className={"OriginPicFramework"}>
                                    <OriginPic/>
                                </div>
                            </Col>
                            <Col xs={24}>
                                <div className={"SignedPicFramework"}>
                                    <SignedPic/>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={7}>
                        <Row>
                            <Col xs={24} className={"ControlButtons"}>
                                <ControlButtons/>
                            </Col>
                            <Col xs={24} className={"BackendMessage"}>
                                <BackendMessage/>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={2}/>
                </Row>
            </div>
        );
    }
}


export default App;
