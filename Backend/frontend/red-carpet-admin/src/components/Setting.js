import React, {Component} from "react";
import {Button, DatePicker, Form, message, Modal, Switch} from 'antd/lib/index';
import API, {baseUrl, emptyFunction} from '../utils/API';
import moment from 'moment/moment';
import {Icon, Tooltip, Upload} from "antd";

const confirm = Modal.confirm;

class Setting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            _switch: null,
            endTime: null,
        };

        this.switchClickHandler = this.switchClickHandler.bind(this);
        this.endTimeOkHandler = this.endTimeOkHandler.bind(this);
        this.refreshSwitch = this.refreshSwitch.bind(this);
        this.refreshEndTime = this.refreshEndTime.bind(this);
    }

    refreshSwitch() {
        API.get(`/setting/switch`)
            .then(res => {
                console.log(res.data);
                if (res.data.status === 1) {
                    this.setState({
                        _switch: res.data.data
                    });
                }
            }).catch(emptyFunction);
    }

    refreshEndTime() {
        API.get(`/setting/endTime`)
            .then(res => {
                console.log(res.data);
                if (res.data.status === 1) {
                    this.setState({
                        endTime: moment(res.data.data)
                    });
                }
            })
            .catch(emptyFunction);
    }

    switchClickHandler(e) {
        console.log(e);
        confirm({
            title: e ? "你确定要开启系统吗？" : "你确定要关闭系统吗？",
            okType: 'danger',
            onOk: () => {
                API.post(`/setting/switch?_switch=${e}`)
                    .then(res => {
                        console.log(res);
                        if (res.data.status === 1) {
                            this.setState({
                                _switch: e
                            });
                            message.success(e ? "系统成功开启" : "系统成功关闭")
                        }
                    }).catch(emptyFunction);
            },
        });
    }

    endTimeOkHandler() {
        const {endTime} = this.state;

        confirm({
            title: `你确定要更改结束时间为以下时间吗？`,
            content: "\t" + endTime.format('YYYY-MM-DD HH:mm:ss'),
            okType: 'danger',
            onOk: () => {
                const formData = new FormData();
                formData.append("time", endTime.valueOf());
                API.post(`/setting/endTime`, formData)
                    .then(res => {
                        if (res.data.status === 1) {
                            this.refreshEndTime();
                        }
                    }).catch(emptyFunction);
            },
            onCancel: () => {
                this.refreshEndTime();
            }
        });
    };

    handleLogout = e => {
        e.preventDefault();
        API.get(`/logout`)
            .then(res => {
                if (res.data.status === 1 && this.props.onLogout) {
                    this.props.onLogout();
                }
            }).catch(emptyFunction);
    };

    componentDidMount() {
        this.refreshSwitch();
        this.refreshEndTime();
    }

    render() {
        const {_switch, endTime} = this.state;

        const endTimeChangeHandler = date => {
            this.setState({endTime: date});
        };

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 12},
        };

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };

        return (
            <Form {...formItemLayout}>
                {_switch != null &&
                <Form.Item label="红毯投票小程序开关">
                    <Switch checked={this.state._switch} onClick={this.switchClickHandler}/>
                </Form.Item>
                }
                {endTime &&
                <Form.Item label="结束时间">
                    <DatePicker showTime value={endTime} onChange={endTimeChangeHandler}
                                allowClear={false}
                                onOpenChange={isOpen => {
                                    if (!isOpen) this.endTimeOkHandler();
                                }}/>
                </Form.Item>
                }
                <Form.Item label="Banner 1">
                    <PictureUpload url={`${baseUrl}/image/banner1`}/>
                </Form.Item>
                <Form.Item label="Banner 2">
                    <PictureUpload url={`${baseUrl}/image/banner2`}/>
                </Form.Item>
                <Form.Item label="Banner 2 Detail">
                    <PictureUpload url={`${baseUrl}/image/banner2Detail`}/>
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    <Button type={"dashed"}
                            onClick={this.handleLogout}>登出</Button>
                </Form.Item>
            </Form>
        )
    }
}


/**
 * Show & Upload a picture
 * */
class PictureUpload extends React.Component {
    state = {
        current: new Date(),
        loading: false
    };

    // test
    handleUpload(file) {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file);
        xhr.open('POST', this.props.url, true);
        this.setState({loading: true});
        xhr.onload = () => {
            this.setState({current: new Date(), loading: false});
            message.success("图片上传成功");
        };
        xhr.send(formData);
    }

    render() {
        const {loading} = this.state;
        return (
            <Tooltip title="点击图片进行更换">
                <span>
                <Upload
                    showUploadList={false}
                    listType="picture-card"
                    beforeUpload={(file) => {
                        this.handleUpload(file);
                        return false;
                    }}
                >
                    {loading ? <Icon type='loading'/> :
                        <img src={`${this.props.url}?date=${this.state.current}`} style={{maxWidth: '300px'}}
                             alt='loading...'/>}
                </Upload>
                </span>
            </Tooltip>
        )
    }
}

export default Setting;