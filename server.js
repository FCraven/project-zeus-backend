require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const morgan = require('morgan');
const wiki = require('wikijs').default;

//TODO
//npm sms

let allListings = [];

const getListings =async ()=> {
  try {
    console.log(`Getting listings at ${Date.now()}`)
    const { data } = await axios.get(`https://api.bridgedataoutput.com/api/v2/onekey/listings?access_token=${process.env.SERVER_TOKEN}&limit=200&sortBy=ListPrice`)
    const { bundle } = data
    console.log('Got listings!')

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

const getWikiDescription = async (location) => {
  try {
    const urlQuery = location.split(' ').length > 1 ?
                        location.split(' ').join('%20') :
                        location;
    const searchQuery = `${urlQuery},%20New%20York`;
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&format=plain&generator=search&gsrsearch=${searchQuery}&gsrlimit=1&format=json&origin=*`;
    const { data } = await axios.get(endpoint);
    if(!data){
      return 'No summary available.'
    }
    const summary = data.query.pages[Object.keys(data.query.pages)[0]].extract
    return summary
  } catch(err) {
      console.log(err)
  }
}

getListings()

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

app.get('/api/topfive', (req,res)=> {
  res.json(allListings[0])
})

app.get('/api/properties', (req,res) => {
  const propertyTypes = allListings.filter(el => el.PropertyType === 'Land')
  res.json(propertyTypes)

})

app.get('/api/locations', async(req,res)=> {
  const cityArray = allListings.map(el => el.PostalCity)
  const uniqueCities = [...new Set(cityArray)].sort((a,b) => {
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

app.get('/api/locations/:location', async (req,res) => {
  try {
    const location = req.params.location
    const locationName = location[0].toUpperCase() + location.slice(1)
    const summary = await getWikiDescription(locationName)
    const listingsByLocation = allListings.filter(el => el.PostalCity === locationName)

    res.json({
      location: locationName,
      summary,
      listings: listingsByLocation
    })
  } catch(err) {
      console.log(err)
  }
})

app.get('/api/images',(req,res)=> {
  res.json(allListings[0].Media[0].MediaURL)
})

app.get('/keep-alive', (req,res,next) => {
  res.json({message: 'Heard '})
})



app.listen(PORT, function(){
  console.log('app listening on ' + PORT)
})

