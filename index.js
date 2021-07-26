require('dotenv').config();

const { readInput, inquirerMenu, pause, listPlaces } = require("./helpers/inquirer");
const Search = require("./models/search");

const main = async () => {
    const search = new Search();
    let option = '';
    do{
        
        option = await inquirerMenu();//readInput('Enter an option:');
        
        switch(option){
            case 1:
                // Show message
                const searchCity = await readInput('City: ');
                
                // Search places
                const places = await search.city(searchCity);
               
                // Select a place
                const selectedId = await listPlaces(places);
                
                if(selectedId === '0') continue;

                //Save in db                
                const selectedPlace = places.find(place => place.id === selectedId);
                search.addToHistory(selectedPlace.place);
                
                // Weather
                const weatherData = await search.weatherByCity(selectedPlace.lat, selectedPlace.lng);

                // Show results
                console.clear();
                console.log('\nCity information\n'.green);
                console.log('City:', selectedPlace.place.green);
                console.log('Lat:', selectedPlace.lat);
                console.log('Lng:', selectedPlace.lng);
                console.log('Tempeture:', weatherData.temp);
                console.log('Minimun:', weatherData.min);
                console.log('Maximum:', weatherData.max);
                console.log('Description:', weatherData.desc.green);
            break;

            case 2:
                search.showHistory();
            break;
        }

        if(option !== 0) await pause();

    }while(option !== 0);
}

main();