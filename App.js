/**
 * React Native App For Canvas Demo
 * @GreyGao 2018.05.08
 *
 * Link native code:
 * react-native link react-native-orientation
 * react-native link @terrylinla/react-native-sketch-canvas
 *
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Button,
  FlatList,
} from 'react-native';
import Orientation from 'react-native-orientation'
import Canvas, {Image as CanvasImage, Path2D} from 'react-native-canvas';
import { SketchCanvas } from './src/@terrylinla/react-native-sketch-canvas';


type Props = {};
export default class App extends Component<Props> {
  prePoint;
  touchX = '';
  touchY = '';
  pageData = [];
  pageAction = [];

  constructor(props) {
    super(props);
    this.state = {
      // 关键参数 屏幕尺寸=>画布大小、笔刷类型、笔刷颜色、笔刷粗细
      penType: '',
      penColor: 'red',
      penWidth: 3,
      prePenColor: 'red',
      boardHeight: '',
      boardWidth: '',
      data: {
        meta: {},
        data: [],
        action: [],
      },
      page: 1,
      trigger: false,
      openTime: '',
      images: [1,2],
    }
  }

  componentWillMount() {
    this.board = {
      // 开启touch事件监听
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,

      // 外层View拦截点击事件
      // onStartShouldSetResponderCapture: () => true,
      // onMoveShouldSetResponderCapture: ()=> true,

      // touch事件监听回调

      onResponderMove: (e) => {
        // console.log(e.nativeEvent)
        // this.touchX = e.nativeEvent.locationX
        // this.touchY = e.nativeEvent.locationY
        // console.log(this.touchX, this.touchY)
      },
      onResponderRelease: (e) => {
        // console.log(e)
      },
    };

    // 获取屏幕尺寸，设置画板高度, 10px不可操作区域
    const {height, width} = Dimensions.get('window');
    const boardHeight = Math.floor(height) - 10;
    const boardWidth = Math.floor(width) - 10;

    // 获取打开app时的时间戳
    const time =  Date.now()

    this.setState({
      boardHeight: boardHeight,
      boardWidth: boardWidth,
      openTime: time,
    })
  }

  componentDidMount() {
    // 强制横屏
    Orientation.lockToLandscape()

  }

  // 画笔颜色
  changeColor = (color) => {
    this.setState({
      penColor: color,
      prePenColor: color,
    })
  };

  // 画笔粗细
  changeWidth = (width) => {
    this.setState({
      penWidth: width,
      penColor: this.state.prePenColor,
    })
  };

  // 清空画布
  clear = (canvas) => {
    canvas.clear()
  };

  // 橡皮擦
  eraser = () => {
    this.setState({
      penColor: 'white',
    })
  };

  // 保存数据
  save = (res) => {
    const {data, page, openTime} = this.state;

    // meta数据
    let meta = {
      width: this.state.boardWidth,
      height: this.state.boardHeight,
    };

    // 提取画笔数据
    const pathData = res.path.data;
    // 每一笔的时间戳
    const lineTime = Date.now() - this.state.openTime;

    // 每一笔的数据集合，数组
    let linesArray = [];
    for (let i = 0; i < pathData.length; i++) {
      let cor = pathData[i];
      let res = cor.split(',');
      let t = +res[2] - openTime;
      let line = {
        x: +res[0],
        y: +res[1],
        p: 1,
        t: t
      };
      linesArray.push(line)
    }

    let lineData = {
      data: linesArray,
      style: {
        color: res.path.color,
        width: res.path.width,
      },
      timestamp: lineTime
    };

    // 当前页的画笔数据集合，数组
    this.pageData.push(lineData);

    // 多页的数据
    let mutiPagesData = data.data;
    mutiPagesData[page - 1] = this.pageData;

    // action
    let mutiAction = data.action;
    if (this.state.trigger) {
      // 单个action数据
      let actionData = {
        type: '',
        content: {
          url: 'xxxx',
          angle: 12,
          x: 1,
          y: 2,
          width: 12,
          height: 12,
        },
        timestamp: 123
      };
      // 多个action数据
      mutiAction.push(actionData);
    }

    // 保存完整data
    let saveData = {
      meta: meta,
      data: mutiPagesData,
      action: mutiAction,
    };
    console.log(saveData);

    this.setState({
      data: saveData
    })
  };

  handleImageRect(canvas) {
    const image = new CanvasImage(canvas);
    canvas.width = 100;
    canvas.height = 100;

    const context = canvas.getContext('2d');

    image.src = 'https://image.freepik.com/free-vector/unicorn-background-design_1324-79.jpg';
    image.addEventListener('load', () => {
      console.log('image is loaded');
      context.drawImage(image, 0, 0, 100, 100);
    });
  }

  addImage = () => {
    const images = this.state.images
    images.push(1);
    console.log(this.state.images)
    this.setState({
      images: images,
    })
  }

  renderCanvas = () => {
    return (
      <Canvas ref={this.handleImageRect} />
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.touchbar}>
          <Button title="粗" onPress={() => {this.changeWidth(4)}}  style={styles.welcome} />
          <Button title="细" onPress={() => {this.changeWidth(1)}} style={styles.welcome} />
          <Button title="擦" onPress={() => {this.eraser()}}  style={styles.welcome} />
          <Button title="空" onPress={() => {this.clear(this.canvas1)}} style={styles.welcome}/>
          <Text style={styles.welcome}>Canvas 白板功能测试</Text>
          <Button title="红" onPress={() => {this.changeColor('red')}} style={styles.welcome} />
          <Button title="蓝" onPress={() => {this.changeColor('blue')}} style={styles.welcome} />
          <Button title="黑" onPress={() => {this.changeColor('black')}} style={styles.welcome} />
          <Button title="添加图片" onPress={this.addImage} style={styles.welcome} />
        </View>

        <View style={styles.board}>
          <SketchCanvas
            ref={ref => this.canvas1 = ref}
            style={{width: this.state.boardWidth, height: this.state.boardHeight}}
            strokeColor={this.state.penColor}
            strokeWidth={this.state.penWidth}
            onStrokeEnd={data => {
              // console.log(data)
              this.save(data)
            }}
          />
          {/*<FlatList*/}
            {/*data = {this.state.images}*/}
            {/*keyExtractor={this.keyExtractor}*/}
            {/*renderItem = {({item}) => {*/}
              {/*return (<Text>1</Text>)*/}
              {/*}*/}
            {/*}*/}
          {/*/>*/}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffda0',
  },
  touchbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    margin: 10,
  },
  board: {
    backgroundColor: 'white',
    flex: 1,
  },
});
