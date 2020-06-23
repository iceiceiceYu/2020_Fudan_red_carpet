import React from 'react';
import {Button, Col, DatePicker, Form, Icon, Input, Modal, Row, Select, Table} from "antd/lib/index";
import API, {baseUrl, emptyFunction} from '../utils/API'
import moment from "moment/moment";
import {json2excel} from 'js2excel'

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

const {confirm} = Modal;

export default class Review extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nominees: null,
            nominee: null,
            nomineeVotes: null
        }
    }

    refreshNominees = () => {
        API.get("/nominee").then(res => {
            console.log(res);
            console.log(res.data.data);
            if (res.data.status === 1) {
                res.data.data.forEach(nominee => nominee.timestamp = moment(nominee.timestamp));
                this.setState({nominees: res.data.data});
                if (this.state.nominee) {
                    this.chooseNominee(this.state.nominee.id);
                }
            }
        }).catch(emptyFunction);

    };

    refreshVotes = (nominee) => {
        this.setState({nomineeVotes: null});
        if (nominee.state === "PASSED")
            API.get(`/vote?nomineeId=${nominee.id}`)
                .then(res => {
                    console.info(res.data.data);
                    if (res.data.status === 1) {
                        res.data.data.forEach(vote => {
                            vote.timestamp = moment(vote.timestamp);
                        });
                        this.setState({nomineeVotes: res.data.data})
                    }
                })
                .catch(emptyFunction);
        else
            this.setState({nomineeVotes: null});
    };

    componentDidMount() {
        this.refreshNominees();
    }

    chooseNominee = (nomineeId) => {
        const {nominees} = this.state;
        const nominee = nominees.find(nominee => nominee.id === nomineeId);
        this.setState({nominee});
        this.refreshVotes(nominee);
    };

    exportNomineeExcel = () => {
        try {
            json2excel({
                data: this.state.nominees,
                name: 'user-info-data',
                formateDate: 'YYYY-MM-DD '
            });
        } catch (e) {
            console.error('export error');
        }
    };


    render() {
        let {nominees, nominee, nomineeVotes} = this.state;
        let pendingNumber = 0;
        if (nominees)
            pendingNumber = nominees.filter(nominee => nominee.state === 'PENDING').length;
        return (
            <div>
                {nominees &&
                <Row>
                    <Col span={7}>
                        <h2 style={{textAlign: 'center'}}>Nominee Table</h2>
                        <p style={{textAlign: 'center'}}>当前未审核的人数为 <b style={{color: 'red'}}>{pendingNumber}</b></p>
                        <NomineeTable nominees={nominees} onClickRow={this.chooseNominee}/>
                        <Button type="primary" onClick={this.exportNomineeExcel}>导出excel</Button>
                    </Col>

                    {nominee &&
                    <Col span={8}>
                        <h2 style={{textAlign: 'center'}}>Information in detail</h2>
                        <NomineeForm nominee={nominee} refreshCallback={this.refreshNominees}/>
                    </Col>
                    }

                    {nomineeVotes && nomineeVotes.length > 0 &&
                    < Col span={9}>
                        <Row>
                            <h2 style={{textAlign: 'center'}}>Vote table</h2>
                            <VoteTable votes={nomineeVotes} refreshCallback={() => {
                                this.refreshNominees();
                                this.refreshVotes(this.state.nominee);
                            }}/>
                        </Row>
                        {/*<Row>*/}
                        {/*    <VoteChart votes={nomineeVotes}/>*/}
                        {/*</Row>*/}
                        <Row>
                            <VoteAmChart votes={nomineeVotes}/>
                        </Row>
                    </Col>
                    }
                </Row>
                }
            </div>
        )
    }
}

// search column
const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters,}) => (
        <div style={{padding: 8}}>
            <Input
                placeholder={`Search ${dataIndex}`}
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={confirm}
                style={{width: 188, marginBottom: 8, display: 'block'}}
            />
            <Button
                type="primary"
                onClick={confirm}
                icon="search"
                size="small"
                style={{width: 90, marginRight: 8}}
            >
                Search
            </Button>
            <Button
                onClick={clearFilters}
                size="small"
                style={{width: 90}}
            >
                Reset
            </Button>
        </div>
    ),
    filterIcon: filtered => <Icon type="search" style={{color: filtered ? '#1890ff' : undefined}}/>,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
});

function NomineeTable({nominees, onClickRow}) {
    const columns = [{
        title: 'id',
        dataIndex: 'id',
        sorter: (a, b) => a.id - b.id,
        width: '10px'
    }, {
        title: 'name',
        dataIndex: 'name',
        ...getColumnSearchProps('name')
    }, {
        title: 'state',
        dataIndex: 'state',
        filters: [{
            text: 'PASSED',
            value: 'PASSED'
        }, {
            text: 'PENDING',
            value: 'PENDING'
        }, {
            text: 'REJECTED',
            value: 'REJECTED'
        }],
        onFilter: (value, record) => record.state === value
    }, {
        title: 'votes',
        dataIndex: 'votes',
        sorter: (a, b) => a.votes - b.votes
    }];
    return (
        <Table columns={columns}
               dataSource={nominees || []}
               rowKey={'id'}
               size={'small'}
               onRow={record => {
                   return {onClick: () => onClickRow(record.id)}
               }}
        />
    )

}

class NomineeForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {nominee: Object.assign({}, props.nominee)}; // shallow copy

        this.handleChange = this.handleChange.bind(this);
        this.handleReview = this.handleReview.bind(this);
        this.handleChangeClick = this.handleChangeClick.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({nominee: Object.assign({}, nextProps.nominee)});
    }

    handleChange(attr, value) {
        const {nominee} = this.state;
        nominee[attr] = value;
        this.setState({nominee});
    }

    handleReview(state) {
        const {nominee} = this.state;
        const formData = new FormData();
        formData.append("id", nominee.id);
        formData.append("nomineeState", state);

        API.post(`/nominee/review`, formData)
            .then(res => {
                if (res.data.status === 1) {
                    this.props.refreshCallback();
                }
            }).catch(emptyFunction);
    }

    handleChangeClick() {
        const {nominee} = this.state;
        console.log(nominee);
        confirm({
            title: `你确定要修改#${nominee.id}候选人的信息吗？`,
            okType: 'danger',
            onOk: () => {
                API.post('/nominee/update', JSON.stringify(nominee), {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                }).then(res => {
                    if (res.data.status === 1) {
                        this.props.refreshCallback();
                    }
                }).catch(emptyFunction);
            }
        });
    }

    render() {
        const {nominee} = this.state;
        const stableNominee = this.props.nominee;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 15},
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 6,
                },
            },
        };
        return (
            <Form {...formItemLayout}>
                <Form.Item label={'ID'}>
                    <Input value={nominee.id} disabled/>
                </Form.Item>
                <Form.Item label={'Name'}>
                    <Input value={nominee.name} onChange={event => this.handleChange('name', event.target.value)}/>
                </Form.Item>
                <Form.Item label={'Introduction'}>
                    <Input value={nominee.introduction}
                           onChange={event => this.handleChange('introduction', event.target.value)}/>
                </Form.Item>
                <Form.Item label={'Nominating Time'}>
                    <DatePicker showTime value={moment(nominee.nominatingTime)}
                                onChange={(date) => this.handleChange('nominatingTime', date)}/>
                </Form.Item>
                <Form.Item label={'Nominator Name'}>
                    <Input value={nominee.nominatorName}
                           onChange={event => this.handleChange('nominatorName', event.target.value)}/>
                </Form.Item>
                <Form.Item label={'Nominator Phone'}>
                    <Input value={nominee.nominatorPhone}
                           onChange={event => this.handleChange('nominatorPhone', event.target.value)}/>
                </Form.Item>
                {stableNominee.state !== 'PENDING' &&
                <Form.Item label={'State'}>
                    <Select value={nominee.state} onChange={value => this.handleChange('state', value)}>
                        <Select.Option value='PASSED'>PASSED</Select.Option>
                        <Select.Option value='REJECTED'>REJECTED</Select.Option>
                        <Select.Option value='PENDING'>PENDING</Select.Option>
                    </Select>
                </Form.Item>
                }
                <Form.Item label={'Story'}>
                    <Input.TextArea value={nominee.story} autosize
                                    onChange={event => this.handleChange('story', event.target.value)}/>
                </Form.Item>
                {nominee.photoUrl1 !== '' &&
                <Form.Item label={'Photo1'}>
                    <img style={{maxWidth: '300px'}} src={`${baseUrl}/image/${nominee.photoUrl1}`} alt='loading...'/>
                    <div/>
                    <Button type='danger' size='small' onClick={e => this.handleChange('photoUrl1', "")}>Delete</Button>
                </Form.Item>}
                {nominee.photoUrl2 !== '' &&
                <Form.Item label={'Photo2'}>
                    <img style={{maxWidth: '300px'}} src={`${baseUrl}/image/${nominee.photoUrl2}`} alt='loading...'/>
                    <div/>
                    <Button type='danger' size='small' onClick={e => this.handleChange('photoUrl2', "")}>Delete</Button>
                </Form.Item>}
                {stableNominee.state !== 'PENDING' ?
                    <div>
                        <Form.Item label={'Reviewed Time'}>
                            <DatePicker showTime value={nominee.reviewedTime ? moment(nominee.reviewedTime) : null}
                                        onChange={(date) => this.handleChange('reviewedTime', date)}/>
                        </Form.Item>
                        <Form.Item label={'Votes'}>
                            <Input value={nominee.votes}
                                   onChange={event => this.handleChange('votes', event.target.value)}/>
                        </Form.Item>
                        <Form.Item {...tailFormItemLayout}>
                            <Button type="dashed" onClick={this.handleChangeClick}>修改</Button>
                        </Form.Item>
                    </div>
                    :
                    <div>
                        <Form.Item {...tailFormItemLayout}>
                            <Button type="primary" onClick={() => this.handleReview("PASSED")}>通过</Button>
                            <span style={{margin: "0 10px"}}/>
                            <Button type="danger" onClick={() => this.handleReview("REJECTED")}>不通过</Button>
                        </Form.Item>
                    </div>
                }
            </Form>
        )
    }
}

function VoteTable({votes, refreshCallback}) {
    const columns = [{
        title: 'user_id',
        dataIndex: 'user.id',
        sorter: (a, b) => a.id - b.id
    }, {
        title: 'weight',
        dataIndex: 'weight',
        sorter: (a, b) => a.weight - b.weight
    }, {
        title: 'ip',
        dataIndex: 'ip'
    }, {
        title: 'timestamp',
        dataIndex: 'timestamp',
        render: (text, record) => record.timestamp.format('YYYY-MM-DD HH:mm:ss'),
        sorter: (a, b) => a.timestamp.diff(b.timestamp)
    }, {
        title: 'Action',
        render: (text, record) => (
            <Button onClick={() => {
                confirm({
                    title: 'Are you delete this vote?',
                    okText: 'Yes',
                    okType: 'danger',
                    cancelText: 'No',
                    onOk: () => {
                        API.get(`/vote/delete?voteId=${record.id}`)
                            .then(res => {
                                console.log(res.data);
                                if (res.data.status === 1) {
                                    refreshCallback();
                                }
                            }).catch(emptyFunction);

                    }
                });
                console.log(record.id)
            }}
                    size='small'
                    type='danger'
            >
                Delete
            </Button>
        )
    }];
    return (
        <Table
            columns={columns}
            dataSource={votes || []}
            rowKey={'id'}
            size={'small'}
        />
    )
}

class VoteAmChart extends React.Component {
    componentDidMount() {
        let chart = am4core.create("chartdiv", am4charts.XYChart);

        const votes = this.props.votes;
        votes.sort((a, b) => (a.timestamp.diff(b.timestamp)));
        const data = [];
        let sum = 0;
        votes.forEach(vote => {
            sum += vote.weight;
            data.push({
                x: vote.timestamp.toDate(),
                y: sum
            })
        });

        chart.data = data;

        // Create axes
        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 50;

        chart.yAxes.push(new am4charts.ValueAxis());

        // Create series
        let series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = "y";
        series.dataFields.dateX = "x";
        series.strokeWidth = 2;
        series.minBulletDistance = 10;
        series.tooltipText = "{valueY}";
        series.tooltip.pointerOrientation = "vertical";
        series.tooltip.background.cornerRadius = 20;
        series.tooltip.background.fillOpacity = 0.5;
        series.tooltip.label.padding(12,12,12,12)

        // Add scrollbar
        chart.scrollbarX = new am4charts.XYChartScrollbar();
        chart.scrollbarX.series.push(series);

        // Add cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.xAxis = dateAxis;
        chart.cursor.snapToSeries = series;

        this.chart = chart;
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    render() {
        return (
            <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
        );
    }
}