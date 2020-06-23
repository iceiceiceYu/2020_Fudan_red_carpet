import React, {Component} from "react";
import {Button, Form, Icon, Input} from 'antd/lib/index';
import API, {emptyFunction} from '../utils/API'

class Login extends Component {
    componentDidMount() {
        this.input.focus();
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const formData = new FormData();
                formData.append("username", values.username);
                formData.append("password", values.password);
                API.post(`/login`, formData)
                    .then(res => {
                        if (res.data.status === 1 && this.props.onLogin) {
                            this.props.onLogin();
                        }
                    }).catch(emptyFunction);
            }
        });
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} style={{maxWidth: "300px", margin: "100px auto", textAlign: 'center'}}>
                <Form.Item>
                    <h1>Red Carpet Admin</h1>
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('username', {
                        rules: [{required: true, message: 'Please input your username!'}],
                    })(
                        <Input ref={(input) => this.input = input}
                               prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                               placeholder="Admin"/>
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{required: true, message: 'Please input your Password!'}],
                    })(
                        <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>} type="password"
                               placeholder="Password"/>
                    )}
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{width: "100%"}}
                    >
                        Log in
                    </Button>
                </Form.Item>
            </Form>

        );
    }

}

export default Form.create()(Login);