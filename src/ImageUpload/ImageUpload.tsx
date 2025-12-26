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

export interface ImageUploadProp {
    /** 张数限制 */
    limit?: number,
    /** 裁切区域宽高比，width / height */
    aspect?: number,
    /** 显示裁切区域网格（九宫格） */
    showGrid?: boolean,
    /** 图片质量，0 ~ 1 */
    quality?: number,
    /** 启用图片旋转 */
    rotationSlider?: boolean,
    /** 裁切区域形状，'rect'方形 或 'round'圆形 */
    cropShape?: 'rect' | 'round',
    /** 图片地址 */
    value?: string;
    /** 改变事件 */
    onChange?: (value: string) => void;
    /** 启用图片上传 */
    enabledUpload?: boolean;
    /** 禁用组件 */
    disabled?: boolean;
    /** 是否需要裁剪 */
    needCrop?: boolean;
    /** 上传接口地址 */
    uploadUrl?: string;
}

interface ImageUploadState {
    /** 文件列表 */
    fileList: Array<UploadFile<any>>;
}

/** 文档https://github.com/nanxiaobei/antd-img-crop/blob/master/README.zh-CN.md */
class ImageUpload extends React.Component<ImageUploadProp, ImageUploadState> {
    static contextType = ConfigContext;
    declare context: React.ContextType<typeof ConfigContext>;

    /** 自改变状态 */
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

    getFileNameFromUrl(url: string) {
        if (!url) return '';
        let name = url.substring(
            url.lastIndexOf('/') + 1,
            url.length
        );
        return name;
    }

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

    async handleUpload(param: UploadRequestOption<any>) {
        let file = param.file as RcFile; // antd Upload passes RcFile
        let fileUrl: string | undefined;
        let fileName = getTimestampStr();
        const { upload, getData, isSuccess } = this.context;

        if (!this.props.enabledUpload) {
            fileUrl = await this.fileToBase64(file);
        } else {
            // 使用 ConfigProvider 的 upload 或 request
            if (upload && this.props.uploadUrl) {
                let formData = new FormData();
                formData.append('fileContent', file);
                formData.append('op', 'upload');
                formData.append('insertOnly', '0');

                // 构建上传URL (这里假设用户传入完整的 uploadUrl 或者 base URL)
                // 原代码: SysConfig.uploadApiProxy + '/' + fileName + `?sign=${ticket}`
                // 我们简化为 props.uploadUrl (base) + fileName
                let targetUrl = this.props.uploadUrl;
                if (targetUrl.endsWith('/')) {
                    targetUrl += fileName;
                } else {
                    targetUrl += '/' + fileName;
                }

                try {
                    let response = await upload(targetUrl, formData);
                    // 假设响应结构一致
                    if (response?.status === 200 || (isSuccess && isSuccess(response))) {
                        if (getData) {
                            const data = getData(response);
                            // 需要确认 data 结构
                            // 原代码: responst.data.data.source_url
                            if (data && (data as any).source_url) {
                                fileUrl = (data as any).source_url;
                            } else {
                                // Fallback
                                fileUrl = response?.data?.data?.source_url;
                            }
                        } else {
                            fileUrl = response?.data?.data?.source_url;
                        }
                    }
                } catch (e) {
                    console.error("Upload failed", e);
                    if (param.onError) {
                        param.onError(e as any);
                    }
                    return;
                }
            } else {
                // 没有配置上传方法，回退到 base64 以便演示
                console.warn("No upload method or uploadUrl configured, falling back to base64");
                fileUrl = await this.fileToBase64(file);
            }
        }

        if (!fileUrl) {
            if (param.onError) param.onError(new Error("Upload failed to get url"));
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
