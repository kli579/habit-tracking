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
  constructor(props) {
    super(props);
    this.state = { habits: [], selected_habit_id: '' };

    this.trackHabit = this.trackHabit.bind(this);
    this.getHabits = this.getHabits.bind(this);
    this.updateSelectedHabit = this.updateSelectedHabit.bind(this);
  }

  componentDidMount() {
    this.getHabits();
  }

  getHabits() {
    axios
      .get(`http://localhost:3001/get-habits`)
      .then((res) => {
        this.setState({ habits: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  updateSelectedHabit(event) {
    this.setState({ selected_habit_id: event.target.value });
  }

  trackHabit() {
    const { selected_habit_id } = this.state;
    axios
      .post(`http://localhost:3001/track-habit`, {
        habit_id: selected_habit_id,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    const { classes } = this.props;

    return (
      <ThemeProvider theme={darkTheme}>
        <div className="App">
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="habit-select-menu-id">Habit</InputLabel>
            <Select
              id="habit-select-menu"
              labelId="habit-select-menu-id"
              onChange={this.updateSelectedHabit}
              value={this.state.selected_habit_id}
            >
              {this.state.habits.map((habit, index) => (
                <MenuItem key={index} value={habit.id}>
                  {habit.habit_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className={classes.root}>
            <Button
              style={{ fontSize: '24px', fontWeight: '700' }}
              color="secondary"
              variant="contained"
              onClick={this.trackHabit}
            >
              TRACK
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
