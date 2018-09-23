import React, { Component } from 'react';
import Eos from 'eosjs'; // https://github.com/EOSIO/eosjs
import { Keygen } from 'eosjs-keygen'

// material-ui dependencies
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

const parent = {
  name: 'Jennifer',
  privateKey: '5K7mtrinTFrVTduSxizUc5hjXJEtTjVTsqSHeBHes1Viep86FP5',
  publicKey: 'EOS6kYgMTCh1iqpq9XGNQbEi8Q6k5GujefN9DSs55dcjVyFAq7B6b'
}
const eos = Eos({ keyProvider: parent.privateKey });

// Index component
class Index extends Component {

  constructor(props) {
    super(props)

    this.state = {}
  }

  // generic function to handle form events (e.g. "submit" / "reset")
  // push transactions to the blockchain by using eosjs
  async createChildAccount(event) {
    // stop default behaviour
    event.preventDefault();

    const childName = event.target.name.value

    // // prepare variables for the switch below to send transactions
    // let actionName = "";
    // let actionData = {};
    //
    // // define actionName and action according to event type
    // switch (event.type) {
    //   case "submit":
    //     actionName = "update";
    //     actionData = {
    //       _user: parent.name
    //     };
    //     break;
    //   default:
    //     return;
    // }

    // eosjs function call: connect to the blockchain
    // const result = await eos.transaction({
    //   actions: [{
    //     account: "notechainacc",
    //     name: actionName,
    //     authorization: [{
    //       actor: parent.name,
    //       permission: 'active',
    //     }],
    //     data: actionData,
    //   }],
    // });

    const keys = await Keygen.generateMasterKeys()

    const result = await eos.transaction(tr => {
      tr.newaccount({
        creator: parent.name,
        name: childName,
        owner: `${parent.name}@active`,
        active: keys.publicKeys.active
      })

      tr.buyrambytes({
        payer:  parent.name,
        receiver: childName,
        bytes: 8192
      })

      tr.delegatebw({
        from: parent.name,
        receiver: childName,
        stake_net_quantity: '10.0000 SYS',
        stake_cpu_quantity: '10.0000 SYS',
        transfer: 0
      })
    })

    console.log(result);

    this.setState({ childName })
  }

  // gets table data from the blockchain
  // and saves it into the component state: "noteTable"
  getTable() {
    const eos = Eos();
    eos.getTableRows({
      "json": true,
      "code": "notechainacc",   // contract who owns the table
      "scope": "notechainacc",  // scope of the table
      "table": "notestruct",    // name of the table as specified by the contract abi
      "limit": 100,
    }).then(result => this.setState({ noteTable: result.rows }));
  }

  render() {
    const { classes } = this.props
    const { childName } = this.state

    return (
      <div>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="title" color="inherit">
              Famileos
            </Typography>
          </Toolbar>
        </AppBar>

        <Typography variant="headline" component="h2">
          Welcome {parent.name}!
        </Typography>

        <Paper className={classes.paper}>
          <form onSubmit={this.createChildAccount.bind(this)}>
            <Typography variant="headline" component="h2">
              Create Child Account
            </Typography>
            <TextField
              name="name"
              autoComplete="off"
              label="Child Account Name"
              margin="normal"
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.formButton}
              type="submit">
              Create Child Account
            </Button>
          </form>
        </Paper>

        {childName &&
          <Paper className={classes.paper}>
            <form onSubmit={this.addToWhitelist.bind(this)}>
              <Typography variant="headline" component="h2">
                Add Action To Whitelist
              </Typography>
              <TextField
                name="contractName"
                autoComplete="off"
                label="Account Name of Contract"
                margin="normal"
                fullWidth
              />
              <TextField
                name="actionName"
                autoComplete="off"
                label="Name of Action"
                margin="normal"
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.formButton}
                type="submit">
                Add Action to Whitelist
              </Button>
            </form>
          </Paper>
        }

        {childName &&
          <Paper className={classes.paper}>
            <form onSubmit={this.removeFromWhitelist.bind(this)}>
              <Typography variant="headline" component="h2">
                Remove Action From Whitelist
              </Typography>
              <TextField
                name="contractName"
                autoComplete="off"
                label="Account Name of Contract"
                margin="normal"
                fullWidth
              />
              <TextField
                name="actionName"
                autoComplete="off"
                label="Name of Action"
                margin="normal"
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.formButton}
                type="submit">
                Remove Action from Whitelist
              </Button>
            </form>
          </Paper>
        }
      </div>
    );
  }

}

// set up styling classes using material-ui "withStyles"
const styles = theme => ({
  card: {
    margin: 20,
  },
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  formButton: {
    marginTop: theme.spacing.unit,
    width: "100%",
  },
  pre: {
    background: "#ccc",
    padding: 10,
    marginBottom: 0.
  },
});

export default withStyles(styles)(Index);