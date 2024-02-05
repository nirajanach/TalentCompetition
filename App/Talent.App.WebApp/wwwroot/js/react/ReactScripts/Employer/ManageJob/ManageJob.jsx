import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Grid, Dropdown, CardGroup } from 'semantic-ui-react';
import JobCard from './JobCard.jsx';

class ManageJob extends Component {
    constructor(props) {
        super(props);

        // Initialize loader data
        let loader = loaderData;
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");

        // Initial state
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
            itemsPerPage: 6,
            activeIndex: "",
            selectedSortOption: 'desc', // Default value
        };

        // Bind methods to the instance
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.loadSortedData = this.loadSortedData.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.closeJob = this.closeJob.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    // Initial setup
    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData);
        loaderData.isLoading = true;
        this.setState({ loaderData });

        // Load data and update loader state
        this.loadData(() =>
            this.setState({ loaderData })
        );

        loaderData.isLoading = false;
    }

    componentDidMount() {
        this.init();
    }

    // Load data from the server
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
                //console.log('Data from server:', data.myJobs);

                if (Array.isArray(data.myJobs)) {
                    this.setState({
                        loadJobs: data.myJobs,
                        totalPages: Math.ceil(data.TotalCount / 6)
                    });

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

    // Load sorted data based on filters and sorting options
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
            dataType: 'json',
            success: function (data) {
                //console.log("data success: " + data);
                if (Array.isArray(data.myJobs)) {
                    this.setState({
                        loadJobs: data.myJobs,
                        totalPages: Math.ceil(data.TotalCount / 6)
                    });

                    if (callback) {
                        callback(data.myJobs);
                    }
                } else {
                    //console.log(link);
                    //console.log('Data : ' + JSON.stringify(data.myJobs));
                    console.error('Invalid data received from the server. Expected an array. ');
                }
            }.bind(this),
            error: function (error) {
                console.error('Error fetching data:', error.status);
            }
        });
    }

    // Load new data and update loader state
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

    // Handle navigation to job editing page
    handleEditJob(jobId) {
        // Implement the logic to navigate to the job editing page      
        //console.log('Editing job with ID:', jobId);
        // Use Link to create a link to the CreateJob component with the job ID as a parameter
        return <Link to={`/EditJob/${jobId}`} />;
    }

    // Close a job and update state
    closeJob(jobId) {
        const link = 'http://localhost:51689/listing/listing/closeJob';
        const cookies = Cookies.get('talentAuthToken');
        const requestBody = JSON.stringify(jobId);

        $.ajax({
            url: link,
            data: requestBody,
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + cookies,
            },
            type: 'POST',            
            success: function (res) {
                //console.log('Server response: ' , res);
                if (res.success) {
                    TalentUtil.notification.show(res.message, 'success', null, null);
                    this.loadSortedData();
                } else {
                    console.error('Error closing job:', JSON.stringify(res.message));
                    TalentUtil.notification.show('Error while closing job', 'error', null, null);
                }
            }.bind(this),
            error: function (error) {
                console.error('Error  while closing the job:', JSON.stringify(error.status));
            }
        });
    }

    // Handle page change and update state
    handlePageChange(event, { activePage }) {
        console.log('Changing page to:', activePage);
        this.setState({ activePage }, () => {
            console.log('Active page updated to:', this.state.activePage);
            this.loadSortedData();
        });
    }

    // Handle filter change and update state
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

    // Handle sort change and update state
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
                    {/* Page title */}
                    <h1>List of Jobs</h1>
                    {/* Filter and sort options */}
                    <div style={{ margin: '1rem 0' }}>
                        <i className="filter icon" /> Filter: {' '}
                        {/* Dropdown for filter options */}
                        <Dropdown
                            text=" Choose Filter"
                            inline
                        >
                            <Dropdown.Menu>
                                {/* Active Jobs filter */}
                                <Dropdown.Item
                                    onClick={() => this.handleFilterChange({
                                        showActive: true,
                                        showClosed: false
                                    })}
                                >
                                    Active Jobs
                                </Dropdown.Item>
                                {/* Closed Jobs filter */}
                                <Dropdown.Item
                                    onClick={() => this.handleFilterChange({
                                        showActive: false,
                                        showClosed: true
                                    })}
                                >
                                    Closed Jobs
                                </Dropdown.Item>
                                {/* Add more filter options as needed */}
                            </Dropdown.Menu>
                        </Dropdown>

                        {/* Sort by date options */}
                        <i className="calendar alternate outline icon" /> Sort by date: {' '}
                        <Dropdown
                            inline
                            options={sortOptions}
                            defaultValue={sortOptions[0].value} // Set the default value here
                            onChange={(event, data) => this.handleSortChange(data.value)}
                        />
                    </div>
                    {/* Display job cards */}
                    <CardGroup>
                        {loadJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                jobId={job.id}
                                jobTitle={job.title}
                                location={`${job.location.country}, ${job.location.city}`}
                                jobStatus={job.status}
                                jobSummary={job.summary}
                                closeJob={() => this.closeJob(job.id)}
                                editJob={() => this.handleEditJob(job.id)}
                                noOfSuggestions={job.noOfSuggestions}
                            />
                        ))}
                    </CardGroup>
                    {/* Pagination */}
                    <Grid>
                        <Grid.Column textAlign="center" style={{ margin: '2rem' }}>
                            <Pagination
                                ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                                firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                                lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                                prevItem={{ content: <Icon name='angle left' />, icon: true }}
                                nextItem={{ content: <Icon name='angle right' />, icon: true }}
                                activePage={isNaN(activePage) ? 1 : activePage}
                                onPageChange={(event, data) => this.handlePageChange(event, data)}
                                totalPages={loadJobs.length === 0 ? 0 : isNaN(totalPages) ? 1 : totalPages}
                            />
                        </Grid.Column>
                    </Grid>
                </div>
            </BodyWrapper>
        );
    }
}

export default ManageJob;
