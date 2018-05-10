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
import { SketchCanvas } from './src/@terrylinla/react-native-sketch-canvas';
import Canvas, {Image as CanvasImage} from 'react-native-canvas';


type Props = {};
export default class App extends Component<Props> {
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
      page: 0,
      trigger: false,
      openTime: '',
      images: [],
      pathsData: [],
    }
  }

  componentWillMount() {
    // 获取屏幕尺寸，设置画板高度, 10px不可操作区域
    const {height, width} = Dimensions.get('window');
    const boardHeight = Math.floor(height) - 10;
    const boardWidth = Math.floor(width) - 10;

    // 获取打开app时的时间戳
    const time =  Date.now();

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
  clear = (canvas1,canvas2) => {
    // 内容清空
    canvas1.clear();
    // 路径数据清空
    const {pathsData, page} = this.state;
    pathsData[page] = [];
    // 清空canvas2
    const images = this.state.images;
    images[page] = undefined;
    this.setState({
      images: images
    });
    this.clearImage(canvas2);
  };

  // 橡皮擦
  eraser = () => {
    this.setState({
      penColor: 'white',
    })
  };

  // 翻页
  pageTurn = (canvas1,canvas2, direction) => {
    // 1. 获取翻页后的页码page, direction = 1 向后翻页， direction = 0 向前翻页
    if (this.state.page === 0 && direction === 0) return;

    let page = '';

    if (direction === 1) {
      page = this.state.page + 1;
    } else {
      page = this.state.page - 1;
    }
    // 2. 读取该page的data
    const pathData = this.state.pathsData[page] || [];
    const imagesData = this.state.images[page] || [];

    // 3. 判断当前页是否已有数据,有=>复原画布，无=>清空当前画布
    if (pathData.length > 0) {
      canvas1.clear();
      for (let i = 0; i < pathData.length; i++) {
        canvas1.addPath(pathData[i])
      }
    } else {
      canvas1.clear();
    }
    if (imagesData.length > 0) {
      this.clearImage(canvas2);
      this.refreshImage(canvas2);
    } else {
      this.clearImage(canvas2);
    }
    // 4. 更新state.page状态
    this.setState({
      page: page
    })
  };

  // 保存数据
  save = (res) => {
    const {data, page, openTime, pathsData} = this.state;

    //保存原始path数据, 以用于复原路径
    if (!pathsData[page]) {
      pathsData[page] = []
    }
    pathsData[page].push(res);

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
    mutiPagesData[page] = this.pageData;

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
    console.log(saveData)

    this.setState({
      data: saveData,
      pathsData: pathsData,
    })
  };

  // 增加图片 canvas2
  addImage = (canvas) => {
    canvas.width = this.state.boardWidth - 10;
    canvas.height = this.state.boardHeight - 10;

    const context = canvas.getContext('2d');
    const image = new CanvasImage(canvas);

    image.src = 'https://image.freepik.com/free-vector/unicorn-background-design_1324-79.jpg';
    image.addEventListener('load', () => {
      context.drawImage(image, 0, 0, 100, 100);
    });

    const images = this.state.images;
    const page = this.state.page;
    if (!images[page]) {
      images[page] = []
    }
    images[page].push(1);
    this.setState({
      images: images,
    })

  };

  // 复原图片 canvas2
  refreshImage = (canvas) => {
    const images = this.state.images;
    const page = this.state.page;

    // for(let i=0; i< images[page].length; i++){
    //
    // }
    const context = canvas.getContext('2d');
    const image = new CanvasImage(canvas);

    image.src = 'https://image.freepik.com/free-vector/unicorn-background-design_1324-79.jpg';
    image.addEventListener('load', () => {
      context.drawImage(image, 0, 0, 100, 100);
    });
  };

  // 清空图片 canvas2
  clearImage = (canvas) => {
    canvas.width = this.state.boardWidth - 10;
    canvas.height = this.state.boardHeight - 10;
    const context = canvas.getContext('2d');
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.touchbar}>
          <Button title="前" onPress={() => {this.pageTurn(this.canvas1,this.canvas2,0)}}  style={styles.welcome} />
          <Button title="后" onPress={() => {this.pageTurn(this.canvas1,this.canvas2,1)}}  style={styles.welcome} />
          <Button title="粗" onPress={() => {this.changeWidth(10)}}  style={styles.welcome} />
          <Button title="细" onPress={() => {this.changeWidth(2)}} style={styles.welcome} />
          <Button title="擦" onPress={() => {this.eraser()}}  style={styles.welcome} />
          <Button title="空" onPress={() => {this.clear(this.canvas1,this.canvas2)}} style={styles.welcome}/>
          <Text style={styles.welcome}>Canvas 白板功能测试</Text>
          <Button title="红" onPress={() => {this.changeColor('red')}} style={styles.welcome} />
          <Button title="蓝" onPress={() => {this.changeColor('blue')}} style={styles.welcome} />
          <Button title="黑" onPress={() => {this.changeColor('black')}} style={styles.welcome} />
          <Button
            ref={ref => this.addImg = ref}
            title="添加图片" onPress={() => {this.addImage(this.canvas2)}} style={styles.welcome} />
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
          <View style={styles.backboard}>
            <Canvas ref={ref => this.canvas2 = ref} />
          </View>
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
    backgroundColor: '#ffffff',
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
    backgroundColor: 'hsla(0,0%,0%,0)',
    flex: 1,

  },
  backboard: {
    position: 'absolute',
    // bottom: 10,
    // borderWidth: 0.5,
    // borderColor: 'red',
    backgroundColor: 'hsla(0,0%,0%,0)',
    zIndex: -1
  }
});
