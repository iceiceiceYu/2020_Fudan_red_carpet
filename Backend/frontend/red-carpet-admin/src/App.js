import React, {Component} from 'react';
import {Tabs} from 'antd';
import 'antd/dist/antd.css';
import Setting from './components/Setting.js';
import Review from "./components/Review.js";
import Login from "./components/Login.js";
import API, {emptyFunction} from "./utils/API";


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            login: false
        };
        API.onLogout = this.logout;
    }

    login = () => {
        this.setState({login: true});
    };

    logout = () => {
        this.setState({login: false});
    };

    componentDidMount() {
        API.get("/checkToken")
            .then(res => {
                if (res.data.status === 1) {
                    this.login();
                }
            }).catch(emptyFunction);
    }

    render() {
        const {login} = this.state;
        if (!login)
            return (<Login onLogin={this.login}/>);

        return (
            <div style={{backgroundColor: '#fff', padding: '10px 50px', paddingBottom: '0px'}}>
                <Tabs type="card" tabBarGutter={5}>
                    <Tabs.TabPane tab="Review" key="1"> <Review/> </Tabs.TabPane>
                    <Tabs.TabPane tab="Setting" key="2"> <Setting onLogout={this.logout}/> </Tabs.TabPane>
                </Tabs>
            </div>
        );
    }
}

export default App;
