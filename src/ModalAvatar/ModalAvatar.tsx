import React from 'react';
import { Avatar, Modal, Tooltip } from 'antd';

/**
 * 模态框头像组件属性接口
 */
export interface ModalAvatarProp {
  /** 图片地址 */
  src: string
}

/**
 * 模态框头像组件状态接口
 */
interface ModalAvatarState {
  /** 是否显示预览弹窗 */
  showModal: boolean
}


/**
 * 模态框头像组件
 * 点击头像可在模态框中预览大图
 * 
 * @example
 * <ModalAvatar src="/avatar.jpg" />
 */
class ModalAvatar extends React.Component<ModalAvatarProp, ModalAvatarState> {
  constructor(props: ModalAvatarProp) {
    super(props);
    this.state = {
      showModal: false
    };
    this.handleClick = this.handleClick.bind(this);
  }

  /**
   * 处理头像点击事件
   * 如果有图片地址则显示预览弹窗
   */
  handleClick() {
    let { src } = this.props;
    if (src) {
      this.setState({
        showModal: true
      });
    }
  }

  render() {
    return (
      <>
        <Modal
          title='预览'
          open={this.state.showModal}
          footer={null}
          destroyOnHidden
          onCancel={() => {
            this.setState({
              showModal: false
            });
          }}
        >
          <img style={{ width: '100%' }} src={this.props.src} />
        </Modal>
        <Tooltip title='点击预览'>
          <Avatar {...this.props} onClick={this.handleClick} />
        </Tooltip>
      </>
    );
  }
}

export default ModalAvatar;