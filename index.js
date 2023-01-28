var express = require('express');
var app = express();
//var firebaseConfig = require('./oclm-firebase');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const fetch = require('node-fetch');
const cheerio = require("cheerio");
const cors = require('cors');
const { json } = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

const serviceAccount = require('./oclm-api-db-firebase-adminsdk-ggr6y-7ff8779fe5.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

app.use(cors({
    origin:['http://localhost:3001', '*', 'https://oclm-manager-app.herokuapp.com'],
    methods:['POST']
}));
app.get('/', async function (req, res) {
    const docRef = db.collection('users').doc('alovelace');
    const snapshot = await db.collection('users').get();
    snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
      });
    await docRef.set({
    first: 'Ada',
    last: 'Lovelace',
    born: 1815
    });

    res.send('OCLM-API');
})

app.post('/assignments',jsonParser, async function (req, res) {
    console.log('weeknumber: '+req.body.weekNumber);
    const docRef = db.collection('assignments').doc(req.body.weekNumber);
    await docRef.set({
        ClosingPrayer: req.body.ClosingPrayer,
        LivingPart2: req.body.LivingPart2,
        Chairman: req.body.Chairman,
        OpenningPrayer: req.body.OpenningPrayer,
        Treasures: req.body.Treasures,
        Gems: req.body.Gems,
        MinistryPart3: req.body.MinistryPart3,
        MinistryPart1: req.body.MinistryPart1,
        CBS: req.body.CBS,
        MinistryPart2: req.body.MinistryPart2,
        LivingPart3: req.body.LivingPart3,
        Reading: req.body.Reading,
        LivingPart1: req.body.LivingPart1,
        CBSReader:req.body.CBSReader
        });
        res.send('SUCCESS!');

})

app.post('/',jsonParser, async function (req, res) {
    try{
        //var body;
        var date = new Date();
        var language = "e";
        var rValue = 1;
        try{
            console.log(String(req.body.language).toUpperCase());
            date = new Date(req.body.year, req.body.month-1, req.body.day);
            
            switch(String(req.body.language).toUpperCase()){
                case "ENGLISH":
                    language = "e";
                    rValue = 1
                    break;
                case "TAGALOG":
                    language = "tg";
                    rValue = 27
                    break;
                default:
                    language = "e";
                    rValue = 1
                    break;
            }
            
        }
        catch (error){
            res.send('UGh....' + error);
        }
        
        console.log('year: ' + date.getFullYear());
        var beginningDate = new Date(date.getFullYear(), 0,1);
        var reqDate = date; //new Date(Date.now());
        
        var diff = reqDate - beginningDate;
        var diffTime = Math.abs(reqDate - beginningDate);
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        console.log('diff: ' + diffDays);
        var weekNumber = Number.parseFloat((diffDays/7)+1).toFixed(0);
        console.log(weekNumber);
        const url = "https://wol.jw.org/en/wol/meetings/r"+rValue+"/lp-"+language+"/"+date.getFullYear()+"/"+weekNumber;

        const snapshot = await db.collection('assignments').get();
        var assignmentObj;
        snapshot.forEach((doc) => {
            if(doc.id == weekNumber){
                console.log(doc.data());
                assignmentObj = doc.data();
            }
        });
        
        console.log('url: '+url);
        const responseObj = [];
        const response = await fetch(url)
            .then(res => res.text())
            .then(
                (result) => {
                    const $ = cheerio.load(result);
                    const openningSection = $('#section1').find('ul');
                    const treasuresSection = $('#section2').find('.so');
                    const gemDetails = $('#section2').find('.sw');
                    const ministrySection = $('#section3').find('li');
                    const livingSection = $('#section4').find('li');

                    openningSection.each(function(ind, el){
                        console.log($(el).text());
                        responseObj.push({
                            sectionName: 'openning',
                            title: $(el).text().trim().replace('\n\n', ' ')
                        });
                    });
                    var gems =' '; 
                    gemDetails.each(function (ind, el){
                        gems += $(el).text() + ' ';   
                    });
                    treasuresSection.each(function(ind, el){
                        if($(el).text().includes('Spiritual Gems')){
                            responseObj.push({
                                sectionName: 'treasures',
                                title: $(el).text() +gems
                            });   
                        }
                        else{
                            responseObj.push({
                                sectionName: 'treasures',
                                title: $(el).text()
                            });   
                        }
                         
                    });

                    ministrySection.each(function(ind, el){
                        console.log($(el).text());
                        responseObj.push({
                            sectionName: 'ministry',
                            title: $(el).text().trim().replace('\n\n', ' ')
                        });
                    });

                    livingSection.each(function(ind, el){
                        console.log($(el).text());
                        responseObj.push({
                            sectionName: 'living',
                            title: $(el).text().trim().replace('\n\n', ' ')
                        });
                    });
                }
            );
            //var body = fetchResponse.text();        
            res.send({
                success:true,
                response: responseObj,
                assignments: assignmentObj
            });
    }
    catch (error){
        res.send({
            success:false,
            response: error
        });
    }
    
 })
 const PORT = process.env.PORT || 3000
 const HOST = process.env.HOST 
var server = app.listen(PORT, function () {
   console.log("Listening at http://%s:%s", HOST, PORT)
})