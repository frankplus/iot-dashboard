import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/styles';


const styles = theme => ({
    paper: {
        margin: 20,
        padding: 5,
        minHeight: 10,
        minWidth: 300,
    },
    sub: {
        margin: 20,
        whiteSpace: "nowrap",
        float:"left",

    },
    box:{
        display: "flex",
        flexFlow: "row wrap",
        justifyContent: "flex-start",
        whiteSpace: "nowrap",
    
    },
    group: {
        margin: 20,
        padding: 0,
        minHeight: 50,
        minWidth: 100,
        backgroundColor: "#EAEAEA",
    },
    groupButton: {
        margin: 20,
        marginTop: -10,
        padding: 0,
        float:"right",
    },
    saveButton: {
        margin: 20,
        padding: 0,
        float:"left",
    },
    containerSave: {
        marginTop: 20,
        padding: 0,
        float:"left",
    }


});

const axios = require('axios').default


function AddNewGroupDialog(props) {

    // state capturing wether the dialog box is open or not
    const [open, setOpen] = React.useState(false);

    // state capturing wether the dialog box is open or not
    const [newGroupName, setNewGroupName] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleCloseNotSave = () => {
        setOpen(false);
    }

    const handleClose = () => {
        setOpen(false);
        props.whenDone(newGroupName)
    }

    const handleChange = (event) => {
        setNewGroupName(event.target.value);
    }

    return (
        <div>
            <Button variant="contained" color="secondary" onClick={handleClickOpen}>
                New +
            </Button>
            <Dialog
                open={open}
                onClose={handleCloseNotSave}
                aria-labelledby="add-new-group-dialog"
                aria-describedby="add-new-group-dialog-description"
            >
                <DialogTitle id="add-new-group-dialog">{"Add new group"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="add-new-group-dialog-description">
                        Type below a name for the new group
                    </DialogContentText>
                    <form onChange={handleChange}>
                        <TextField
                            id="newgrouptext"
                            label="New group name"
                            placeholder="Name"
                            helperText="Add new group"
                            margin="normal"
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        add
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );

}

function AddGroupDialog(props) {

    // state capturing wether the dialog box is open or not
    const [open, setOpen] = React.useState(false);

    // state for adding groups, unchecked
    const [groupsToBeAdded, setGroupsToBeAdded] = React.useState(
        new Map(props.groupsCouldBeAdded.map(
                g => [String(g.id), false])
            )
    );

    // state for removing groups, checked
    const [groupsToBeRemoved, setGroupsToBeRemoved] = React.useState(
        new Map(props.deviceGroups.map(
                g => [String(g.id), false]) 
            )
    );

    const handleClickOpen = () => {

        setOpen(true);

        // inits groups states
        setGroupsToBeAdded(new Map(props.groupsCouldBeAdded.map(
            g => [String(g.id), false])
        ))
        setGroupsToBeRemoved(new Map(props.deviceGroups.map(
            g => [String(g.id), false])
        ))
    };
  
    const handleClose = () => {

        setOpen(false);

        // arrays of ids will be returned according to the groups' states
        let addedIds = [];
        let notAddedIds = [];

        // adds ids of added groups
        for (const [k, v] of groupsToBeAdded) {
            if (v === true) {
                addedIds.push(Number(k));
            }
        }

        // adds ids of unchecked groups
        for (const [k, v] of groupsToBeRemoved) {
            if (v === true) {
                notAddedIds.push(Number(k));
            }
        }

        // gets data to parent node
        props.whenDone(addedIds, notAddedIds);
    };

    // gets data from child
    const handleGroupsToBeAdded = (groupsToBeAdded, groupsToBeRemoved) => {
        setGroupsToBeAdded(groupsToBeAdded);
        setGroupsToBeRemoved(groupsToBeRemoved);
    }

    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleClickOpen}>
                Customize groups
            </Button>
            <Dialog
                open={open}
                // onClose={handleClose}
                aria-labelledby="add-group-dialog"
                aria-describedby="add-group-dialog-description"
            >
                <DialogTitle id="add-group-dialog">{"Customize device's groups"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="add-group-dialog-description">
                        Select changes among your groups
                    </DialogContentText>
                    <CheckboxLabels 
                        groupsCouldBeAdded={props.groupsCouldBeAdded}
                        deviceGroups={props.deviceGroups}
                        whenDone={handleGroupsToBeAdded}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

function CheckboxLabels(props) {

    // state for adding groups, unchecked
    const [groupsToBeAdded, setGroupsToBeAdded] = React.useState(
        new Map(props.groupsCouldBeAdded.map(
                g => [String(g.id), false])
            )
    );

    // state for removing groups, checked
    const [groupsToBeRemoved, setGroupsToBeRemoved] = React.useState(
        new Map(props.deviceGroups.map(
                g => [String(g.id), false])
            )
    );

    const updateGroupsAdd = (k, v) => {
        setGroupsToBeAdded(new Map(groupsToBeAdded.set(k,v)));
    }

    const updateGroupsRemove = (k, v) => {
        setGroupsToBeRemoved(new Map(groupsToBeRemoved.set(k,!v)));
    }

    const handleCheckboxChangeAdd = (event) => {
        updateGroupsAdd(event.target.name, event.target.checked);
        props.whenDone(groupsToBeAdded, groupsToBeRemoved); // gets arguments to the father, i.e. the dialog box    
    };

    const handleCheckboxChangeRemove = (event) => {
        updateGroupsRemove(event.target.name, event.target.checked);
        props.whenDone(groupsToBeAdded, groupsToBeRemoved); // gets arguments to the father, i.e. the dialog box    
    };
    
    return (
      <FormGroup>
        {   
            // an unchecked checkbox for each group it could be added 
            props.groupsCouldBeAdded.map(g => 
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={groupsToBeAdded.get(String(g.id))}
                            onChange={handleCheckboxChangeAdd}
                            name={String(g.id)}
                            color="primary"
                        />
                    }
                    label={g.name}
                    key={String(g.id)}
                />
            )
        }
        {
            // an checked checkbox for each group it could be added 
            props.deviceGroups.map(g => 
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!groupsToBeRemoved.get(String(g.id))}
                            onChange={handleCheckboxChangeRemove}
                            name={String(g.id)}
                            color="primary"
                        />
                    }
                    label={g.name}
                    key={String(g.id)}
                />
            )
        }
      </FormGroup>
    );
}


class DeviceConfig extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            errorState: false,
            refreshRate: null,
            deviceGroups: [],
            token: null,
            enabled: null,
            latitude: null,
            longitude: null,
            newToken: false,
            allGroups: [],
            groupsCouldBeAdded: [],
        }

        this.handleRemoveGroup = this.handleRemoveGroup.bind(this);
        this.handleRefreshRate = this.handleRefreshRate.bind(this);
        this.handleOnOff = this.handleOnOff.bind(this);
        this.handleToken = this.handleToken.bind(this);
        this.handleRefreshLatitude = this.handleRefreshLatitude.bind(this);
        this.handleRefreshLongitude = this.handleRefreshLongitude.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleCustomizeGroups = this.handleCustomizeGroups.bind(this);
    }

    componentDidMount() {

        axios.get('devices/'+this.props.match.params.id)
        .then((resp) => {
            // Copies the groups name from the response
            let groups = [...resp.data.groups];
            this.setState({
                refreshRate: resp.data.device.config.update_frequency,
                deviceGroups: groups,
                token: resp.data.device.config.token,
                enabled: resp.data.device.config.enabled,
                latitude: resp.data.device.config.latitude,
                longitude: resp.data.device.config.longitude
            })
            axios.get('groups/')
            .then((resp2) => {
                // saves all the groups already created by the user
                const allGroups = [...resp2.data];
                this.setState({allGroups: allGroups});
            
                // inits groupsCouldBeAdded
                let diff = [...this.state.allGroups];
                for (let i = 0; i < this.state.deviceGroups.length; i++) {
                    let index = diff.findIndex(group => group.id === this.state.deviceGroups[i].id);
                    if (index !== -1) {
                        diff.splice(index, 1);
                    }
                }
                this.setState({groupsCouldBeAdded: [...diff]});
            })
            .catch((error) => {
                //Sets error state
                this.setState({
                    errorState: true,
                })
            })
        })
        .catch((error) => {
            //Sets error state
            this.setState({
                errorState: true,
            })
        })
    }

    handleRefreshRate(event) {
        this.setState({refreshRate: event.target.value});
    }

    handleRemoveGroup(event, id) {
        //alert('removing group');
        // copies groups in state
        let newGroups = [...this.state.groups];
        // find correct index
        let i = newGroups.findIndex(group => group.id === id);
        // removes related group
        newGroups.splice(i, 1);
        event.preventDefault();
        this.setState({groups: newGroups})
    }

    handleCustomizeGroups = (addedIds, notAddedIds) => { // map of groups returned by dialog box

        console.log("ids to be added"+addedIds);
        console.log("ids to be removed"+notAddedIds);

        // copy of device's groups states
        let updatedDeviceGroups = [...this.state.deviceGroups];
        let updatedDeviceGroupsCouldBeAdded = [...this.state.groupsCouldBeAdded];

        // adds the checked groups 
        for (let i = 0; i < addedIds.length; i++) {

            // finds group to be added given the index
            let indexToBeAdded = 
                this.state.allGroups.findIndex(group => group.id === addedIds[i]);

            let newGroupToBeAdded = this.state.allGroups[indexToBeAdded];

            // adds the group to the local copy
            updatedDeviceGroups.push(newGroupToBeAdded);

            // removes the element
            for (let j = 0; j < updatedDeviceGroupsCouldBeAdded.length; j++) {
                if (newGroupToBeAdded.id === updatedDeviceGroupsCouldBeAdded[j].id) {
                    updatedDeviceGroupsCouldBeAdded.splice(j, 1)
                }
            }
        }

        // removes unchecked groups
        for (let i = 0; i < notAddedIds.length; i++) {

            // finds group to be removed given the index
            let indexToBeRemoved = 
                this.state.allGroups.findIndex(group => group.id === notAddedIds[i]);

            let newGroupToBeRemoved = this.state.allGroups[indexToBeRemoved];

            // adds the group to the local copy
            updatedDeviceGroupsCouldBeAdded.push(newGroupToBeRemoved);

            // removes the element
            for (let j = 0; j < updatedDeviceGroups.length; j++) {
                if (newGroupToBeRemoved.id === updatedDeviceGroups[j].id) {
                    updatedDeviceGroups.splice(j, 1)
                }
            }
        }

        // Updates both the group states
        this.setState({deviceGroups: [...updatedDeviceGroups]});
        this.setState({groupsCouldBeAdded: [...updatedDeviceGroupsCouldBeAdded]});
    }

    handleAddNewGroup = (name) => {
        // TODO
    }

    handleToken(event) {
        if (this.state.newToken) {
            this.setState({newToken: false});
        }
        else {
            this.setState({newToken: true})
        }
        event.preventDefault();
    }

    handleOnOff(event) {
        if (this.state.enabled) {
            this.setState({enabled: false});
        }
        else {
            this.setState({enabled: true})
        }
        event.preventDefault();
    }

    handleRefreshLatitude (event) {
        this.setState({latitude: event.target.value});
    }

    handleRefreshLongitude (event) {
        this.setState({longitude: event.target.value});
    }

    handleSave(event) {

        // sets frequency and enabled
        axios.put('devices/'+this.props.match.params.id+'/config/'+
                '?updateFrequency='+this.state.refreshRate+
                '&enabled='+this.state.enabled+
                '&latitude='+this.state.latitude+
                '&longitude='+this.state.longitude)
        .then((resp) => {
            console.log(resp);
        })
        .catch((error) => {
            console.log(error.response);
        })
        
        // sets token
        if (this.state.newToken) {
            axios.put('devices/'+this.props.match.params.id+'/generatetoken/')
            .then((resp) => {
                console.log(resp);
            })
            .catch((error) => {
                console.log(error.response);
            })
        }

        // sets groups
        let groupsIds = []
        for (let i = 0; i < this.state.deviceGroups.length; i++) {
            groupsIds.push(Number(this.state.deviceGroups[i].id))
        }

        axios.post('devices/'+this.props.match.params.id+'/group/', groupsIds)
        .then((resp) => {
            console.log(resp);
        })
        .catch((error) => {
            console.log(error.response);
        })


    }

    handleCancel() {
        window.location.reload();
    }
    
    render() {

        const { classes } = this.props;

        if (this.state.errorState) {
            return (
                <span>Error Loading data</span>
            );
        }
        else {
            return (
                <div className="deviceconfig">
                    <Grid container xs={12}>
                        <Grid item xs={12}>
                            <Paper className={classes.paper}>
                                <div className={classes.box}>
                                    <div className={classes.sub}>
                                        <Typography>deviceID: {this.props.match.params.id} </Typography>
                                    </div>
                                    <div className={classes.sub}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.enabled}
                                                    onChange={this.handleOnOff}
                                                    color="primary"
                                                />
                                            }
                                            label={this.state.enabled ? "ON":"OFF"}
                                        />
                                    </div>
                                </div>
                            </Paper>
                            <Paper className={classes.paper}>
                                <div className={classes.box}>
                                    <div className={classes.sub}>
                                        <form onChange={this.handleRefreshRate}>
                                            <TextField
                                                id="refreshratetext"
                                                label="Frequency"
                                                placeholder={String(this.state.refreshRate)}
                                                helperText="Customize device's refesh rate"
                                                margin="center"
                                            />
                                        </form>
                                    </div>
                                </div>
                            </Paper>
                            <Paper className={classes.paper} >
                                <div className={classes.box}>
                                    <div className={classes.sub}>
                                        <form onChange={this.handleRefreshLatitude} css={{padding:"left"}}>
                                            <TextField
                                                id="lat"
                                                label="Latitude"
                                                placeholder={String(this.state.latitude)}
                                                helperText="Customize device's latitude"
                                                margin="center"
                                            />
                                        </form>
                                    </div>
                                    <div className={classes.sub}>
                                        <form onChange={this.handleRefreshLongitude} css={{padding:"left"}}>
                                            <TextField
                                                id="lon"
                                                label="Longitude"
                                                placeholder={String(this.state.longitude)}
                                                helperText="Customize device's longitude"
                                                margin="center"
                                            />
                                        </form>
                                    </div>
                                </div>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper className={classes.paper}>
                                <Grid container xs={12}>
                                    { 
                                        // creates as many group papers as needed
                                        this.state.deviceGroups.map(g => 
                                            <Paper className={classes.group} key={g.id}>
                                                <Typography>{g.name}</Typography>
                                            </ Paper>
                                        )
                                    }
                                </Grid>
                            </Paper>
                            <div className={classes.groupButton}>
                                <AddGroupDialog 
                                    groupsCouldBeAdded={this.state.groupsCouldBeAdded}
                                    deviceGroups={this.state.deviceGroups} 
                                    whenDone={this.handleCustomizeGroups}
                                />
                            </div>
                            <div className={classes.groupButton}>
                                <AddNewGroupDialog whenDone={this.handleAddNewGroup} />
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper className={classes.paper}>
                                <Grid container xs={12}>
                                    <div className={classes.box}>
                                        <div className={classes.sub}>
                                            <TextField
                                                disabled
                                                id="tokenlabel"
                                                label={String(this.state.token)}
                                                helperText="Current token"
                                                margin="normal"
                                            />    
                                        </div>
                                    </div>
                                </Grid>
                            </Paper>
                            <div className={classes.groupButton}>
                                {
                                    this.state.newToken 
                                    ? 
                                        <Button onClick={this.handleToken} variant="contained" color="primary">Don't generate</Button> 
                                    : 
                                        <Button onClick={this.handleToken} variant="contained" color="primary">Generate new</Button>
                                }
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <div className={classes.containerSave}>
                                <div className={classes.saveButton}>
                                    <Button onClick={this.handleCancel} variant="contained" color="secondary">
                                        Cancel
                                    </Button>
                                </div>
                                <div className={classes.saveButton}>

                                    <Button onClick={this.handleSave} variant="contained" color="primary">
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        
                        </Grid>

                    </ Grid>
                </div>
            );
        }
    }
}

export default withStyles(styles)(DeviceConfig)