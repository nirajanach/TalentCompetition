import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Grid, Dropdown, CardGroup } from 'semantic-ui-react';
import JobCard from './JobCard.jsx';
import { TALENT_URL } from '../../constants/URLStorage.js';

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
            error: null
        };

        // Bind methods to the instance
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    // Initial setup
    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData);
        loaderData.isLoading = true;
        /* this.setState({ loaderData });*/

        // Load data and update loader state
        this.loadData(() =>
            this.setState({ loaderData })
        );

        loaderData.isLoading = false;
    }

    componentDidMount() {
        this.init();
    }


    // Load sorted data based on filters and sorting options
    loadData(callback) {
        let link = TALENT_URL + 'listing/listing/getSortedEmployerJobs';
        let cookies = Cookies.get('talentAuthToken');

        try {
            $.ajax({
                url: link,
                headers: {
                    'Authorization': 'Bearer ' + cookies,
                    'Content-Type': 'application/json'
                },
                type: "GET",
                data: {
                    activePage: this.state.activePage,
                    sortByDate: this.state.sortBy.date,
                    showActive: this.state.filter.showActive,
                    showClosed: this.state.filter.showClosed,
                    showDraft: this.state.filter.showDraft,
                    showExpired: this.state.filter.showExpired,
                    showUnexpired: this.state.filter.showUnexpired
                },
                contentType: "application/json",
                dataType: "json",
                success: (response) => {
                    if (Array.isArray(response.myJobs)) {
                        this.setState({
                            loadJobs: response.myJobs,
                            totalPages: Math.ceil(response.totalCount / 6),
                            error: null
                        });
                        if (callback) {
                            callback(response.myJobs);
                        }
                    } else {
                        this.setState({
                            error: 'Invalid data received from the server. Expected an array.'
                        });
                    }
                },
                error: (xhr, status, error) => {
                    this.setState({
                        error: `Error occurred while fetching data: ${error}`
                    });
                },
                complete: () => {
                    // Set isLoading to false after data loading is complete
                    this.setState(prevState => ({
                        loaderData: Object.assign({}, prevState.loaderData, { isLoading: false })
                    }));
                }
            });
        } catch (error) {
            this.setState({
                error: 'Error occurred while fetching data. Please try again later.'
            });
        }

    }






    loadNewData(data) {
        let loader = this.state.loaderData;
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





    // Handle page change and update state
    handlePageChange(event, { activePage }) {
        this.setState({ activePage }, () => {
            this.loadData();
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
                this.loadData();
            }
        );
    }

    // Handle sort change and update state
    handleSortChange(sortByDate) {
        this.setState(
            prevState => ({
                sortBy: { date: sortByDate },
                activePage: 1
            }),
            function () {
                this.loadData();
            }
        );
    }

    renderError() {
        const { error } = this.state;

        if (error) {
            // Set loader.isLoading to false when an error occurs
            console.log(error)

            // Render the error message
            return (
                <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                    <div className="ui container">
                        <div className="ui grid">
                            <div className="row">
                                <div className="sixteen wide column">
                                    <p style={{
                                        paddingTop: 20,
                                        paddingBottom: 50,
                                        marginLeft: 15
                                    }}>Error: {error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </BodyWrapper>
            );
        }
    }

    // Custom function to render job cards

    renderJobCards() {
        const { loadJobs, error } = this.state;

        if (error) {
            return null;
        }

        if (loadJobs.length < 1) {
            // No jobs found, render a message
            return (
                <React.Fragment>
                    <p style={{
                        paddingTop: 20,
                        paddingBottom: 50,
                        marginLeft: 15
                    }}>No Jobs Found</p>
                </React.Fragment>
            );
        }

        // Render job cards
        return loadJobs.map((job) => (
            <JobCard
                key={job.id}
                jobId={job.id}
                jobTitle={job.title}
                location={`${job.location.country}, ${job.location.city}`}
                jobStatus={job.status}
                jobSummary={job.summary}
                noOfSuggestions={job.noOfSuggestions}
                reloadData={this.loadData}
            // Additional props as needed
            />
        ));
    }



    render() {
        let { loadJobs, activePage, totalPages, error } = this.state;

        let sortOptions = [
            { key: 'desc', text: 'Newest First', value: 'desc' },
            { key: 'asc', text: 'Oldest First', value: 'asc' },
        ];






        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <div className="ui grid">
                        <div className="row">
                            <div className="sixteen wide column">



                                {/* Page title */}
                                <h1>{error ? `${error}` : 'List of Jobs'}</h1>

                                {/* Filter and sort options */}
                                {!error && (
                                    <div style={{ margin: '1rem 0' }}>



                                        <i className="filter icon" /> {"Filter:  "}
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
                                )}
                                {/* Display job cards */}

                                <CardGroup>
                                    {this.renderJobCards()}
                                </CardGroup>

                                {/* Pagination */}
                                <Grid>
                                    <Grid.Column textAlign="center" style={{ margin: '2rem' }}>
                                        {!error && (<Pagination
                                            ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                                            firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                                            lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                                            prevItem={{ content: <Icon name='angle left' />, icon: true }}
                                            nextItem={{ content: <Icon name='angle right' />, icon: true }}
                                            activePage={isNaN(activePage) ? 1 : activePage}
                                            onPageChange={(event, data) => this.handlePageChange(event, data)}
                                            totalPages={loadJobs.length === 0 ? 0 : isNaN(totalPages) ? 1 : totalPages}

                                        />
                                        )}
                                    </Grid.Column>
                                </Grid>
                            </div>
                        </div>
                    </div>
                </div>
            </BodyWrapper>
        );
    }
}

export default ManageJob;
