//node declarations are first
const fs = require('fs');

//then there are 3rd person declarations
const axios = require('axios');

class Search{
    history = [];
    dbPath = './db/database.json';
    recordsHistory = 6;
    constructor(){
        //Read database if exists
        this.readDB();
    }

    get getParamsMapbox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 6,
            'language': 'en'
        }
    }

    async city(place = ''){
        //http request
        const instance = axios.create({
            baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
            params: this.getParamsMapbox
        })
        try {
            //const response = await axios.get('https://reqres.in/api/users?page=2');
            const response = await instance.get();
            return response.data.features.map(place => ({ //place => ({}) to return an object
                id: place.id,
                place: place.place_name,
                lng: place.center[0],
                lat: place.center[1]
            }));
        } catch (error) {
            return [];
        }

    }

    get getParamsOpenWeather(){
        return{
            appId: process.env.OPENWEATHER_KEY,
            units: 'metric'
        };
    }

    async weatherByCity(lat, lon){
        try {
            //Create axios instance
            const weatherInstance = axios.create({
                //important to add 'https://'
                baseURL: 'https://api.openweathermap.org/data/2.5/weather',
                params: {lat, lon, ...this.getParamsOpenWeather} //destructuring
            });

            const {data} = await weatherInstance.get();
            return {
                desc: data.weather[0].description,
                min: data.main.temp_min,
                max: data.main.temp_max,
                temp: data.main.temp
            };
        } catch (error) {
            console.log('ERROR: ', error);
        }
    }

    addToHistory(place = ''){
        //prevent duplicate data
        if(this.history.includes(place)) return;
        
        this.history = this.history.splice(0,5); //6 positions
        this.history.unshift(place);

        //Save in DB
        this.saveDB();
    }

    saveDB(){
        //create an object if we have more params.
        const payload = {
            history: this.history
        }
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    readDB(){
        // verify that db exists
        if(!fs.existsSync(this.dbPath)) return;

        const data = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        this.history = JSON.parse(data).history;
    }

    showHistory(){
        if(this.history.length !== 0){
            this.history.forEach((place, i) => {
                const idx = `${i+1}`.green;           
                //console.log(`${idx} ${this.capitalize(place)}`);
                console.log(`${idx} ${place}`);        
            });
        }
    }

    // capitalize(text) {         
    //     const words = text.split(' ').map( word => {
    //         return word[0].toUpperCase() + word.slice(1);
    //     });
    //     return words.join(' ');
    // }
}


module.exports = Search;