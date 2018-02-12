const express = require('express')
const app = express()
const axios = require('axios');
var parseString = require('xml2js').parseString;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*'); //<-- you can change this with a specific url like http://localhost:4200
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});


//Default route
app.get('/', (req, res) => res.send('Welcome to the ted-sandbox NFL API!'));


// Define RESTful endpoint to gather year, week, type and team (optional) and produce a JSON data set for that set of params
app.get('/year/:year/week/:week/type/:type/:team?', function (req, res) {
    
    //Set the Incoming Request Params
    const request = req.params;
    const year  = request.year;
    const week = request.week;
    const type = request.type;
    const team = request.team;


    //Season Type can be 'PRE', 'REG' or 'POST'
    //PRE weeks are 1 through 4,
    //REG weeks are 1 through 17, 
    //POST weeks are 18 thru 20 (no 21), 
    //POST week 22 (superbowl)

    axios
    .get('http://www.nfl.com/ajax/scorestrip?season=' + year + '&seasonType=' + type + '&week=' + week)
    .then(response => {
      
       // Parse the original XML response data as JSON and return it
        parseString(response.data, function (err, result) {

            var resultData = [];

            console.log(result.ss.gms[0]);
            console.log(team);

                
                for(var i = 0; i < result.ss.gms[0].g.length; i++) {
                    var data= result.ss.gms[0].g[i].$;
                
                    //Decide how to push the data onto the array
                    if (typeof team === 'undefined') {
                        // variable team is undefined in the request, so we aren't filtering to the 'team' level, just push the data onto the array
                        resultData.push(data);
                    } else {
                        // the variable team is defined in the request, so we need to filter our returned lines to only those involving the given team value
                        console.log(data.h);

                        // if the submitted team value is equal to the home abbrevation or away abbreation, push the data onto the array
                        if(data.h == team || data.v == team) {
                            resultData.push(data);
                        }
                    }

                }



            //console.log(resultData);
            res.send(resultData);
        });
       
       
    })
    .catch(error => {
      console.log(error);
    });
    
    
});



// Define RESTful endpoint to gather year, week, type and team (optional) and produce a JSON data set for that set of params
app.get('/eid/:eid', function (req, res) {
    
    //Set the Incoming Request Params
    const request = req.params;
    const eid = request.eid;
   

    axios
    .get('http://www.nfl.com/liveupdate/game-center/' + eid + '/' + eid +'_gtd.json')
    .then(response => {
      
     
           // console.log(response.data) for this particular eid value
           console.log(response.data[eid].home);
           console.log(response.data[eid].away);


           res.send(response.data[eid]);
           
       
    })
    .catch(error => {
      console.log(error);
    });
    
    
});






app.listen(3000, () => console.log('Example app listening on port 3000!'))