import React, { Component } from 'react';
import Cookies from 'js-cookie';
import {
    CardMeta,
    CardHeader,
    CardGroup,
    CardDescription,
    CardContent,
    Button,
    ButtonGroup,
    Card,
    Icon,
    Label,
    Popup
} from 'semantic-ui-react';
import { TALENT_URL } from '../../constants/URLStorage.js';


function JobCard(props) {

    // Close a job and update state
    const handleCloseJob = (jobId) => {
        let link = TALENT_URL + 'listing/listing/closeJob';
        let cookies = Cookies.get('talentAuthToken');
        let requestBody = JSON.stringify(jobId);
        try {

            $.ajax({
                url: link,
                data: requestBody,
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer ' + cookies,
                },
                type: 'POST',
                success: (res) => {
                    if (res.success) {
                        TalentUtil.notification.show(res.message, 'success', null, null);
                        props.reloadData();
                    } else {
                        TalentUtil.notification.show('Error while closing job', 'error', null, null);
                    }
                },
                error: (error) => {
                    //console.error('Error  while closing the job:', JSON.stringify(error.status));
                    TalentUtil.notification.show('Error while closing job', 'error', null, null);

                }
            });
        }
        catch (error) {
            //console.error("Error occured: ", error.message);
            TalentUtil.notification.show('Error while closing job', 'error', null, null);

        }
    }

    const handleEditJob = (jobId) => {
        window.location = `/EditJob/${jobId}`;
    };

    const handleCopyJob = (jobId) => {
        window.location = `/PostJob/${jobId}`;
    };

    return (

        <Card className="jobcard" raised>
            <CardContent>
                <CardHeader>{props.jobTitle} </CardHeader>
                <Popup trigger={
                    <Label color='black' ribbon='right'><Icon name='user' /> {props.noOfSuggestions}</Label>
                }>
                    <span>Suggested Talents</span>
                </Popup>

                <CardMeta>{props.location}</CardMeta>
                <CardDescription>{props.jobSummary}</CardDescription>
            </CardContent>
            <CardContent extra>
                <Button size='mini' color={props.jobStatus === 0 ? 'green' : 'red'}>
                    {props.jobStatus === 0 ? 'Active' : 'Expired'}
                </Button>
                <ButtonGroup className='ui mini right floated basic blue buttons'>
                    <Button
                        disabled={props.jobStatus === 1}
                        onClick={() => handleCloseJob(props.jobId)}
                    >
                        <Icon name='stop circle outline' /> {props.jobStatus === 0 ? 'Close' : 'Closed'}
                    </Button>
                    <Button onClick={() => handleEditJob(props.jobId)} ><Icon name='edit' /> Edit</Button>
                    <Button onClick={() => handleCopyJob(props.jobId)}><Icon name='copy' />Copy</Button>
                </ButtonGroup>
            </CardContent>
        </Card>

    );
}

export default JobCard
