import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Palette from '../../utils/palette';
import './index.scss';

const handleList = [
    {name: '圆', type: 'arc'},
    {name: '线条', type: 'line'},
    {name: '矩形', type: 'rect'},
    {name: '多边形', type: 'polygon'},
    {name: '橡皮擦', type: 'eraser'},
    {name: '撤回', type: 'cancel'},
    {name: '前进', type: 'go'},
    {name: '清屏', type: 'clear'},
    {name: '线宽', type: 'lineWidth'},
    {name: '颜色', type: 'color'}
];
const offerOption = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

/**
 * Hook
 */

export default function Whiteboad() {
    const [peerA, setPeerA] = useState(null)
    const [peerB, setPeerB] = useState(null)
    const [allowCall, setAllowCall] = useState(true);
    const [allowHangup, setAllowHangup] = useState(true);
    const [palette, setPalette] = useState(null); // 画板
    const [color, setColor] = useState('rgba(19, 206, 102, 1)');
    const [currHandle, setCurrHandle] = useState('line');
    const [lineWidth, setLineWidth] = useState(5);
    const [sides, setSides] = useState(3);
    const [allowCancel, setAllowCancel] = useState(true);
    const [allowGo, setAllowGo] = useState(true);
    let localstream;
    const canvas = useRef(null);
    const video = useRef(null);
    useEffect(() => { // 生命周期
        if (!peerA || !peerB) createMedia();
    })
    function initPalette() {
        setPalette(new Palette(
            canvas.current,
            {
                drawColor: color,
                drawType: currHandle,
                lineWidth,
                allowCallback,
            }
        ))
    }
    function allowCallback(cancel, go) {
        setAllowCancel(!cancel);
        setAllowGo(!go);
    }
    function sidesChange() {
        palette.changeWay({ sides })
    }
    function colorChange() {
        palette.changeWay({ color })
    }
    function lineWidthChange() {
        palette.changeWay({ lineWidth })
    }
    function handleClick(v) {
        if (['cancel', 'go', 'clear'].includes(v.type)) {
            palette[v.type]();
            return;
        }
        palette.changeWay({ type: v.type })
        if (['color', 'lineWidth'].includes(v.type)) return;
        setCurrHandle(v.type)
    }
    async function call() {
        if (!peerA || !peerB) { // 判断是否有对应实例, 没有就重新创建
            initPeer();
        }
        try {
            let offer = await peerB.createOffer(offerOption); // 创建 offer
            await onCreateOffer(offer);
        } catch (e) {
            console.log('createOffer: ', e);
        }
        setAllowCall(true);
        setAllowHangup(false)
    }
    function hangup() {
        peerA.close();
        peerB.close();
        setPeerA(null);
        setPeerB(null);
        setAllowCall(false);
        setAllowHangup(true);
        palette.destroy();
        setPalette(null);
    }
    async function onCreateOffer(desc) {
        try {
            await peerB.setLocalDescription(desc); // 呼叫端设置本地 offer
        } catch (e) {
            console.log('Offer-setLocalDescription: ', e);
        }
        try {
            await peerA.setRemoteDescription(desc); // 接收端设置远程 offer
        } catch (e) {
            console.log('Offer-setRemoteDescription: ', e);
        }
        try {
            let answer = await peerA.createAnswer(); // 接收端创建 answer
            await onCreateAnswer(answer);
        } catch (e) {
            console.log('createAnswer: ', e);
        }
    }
    async function onCreateAnswer(desc) {
        try {
            await peerA.setLocalDescription(desc); // 接收端设置本地 answer
        } catch (e) {
            console.log('answer-setLocalDescription: ', e);
        }
        try {
            await peerB.setRemoteDescription(desc); // 呼叫端设置远程 answer
        } catch (e) {
            console.log('answer-setRemoteDescription: ', e);
        }
    }
    function initPeer() {
        // 创建输出端 PeerConnection
        let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        const peera = new PeerConnection();
        const peerb = new PeerConnection()
        peera.addStream(localstream); // 添加本地流
        // 监听 A 的 ICE 候选信息
        // 如果收集到, 就添加给 B
        peera.onicecandidate = e => {
            if (e.candidate) {
                peerb.addIceCandidate(e.candidate);
            }
        }
        // 创建呼叫端
        peerb.onaddstream = e => {
            // 监听是否有媒体流接入, 如果有就赋值给 video 的 src
            // console.log('event-stream', e.stream);
            video.current.srcObject = e.stream;
            initPalette(); // 初始化画板
        };
        // 监听 B 的ICE候选信息
        // 如果收集到, 就添加给A
        peerb.onicecandidate = e => {
            if (e.candidate) {
                peera.addIceCandidate(e.candidate);
            }
        }
        setPeerA(peera)
        setPeerB(peerb)
        setAllowCall(false);
    }
    async function createMedia() {
        // 保存本地流到全局
        localstream = canvas.current.captureStream();
        initPeer(); // 获取到流媒体后, 调用函数初始化 RTCPeerConnection
    }
    return (
        <div className="rtc-box">
            <ul>
                {
                    handleList.map(item => {
                        return (
                            <li key={item.type}>
                                <span>color-picker</span>
                                <button
                                    className={`${currHandle === item.type ? 'active' : ''}`}
                                    onClick={() => handleClick(item)}
                                    style={{ display: ['color', 'lineWidth', 'polygon'].includes(item.type) ? 'none' : 'block'}}
                                    disabled={
                                        item.type === 'cancel' ? allowHangup || allowCancel
                                        : item.type === 'go' ? allowHangup || allowGo : allowHangup
                                    }
                                >{item.name}</button>
                            </li>
                        )
                    })
                }
            </ul>
            <div>
                <canvas ref={canvas} width="400" height="300" />
                <h5>白板操作</h5>
            </div>
            <div>
                <video src="" ref={video} playsInline autoPlay />
                <h5>演示画面</h5>
                <button onClick={call} disabled={allowCall}>call</button>
                <button onClick={hangup} disabled={allowHangup}>hangup</button>
            </div>
        </div>
    )
}

/**
 * class 
 */
/*
export default class Whiteboad extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            peerA: null,
            peerB: null,
            allowCall: true,
            allowHangup: true,
            palette: null,
            color: 'rgba(19, 206, 102, 1)',
            currHandle: 'line',
            lineWidth: 5,
            sides: 3,
            allowCancel: true,
            allowGo: true,
        }
        this.canvas = null;
        this.video = null;
        this.localstream = null;
    }
    componentDidMount() {
        this.createMedia();
    }
    componentWillUnmount() {
        this.hangup();
        this.canvas = null;
        this.video = null;
        this.localstream = null;
    }
    initPalette = () => {
        const {color, currHandle, lineWidth, allowCallback} = this.state;
        this.setState({
            palette: new Palette(
                this.canvas,
                {
                    drawColor: color,
                    drawType: currHandle,
                    lineWidth,
                    allowCallback,
                }
            )
        })
    }
    allowCallback = (cancel, go) => {
        this.setState({
            allowCancel: !cancel,
            allowGo: !go
        });
    }
    sidesChange = () => {
        const { palette, sides } = this.state;
        palette.changeWay({ sides })
    }
    colorChange = () => {
        const { palette, color } = this.state;
        palette.changeWay({ color })
    }
    lineWidthChange = () => {
        const { palette, lineWidth } = this.state;
        palette.changeWay({ lineWidth })
    }
    handleClick = v => {
        const { palette } = this.state;
        if (['cancel', 'go', 'clear'].includes(v.type)) {
            palette[v.type]();
            return;
        }
        palette.changeWay({ type: v.type })
        if (['color', 'lineWidth'].includes(v.type)) return;
        this.setState({ currHandle: v.type })
    }
    call = async () => {
        const { peerA, peerB } = this.state;
        if (!peerA || !peerB) { // 判断是否有对应实例, 没有就重新创建
            this.initPeer();
        }
        try {
            let offer = await peerB.createOffer(offerOption); // 创建 offer
            await this.onCreateOffer(offer);
        } catch (e) {
            console.log('createOffer: ', e);
        }
        this.setState({
            allowCall: true,
            allowHangup: false
        });
    }
    hangup = () => {
        const { peerA, peerB, palette } = this.state;
        peerA.close();
        peerB.close();
        palette.destroy();
        this.setState({
            peerA: null,
            peerB: null,
            allowCall: false,
            allowHangup: true,
            palette: null,
        })
    }
    onCreateOffer = async desc => {
        const { peerB, peerA } = this.state;
        try {
            await peerB.setLocalDescription(desc); // 呼叫端设置本地 offer
            console.log('peerB offer desc', desc)
        } catch (e) {
            console.log('Offer-setLocalDescription: ', e);
        }
        try {
            await peerA.setRemoteDescription(desc); // 接收端设置远程 offer
            console.log('peerA offer desc', desc)
        } catch (e) {
            console.log('Offer-setRemoteDescription: ', e);
        }
        try {
            let answer = await peerA.createAnswer(); // 接收端创建 answer
            await this.onCreateAnswer(answer);
        } catch (e) {
            console.log('createAnswer: ', e);
        }
    }
    onCreateAnswer = async desc => {
        const { peerB, peerA } = this.state;
        try {
            await peerA.setLocalDescription(desc); // 接收端设置本地 answer
            console.log('peerA answer desc', desc)
        } catch (e) {
            console.log('answer-setLocalDescription: ', e);
        }
        try {
            await peerB.setRemoteDescription(desc); // 呼叫端设置远程 answer
            console.log('peerB answer desc', desc)
        } catch (e) {
            console.log('answer-setRemoteDescription: ', e);
        }
    }
    initPeer = () => {
        // 创建输出端 PeerConnection
        let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        const peerA = new PeerConnection();
        const peerB = new PeerConnection();
        this.setState({ peerA, peerB, allowCall: false }, () => {
            peerA.addStream(this.localstream); // 添加本地流
            // 监听 A 的 ICE 候选信息
            // 如果收集到, 就添加给 B
            peerA.onicecandidate = e => {
                if (e.candidate) {
                    console.log('peerA.candidate', e)
                    peerB.addIceCandidate(e.candidate);
                }
            }
            // 创建呼叫端
            peerB.onaddstream = e => {
                // 监听是否有媒体流接入, 如果有就赋值给 rtcB 的 src
                console.log('event-stream', e.stream);
                this.video.srcObject = e.stream;
                this.initPalette(); // 初始化画板
            };
            // 监听 B 的ICE候选信息
            // 如果收集到, 就添加给A
            peerB.onicecandidate = e => {
                if (e.candidate) {
                    console.log('peerB.candidate', e)
                    peerA.addIceCandidate(e.candidate);
                }
            }
        })
    }
    createMedia = async () => {
        // 保存本地流到全局
        this.localstream = this.canvas.captureStream();
        this.initPeer(); // 获取到流媒体后, 调用函数初始化 RTCPeerConnection
    }
    render() {
        const {currHandle, allowHangup, allowCancel, allowGo, allowCall} = this.state;
        return (
            <div className="rtc-box">
                <ul>
                    {
                        handleList.map(item => {
                            return (
                                <li key={item.type}>
                                    <span>color-picker</span>
                                    <button
                                        className={`${currHandle === item.type ? 'active' : ''}`}
                                        onClick={() => this.handleClick(item)}
                                        style={{ display: ['color', 'lineWidth', 'polygon'].includes(item.type) ? 'none' : 'block'}}
                                        disabled={
                                            item.type === 'cancel' ? allowHangup || allowCancel
                                            : item.type === 'go' ? allowHangup || allowGo : allowHangup
                                        }
                                    >{item.name}</button>
                                </li>
                            )
                        })
                    }
                </ul>
                <div>
                    <canvas ref={el => this.canvas = el} width="400" height="300" />
                    <h5>白板操作</h5>
                </div>
                <div>
                    <video src="" ref={el => this.video = el} playsInline autoPlay />
                    <h5>演示画面</h5>
                    <button onClick={this.call} disabled={allowCall}>call</button>
                    <button onClick={this.hangup} disabled={allowHangup}>hangup</button>
                </div>
            </div>
        );
    }
}
*/

Whiteboad.propTypes = {
    a: PropTypes.string,
}