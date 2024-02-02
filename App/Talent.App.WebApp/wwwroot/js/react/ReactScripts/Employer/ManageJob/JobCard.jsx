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


function JobDetailsCard(props) {

    return (

        <Card className="jobcard" raised>
            <CardContent>
                <CardHeader>{props.jobTitle} </CardHeader>
                <Label color='black' ribbon='right'>New</Label>
                <CardMeta>{props.location}</CardMeta>
                <CardDescription>{props.jobSummary}</CardDescription>
            </CardContent>
            <CardContent extra>
                <Button size='mini' color='red'>Expired</Button>
                <ButtonGroup className='ui mini right floated basic blue buttons'>
                    <Button ><Icon name='stop circle outline' /> Close</Button>
                    <Button > <Icon name='edit' /> Edit</Button>
                    <Button ><Icon name='copy' />Copy</Button>
                </ButtonGroup>
            </CardContent>
        </Card>

    );
}

export default JobDetailsCard
