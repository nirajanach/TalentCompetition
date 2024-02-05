import React from 'react';
import {
    CardMeta,
    CardHeader,
    CardGroup,
    CardDescription,
    CardContent,
    Button,
    ButtonGroup,
    Card,
    Image,
    Icon,
    Label
} from 'semantic-ui-react';


function JobCard(props) {

    
    function handleEdit() {
        const link = props.editJob(props.jobId);
        window.location.href = link.props.to;
    }
    function handleClose() {
        // Define the logic for closing the job
        props.closeJob(props.jobId);

    }

    return (

        <Card className="jobcard" raised>
            <CardContent>
                <CardHeader>{props.jobTitle} </CardHeader>
                <Label color='black' ribbon='right'><Icon name='user' /> {props.noOfSuggestions}</Label>
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
                        onClick={handleClose}
                    >
                        <Icon name='stop circle outline' /> {props.jobStatus === 0 ? 'Close' : 'Closed'}
                    </Button>
                    <Button onClick={handleEdit}><Icon name='edit' /> Edit</Button>
                    <Button><Icon name='copy' />Copy</Button>
                </ButtonGroup>
            </CardContent>
        </Card>

    );
}

export default JobCard
