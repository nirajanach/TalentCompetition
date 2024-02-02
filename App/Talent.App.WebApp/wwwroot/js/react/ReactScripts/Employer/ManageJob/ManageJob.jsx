import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Grid, Dropdown, CardGroup } from 'semantic-ui-react';
import JobCard from './JobCard.jsx';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);

        let loader = loaderData;
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");

        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: "",
            selectedSortOption: 'desc', // Default value
        };

        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.loadSortedData = this.loadSortedData.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.closeJob = this.closeJob.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData);
        loaderData.isLoading = true;
        this.setState({ loaderData });

        this.loadData(() =>
            this.setState({ loaderData })
        );

        loaderData.isLoading = false;
    }

    componentDidMount() {
        this.init();
    }

    loadData(callback) {
        const link = 'http://localhost:51689/listing/listing/getEmployerJobs';
        const cookies = Cookies.get('talentAuthToken');

        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                console.log('Data from server:', data.myJobs);

                if (Array.isArray(data.myJobs)) {
                    this.setState({ loadJobs: data.myJobs });

                    if (callback) {
                        callback(data.myJobs);
                    }
                } else {
                    console.error('Invalid data received from the server. Expected an array.');
                }
            }.bind(this),
            error: function (res) {
                console.error('Error fetching data:', res.status);
            }
        });
    }

    loadSortedData(callback) {
        const { activePage, sortBy, filter } = this.state;
        const link = `http://localhost:51689/listing/listing/getSortedEmployerJobs?activePage=${activePage}&sortbyDate=${sortBy.date}&showActive=${filter.showActive}&showClosed=${filter.showClosed}&showDraft=${filter.showDraft}&showExpired=${filter.showExpired}&showUnexpired=${filter.showUnexpired}`;
        const cookies = Cookies.get('talentAuthToken');

        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: 'GET',
            contentType: 'application/json',
            success: function (data) {
                if (Array.isArray(data.MyJobs)) {
                    this.setState({
                        loadJobs: data.MyJobs,
                        totalPages: Math.ceil(data.TotalCount / itemsPerPage)
                    });

                    if (callback) {
                        callback(data.MyJobs);
                    }
                } else {
                    console.log(link);
                    console.log('Data from server:', data.myJobs);


                    console.error('Invalid data received from the server. Expected an array.');
                }
            }.bind(this),
            error: function (error) {
                console.error('Error fetching data:', error.status);
            }
        });
    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                });
            });
        });
    }

    closeJob(jobId) {
        const link = 'http://localhost:51689/listing/listing/closeJob';
        const cookies = Cookies.get('talentAuthToken');

        $.ajax({
            url: link,
            data: JSON.stringify(jobId),
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: 'POST',
            dataType: 'json',
            success: function (data) {
                if (data.Success) {
                    console.log('Job closed successfully:', data.Message);
                    this.loadSortedData();
                } else {
                    console.error('Error closing job:', data.Message);
                }
            }.bind(this),
            error: function (error) {
                console.error('Error closing job:', error.status);
            }
        });
    }

    handlePageChange(event, { activePage }) {
        this.setState({ activePage }, () => {
            this.loadSortedData();
        });
    }

    handleFilterChange(filter) {
        this.setState(
            function (prevState) {
                return {
                    filter: Object.assign({}, prevState.filter, filter),
                    activePage: 1
                };
            },
            function () {
                this.loadSortedData();
            }
        );
    }

    handleSortChange(sortByDate) {
        this.setState(
            function (prevState) {
                return {
                    sortBy: { date: sortByDate },
                    activePage: 1
                };
            },
            function () {
                this.loadSortedData();
            }
        );
    }

    render() {
        const { loadJobs, activePage, totalPages } = this.state;

        const sortOptions = [
            { key: 'desc', text: 'Newest First', value: 'desc' },
            { key: 'asc', text: 'Oldest First', value: 'asc' },
        ];

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <h1>List of Jobs</h1>
                    <div> <i className="filter icon" /> Filter: {' '}
                        <Dropdown
                            text=" Choose Filter"
                            inline
                        >
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={function () {
                                        this.handleFilterChange({
                                            showActive: true,
                                            showClosed: false
                                        });
                                    }.bind(this)}
                                >
                                    Active Jobs
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={function () {
                                        this.handleFilterChange({
                                            showActive: false,
                                            showClosed: true
                                        });
                                    }.bind(this)}
                                >
                                    Closed Jobs
                                </Dropdown.Item>
                                {/* Add more filter options as needed */}
                            </Dropdown.Menu>
                        </Dropdown>

                        <i className="calendar alternate outline icon" /> Sort by date: {' '}

                        <Dropdown
                            inline
                            options={sortOptions}
                            defaultValue={sortOptions[0].value} // Set the default value here
                            onChange={(event, data) => this.handleSortChange(data.value)}
                        />
                    </div>
                    <CardGroup>
                        {loadJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                jobTitle={job.title}
                                location={job.location.country + ', ' + job.location.city}
                                jobSummary={job.summary}
                            />
                        ))}
                    </CardGroup>
                    <Grid>
                        <Grid.Column textAlign="center">
                            <Pagination
                                ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                                firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                                lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                                prevItem={{ content: <Icon name='angle left' />, icon: true }}
                                nextItem={{ content: <Icon name='angle right' />, icon: true }}
                                activePage={activePage}
                                onPageChange={this.handlePageChange}
                                totalPages={totalPages}
                            />
                        </Grid.Column>
                    </Grid>
                </div>
            </BodyWrapper>
        );
    }
}
