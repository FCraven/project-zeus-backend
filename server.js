require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const morgan = require('morgan');
const wiki = require('wikijs').default;

//TODO
//npm sms

let allListings = [];

const getListings =async ()=> {
  try {
    const { data } = await axios.get(`https://api.bridgedataoutput.com/api/v2/onekey/listings?access_token=${process.env.SERVER_TOKEN}&limit=200&sortBy=ListPrice`)
    const { bundle } = data

    for(const listing of bundle){
      const scrubbedListing = {};
      for(const key in listing){
        if(key.slice(0,7) !== 'ONEKEY_'){
           scrubbedListing[key] = listing[key];
        }
      }
      allListings.push(scrubbedListing)
    }
  } catch(err) {
    console.log(err)
  }
}

// getListings()

const listingFetcher = setInterval(getListings, (60000 * 60 * 8))

app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))


app.get('/api/listings', (req,res) => {
  try {
    res.json(allListings)
  } catch(err){
     console.log(err);
  }
})

app.get('/api/top', (req,res)=> {
  res.json(allListings[0])
})

app.get('/api/properties', (req,res) => {
  const propertyTypes = allListings.filter(el => el.PropertyType === 'Land')
  res.json(propertyTypes)

})

app.get('/api/locations', (req,res)=> {
  const cityArray = allListings.map(el => el.City)
  const uniqueCities = [...new Set(cityArray)].sort((a,b)=> {
    a = a.toUpperCase()
    b = b.toUpperCase()
    if(a < b) {
      return -1;
    }
    if(a > b) {
      return 1;
    }
    return 0;
  })
  res.json(uniqueCities)
})

app.get('/api/description', (req,res)=> {

  wiki()
  .page('Eastchester, New York')
  .then(page => page.summary())
  .then(summary=> {
    console.log(summary)
    res.end()
  })
  .catch(err => console.log(err))

})


app.listen(PORT, function(){
  console.log('app listening on ' + PORT)
})

