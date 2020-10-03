import React from 'react';
import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@material-ui/core';
import {
  createMuiTheme,
  ThemeProvider,
  withStyles,
} from '@material-ui/core/styles';

import './App.css';
import TrackButton  from './TrackButton'
import HabitGraph from './HabitGraph'
import axios from 'axios';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

const styles = (theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
});

class App extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className="App">
        <HabitGraph/>
        <TrackButton/>
      </div>
    );
  }
}

export default withStyles(styles)(App);
