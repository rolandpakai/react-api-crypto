import React, {useState, useEffect} from 'react';
import { render } from 'react-dom';
import { format, parseISO, subDays } from "date-fns";
import {fetchMarketChartRange, coinsAll} from  './CoinGeckoApi';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { InputNumber } from 'antd';



export default function HighChartsDemo({coinIds, displayNumberOfDays = 0, percentage = false}) {
  const [coinGeckoData, setCoinGeckoData] = useState([]);

  const [queryNumberOfDays, setQueryNumberOfDays] = useState(1);
  const queryNumberOfDaysOnChange = (value) => {
    console.log("value", value);

    if (value > 0) {
      setQueryNumberOfDays(value);  
    }
  }

  const [to, setTo] = useState(getUnixTimeStampFromDate(new Date()));
  const toOnchange = (value) => {
    console.log("value", value);

    if (value > 0) {
      setTo(value);  
    }
  }


  //const [displayNumberOfDays, setDisplayNumberOfDays] = useState(100);
  // prices, market_caps, total_volumes
  const [displayStyle, setDisplayStyle] = useState("prices");

  const [options, setOptions] = useState({
    chart: {
      type: 'spline'
    },
    plotOptions: {
      series: {
          compare: 'percent',
          showInNavigator: true
      },
      pointStart: 11
    },
    title: {
      text: coinIds
    },
    series: [
      {
        //data: [1, 2, 1, 4, 3, 6]
      }
    ]
  });

  useEffect(async() => {
    /*let coins = await coinsAll();
    console.log("coins", coins);

    let coinIds = []

    coins.data.forEach(coin => {
      coinIds.push(coin.id);
    })*/

    console.log(coinIds);

    const params = {};
    params.vs_currency = "usd";
    
    if (queryNumberOfDays > 100000) {
      params.from = queryNumberOfDays;
    }
    else {
      params.from = getUnixTimeStampFromDate(getPastDate(queryNumberOfDays));  
    }

    

    console.log("params.from", params.from)
    //params.from = params.from - 

    params.to = to;

    let series = [];

    for (let i = 0; i < coinIds.length; i++) {
      let response = await fetchMarketChartRange(coinIds[i], params);
      let responseArray = response.data[displayStyle];

      console.log("responseArray", responseArray);

      let dataArray = [];

      if (displayNumberOfDays > 0) {
        responseArray = responseArray.slice(queryNumberOfDays - displayNumberOfDays);
      }

      let base = undefined;

      responseArray.forEach(element => {
        let date = getDateFromTimeStamp(element[0]);
        let price = element[1];

        if (!base) {
          base = price;
        }

        if (price > 1000) {
          price = Math.floor(price);
        }
        else {
          //price = Number(price.toFixed(2));
        }

        if (percentage) {
          price = price / base
        }
        console.log(date.toISOString());

        dataArray.push(
          //[date.toISOString().substr(0, 10), price]
          //[date.toISOString(), price]
          //[date.toISOString(), price]
          [date.toDateString(), price]
         );
      });

      series.push({name: coinIds[i], data: dataArray});
    }

    setOptions({
      ...options, 
      series: series
    });

    // setCoinGeckoData(dataArray);
  }, [coinIds, queryNumberOfDays, displayNumberOfDays, to]);

  return (
    <div>
      HighChartsDemo
      {console.log("options", options)}
      <HighchartsReact highcharts={Highcharts}  options={options} />

      <InputNumber placeholder="from"defaultValue={1} onChange={queryNumberOfDaysOnChange} />
      <InputNumber placeholder="to"  onChange={toOnchange} />
    </div>
  );
}




const getPastDate = (pastDays) => {
  let date = new Date();

  date.setDate(date.getDate() - pastDays);

  return date;
}

const getUnixTimeStampFromDate = (date) => {
  return Math.floor((date.getTime() / 1000));
}

const getDateFromTimeStamp = (timeStamp) => {
  return new Date(timeStamp);
}