var express = require('express');
var app = express();
const fetch = require('node-fetch');
const cheerio = require("cheerio");

app.get('/', function (req, res) {
   res.send('Hello World');
})
app.post('/', async function (req, res) {
    try{
        let dateToday = Date.now();
        var date = new Date(dateToday);
        console.log('year: ' + date.getFullYear());
        var beginningDate = new Date(date.getFullYear(), 0,1);
        var today = new Date(Date.now());
        
        var diff = today - beginningDate;
        var diffTime = Math.abs(today - beginningDate);
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        console.log('diff: ' + diffDays);
        var weekNumber = Number.parseFloat((diffDays/7)+1).toFixed(0);
        console.log(weekNumber);
        const url = "https://wol.jw.org/en/wol/meetings/r1/lp-e/"+date.getFullYear()+"/"+weekNumber;
        
        console.log('url: '+url);
        const responseObj = [];
        const response = await fetch(url)
            .then(res => res.text())
            .then(
                (result) => {
                    const $ = cheerio.load(result);
                    for(var i = 3; i<23; i++){
                        responseObj.push({
                            partid: i-2,
                            title: $('#p'+i).text()
                        });
                    }
                  }
            );
            //var body = fetchResponse.text();        
            res.send({
                success:true,
                response: responseObj
            });
    }
    catch (error){
        res.send({
            success:false,
            response: error
        });
    }
    
 })
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})