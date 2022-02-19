const fs = require('fs');

const axios = require('axios');


class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        this.leerDB();

    }

    get historialCapitalizado() {
        return this.historial.map( lugar => {

            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );

            return palabras.join(' '); 
        });
    }
    
    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsWheater() {
        return {
            appid:  process.env.OPENWHEATER_KEY,
            units: 'metric',
            lang:  'es'
        }
    }


    async cuidad( lugar = '' ) {

        try {
            // peticion http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();
            return resp.data.features.map( lugar => ({

                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
                
            }));

        } catch (err) {
            
            return [];
        }

    }

    async climaLugar( lat, lon ) {

        try {
           
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWheater, lat, lon }
            })

            const resp = await instance.get();
            const { weather, main } = resp.data;

            return {

                temp:     main.temp,
                descrip:  weather[0].description,
                temp_min: main.temp_min,
                temp_max: main.temp_max,

            }

        } catch (err) {

            console.log(err)
        }
    }

    agregarHistorial( lugar = '' ) {

        if( this.historial.includes( lugar )){
            return;
        }
        
        this.historial = this.historial.splice(0,5);

        this.historial.unshift( lugar );

        // Grabar en DB
        this.guardarDB();

    }

    guardarDB() {

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ));

    }

    leerDB() {

        if( !fs.existsSync(this.dbPath) ){
            return;
        }
    
        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
        const data = JSON.parse( info );
           
        this.historial = data.historial;
        

    }

}



module.exports = Busquedas; 