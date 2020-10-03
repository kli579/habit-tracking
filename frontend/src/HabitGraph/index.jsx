import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  BarSeries,
  LineSeries,
  Legend,
} from '@devexpress/dx-react-chart-material-ui';
import axios from "axios";

import { ValueScale } from '@devexpress/dx-react-chart';
import "./index.css";

import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
// pick a date util library
import moment from 'moment';
import MomentUtils from '@date-io/moment';

function Picker(props) {
  const { selectedDate, handleDateChange } = props 
  //const [selectedDate, handleDateChange] = React.useState(new Date())

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <KeyboardDatePicker
        autoOk
        variant="inline"
        inputVariant="outlined"
        format="MM/DD/yyyy"
        value={selectedDate} 
        onChange={handleDateChange}
      />
    </MuiPickersUtilsProvider>
  )
}

class HabitGraph extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: [
        { month: 'Jan', sale: 50, total: 987 },
        { month: 'Feb', sale: 100, total: 3000 },
        { month: 'March', sale: 30, total: 1100 },
        { month: 'April', sale: 107, total: 7100 },
        { month: 'May', sale: 95, total: 4300 },
        { month: 'June', sale: 150, total: 7500 },
      ],
      selectedDate: moment(),
    };

    this.handleDateChange = this.handleDateChange.bind(this);
    this.updateGraph = this.updateGraph.bind(this);
  }

  handleDateChange(moment_date) {
    this.setState({ selectedDate: moment_date });
    this.updateGraph();
  }

  updateGraph(){
    axios
    .get(`http://localhost:3001/habits`)
    .then(res => {
      const apiCalls = res.data.map(habit => { 
        return axios.get(`http://localhost:3001/habits/${habit.id}`)
      });
      return Promise.all(apiCalls)
    })
    .then(values => {
      const offset = new Date().getTimezoneOffset() / 60;

      let occurences = values.map(el => {
        return el.data.creation_times;
      })
      .flat();

      let habit_date = this.state.selectedDate.toDate();

      let selected_occurences = occurences.map(occurence => {
        const converted_date = new Date(Date.parse(occurence));
        converted_date.setHours(converted_date.getHours() - offset);

        return converted_date;
      })
      .filter(occurence => {
        if (occurence.getDate() === habit_date.getDate() && 
            occurence.getMonth() === habit_date.getMonth() &&
            occurence.getFullYear() == habit_date.getFullYear()) {

          return occurence;
        }
      });

      let data = {};

      for ( var i = 0; i < 24; i++ ) {
        let formatted_hour = `00${i}`.substr(-2,2)
      
        data[`${formatted_hour}:00`] = 0;
        data[`${formatted_hour}:30`] = 0;
      }

      for (const [index, occurence] of selected_occurences.entries()) {
        let formatted_hour = `00${occurence.getHours()}`.substr(-2,2)
        let formatted_minutes = `${occurence.getMinutes() < 30 ? "00" : "30"}`
        let key = `${formatted_hour}:${formatted_minutes}`

        if ( key in data ) {
          data[key]++;
        }
      }

      let listData = Object.keys(data).map( key => {
        return { timestamp: key, count: data[key] };
      });

      this.setState({ data: listData})
    });
  }

  componentDidMount() {
    this.updateGraph()
  }

  render() {
    const { data: chartData, selectedDate } = this.state;

    return (
      <Paper className="DemoBody">
        <Picker
          selectedDate={selectedDate}
          handleDateChange={this.handleDateChange}
        />
        <div className="DemoContainer">
          <Chart className="Demo"
            data={chartData}
          >
            <ValueScale name="count" />

            <ArgumentAxis />
            <ValueAxis scaleName="count" showGrid={false} showLine showTicks />

            <BarSeries
              name="Units Sold"
              valueField="count"
              argumentField="timestamp"
              scaleName="count"
            />
          </Chart>
        </div>
      </Paper>
    );
  }
}

export default HabitGraph;