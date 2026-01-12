import React from 'react';
import { Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import { v1 as uuidV1 } from '../utils/uuid';
import { getTimestampStr } from '../utils/date';
import { ConfigContext } from '../ConfigProvider';
import compare from '../utils/compare';
// import 'antd/es/modal/style'; // v5 不需要显式引入样式
// import 'antd/es/slider/style';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import type { UploadRequestOption } from 'rc-upload/lib/interface';

/**
 * 图片上传组件属性接口
 */
export interface ImageUploadProp {
  /** 张数限制，默认 1 */
  limit?: number,
  /** 裁切区域宽高比，width / height，默认 1 */
  aspect?: number,
  /** 显示裁切区域网格（九宫格），默认 true */
  showGrid?: boolean,
  /** 图片质量，0 ~ 1，默认 1 */
  quality?: number,
  /** 启用图片旋转功能 */
  rotationSlider?: boolean,
  /** 裁切区域形状，'rect' 方形或 'round' 圆形，默认 'rect' */
  cropShape?: 'rect' | 'round',
  /** 图片地址（受控组件） */
  value?: string;
  /**
   * 图片改变事件回调
   * @param value 图片地址或 base64 字符串
   */
  onChange?: (value: string) => void;
  /** 启用图片上传到服务器，false 则使用 base64，默认 true */
  enabledUpload?: boolean;
  /** 禁用组件，默认 false */
  disabled?: boolean;
  /** 是否需要裁剪，默认 true */
  needCrop?: boolean;
  /** 上传接口地址，需要配合 ConfigProvider 的 upload 方法使用 */
  uploadUrl?: string;
}

/**
 * 图片上传组件状态接口
 */
interface ImageUploadState {
  /** 文件列表 */
  fileList: Array<UploadFile<any>>;
}

/**
 * 图片上传组件
 * 支持图片裁剪、上传到服务器或转换为 base64
 * 基于 antd Upload 和 antd-img-crop
 * 
 * @example
 * // 基本用法（上传到服务器）
 * <ImageUpload 
 *   value={imageUrl}
 *   onChange={(url) => setImageUrl(url)}
 *   uploadUrl="/api/upload"
 * />
 * 
 * // 使用 base64（不上传到服务器）
 * <ImageUpload 
 *   value={base64}
 *   onChange={(base64) => setBase64(base64)}
 *   enabledUpload={false}
 * />
 * 
 * // 圆形裁剪（适合头像）
 * <ImageUpload 
 *   cropShape="round"
 *   aspect={1}
 *   value={avatarUrl}
 *   onChange={(url) => setAvatarUrl(url)}
 * />
 * 
 * @see https://github.com/nanxiaobei/antd-img-crop/blob/master/README.zh-CN.md
 */
class ImageUpload extends React.Component<ImageUploadProp, ImageUploadState> {
  static contextType = ConfigContext;
  declare context: React.ContextType<typeof ConfigContext>;

  /** 标记是否为组件内部触发的值变化 */
  slefChange?: boolean;

  constructor(props: ImageUploadProp) {
    super(props);
    this.state = ({
      fileList: []
    });
    this.fileToBase64 = this.fileToBase64.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.noticeChange = this.noticeChange.bind(this);
    this.getFileNameFromUrl = this.getFileNameFromUrl.bind(this);
    this.initFileList = this.initFileList.bind(this);
  }

  /** 默认属性配置 */
  static defaultProps: ImageUploadProp = {
    limit: 1,
    aspect: 1,
    showGrid: true,
    quality: 1,
    cropShape: 'rect',
    enabledUpload: true,
    disabled: false,
    needCrop: true
  };

  /**
   * 从 URL 中提取文件名
   * @param url 文件 URL
   * @returns 文件名
   */
  getFileNameFromUrl(url: string) {
    if (!url) return '';
    let name = url.substring(
      url.lastIndexOf('/') + 1,
      url.length
    );
    return name;
  }

  /**
   * 初始化文件列表
   * 根据 value 属性创建初始文件列表
   */
  initFileList() {
    let value = this.props.value;
    let fileList: Array<UploadFile<any>> = [];
    if (value) {
      fileList.push({
        name: this.getFileNameFromUrl(value),
        uid: uuidV1(),
        status: 'done',
        url: value
      });
    }
    this.setState({
      fileList: fileList
    });
  }

  /**
   * 通知父组件值已改变
   * @param fileList 当前文件列表
   */
  noticeChange(fileList: any) {
    this.slefChange = true;
    let url = '';
    if (fileList.length > 0) {
      url = fileList[0].url;
    }
    if (this.props.onChange instanceof Function) {
      this.props.onChange(url);
    }
  }

  /**
   * 生成临时文件名
   * 格式：时间戳_UUID.扩展名
   * @param file 文件对象
   * @returns 生成的文件名
   */
  getTempFileName(file: RcFile | File) {
    let fileName = getTimestampStr();
    fileName = fileName + '_' + uuidV1();
    let subfix = file.name.substring(
      file.name.lastIndexOf('.'),
      file.name.length
    );
    fileName = fileName + subfix;
    return fileName;
  }

  /**
   * 处理文件移除
   * @param file 要移除的文件
   */
  handleRemove(file: UploadFile) {
    let fileList = this.state.fileList;
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i] === file) {
        fileList.splice(i, 1);
      }
    }
    this.setState({
      fileList: [...fileList]
    });
    this.noticeChange(fileList);
    // return true; // onRemove expects boolean or void/Promise
  }

  /**
   * 将文件转换为 Base64 字符串
   * @param file 文件对象
   * @returns Base64 字符串
   */
  async fileToBase64(file: RcFile | File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event!.target!.result;
        if (result) {
          resolve(result as string);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file as Blob);
    });
  }

  /**
   * 处理文件上传
   * 根据 enabledUpload 配置决定上传到服务器或转换为 base64
   * @param param Upload 组件的上传参数
   */
  async handleUpload(param: UploadRequestOption<any>) {
    let file = param.file as RcFile;
    let fileUrl: string | undefined;
    let fileName = this.getTempFileName(file);
    const { upload, responseIsSuccess } = this.context;

    if (!this.props.enabledUpload) {
      fileUrl = await this.fileToBase64(file);
    } else {
      // 使用 ConfigProvider 的 upload 方法
      if (upload && this.props.uploadUrl) {
        let formData = new FormData();
        formData.append('fileContent', file);
        formData.append('op', 'upload');
        formData.append('insertOnly', '0');

        // 构建上传 URL
        let targetUrl = this.props.uploadUrl;
        if (!targetUrl.endsWith('/')) {
          targetUrl += '/';
        }
        targetUrl += fileName;

        try {
          let response = await upload(targetUrl, formData);

          // 使用新的 responseIsSuccess API
          if (responseIsSuccess && responseIsSuccess(response)) {
            // 直接从 response.data.data 获取数据
            fileUrl = response?.data?.data?.source_url;

            if (!fileUrl) {
              console.error('Upload response missing source_url', response);
              throw new Error('上传成功但未返回文件地址');
            }
          } else {
            throw new Error('上传失败');
          }
        } catch (e) {
          console.error("Upload failed", e);
          if (param.onError) {
            param.onError(e as any);
          }
          return;
        }
      } else {
        // 没有配置上传方法，回退到 base64
        console.warn("No upload method or uploadUrl configured, falling back to base64");
        fileUrl = await this.fileToBase64(file);
      }
    }

    if (!fileUrl) {
      if (param.onError) param.onError(new Error("上传失败，未获取到文件地址"));
      return;
    }

    if (param.onSuccess) {
      param.onSuccess(fileUrl);
    }

    let fileList = this.state.fileList;
    fileList.push({
      uid: file.uid,
      name: fileName,
      status: 'done',
      url: fileUrl
    });
    this.setState({
      fileList: [...fileList]
    });
    this.noticeChange(fileList);
  }

  componentDidMount() {
    this.initFileList();
  }

  componentDidUpdate(prevProps: ImageUploadProp) {
    if (!compare(prevProps.value, this.props.value)) {
      if (this.slefChange) {
        this.slefChange = false;
      } else {
        this.initFileList();
      }
    }
  }

  render() {
    const uploadProps = {
      listType: 'picture-card' as const,
      disabled: this.props.disabled,
      fileList: this.state.fileList,
      onRemove: this.handleRemove,
      customRequest: this.handleUpload,
    };

    if (this.props.needCrop) {
      return (
        <ImgCrop cropShape={this.props.cropShape}
          showReset
          rotationSlider={this.props.rotationSlider}
          modalCancel='取消' modalOk='确定'
          modalTitle='编辑图片' quality={this.props.quality}
          showGrid={this.props.showGrid}
          aspect={this.props.aspect}>
          <Upload {...uploadProps}>
            {this.state.fileList.length < this.props.limit! && (
              <span>+ 选择图片</span>
            )}
          </Upload>
        </ImgCrop>
      );
    } else {
      return (
        <Upload {...uploadProps}>
          {this.state.fileList.length < this.props.limit! && (
            <span>+ 选择图片</span>
          )}
        </Upload>
      );
    }
  }
}

export default ImageUpload;
