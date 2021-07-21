require('dotenv').config()


const getListings =async ()=> {
  try {
    const { data } = await axios.get(`https://api.bridgedataoutput.com/api/v2/onekey/listings?access_token=${process.env.SERVER_TOKEN}&limit=200&sortBy=ListPrice`)
    const { bundle } = data
    const allListings = []

    for(const listing of bundle){
      const scrubbedListing = {};
      for(const key in listing){
        if(key.slice(0,7) !== 'ONEKEY_'){
           scrubbedListing[key] = listing[key];
        }
      }
      allListings.push(scrubbedListing)
    }
    return allListings
  } catch(err) {
    console.log(err)
  }
}

const getWiki = async (location) => {
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


module.exports = {
  getListings,
  getWiki
}
