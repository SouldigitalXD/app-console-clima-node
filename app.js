require('dotenv').config();

const { leerInput, inquirerMenu, btnEnter, listarLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');
require('colors');


const main = async () => {

    const busquedas = new Busquedas();
    let opt;

    do {

        opt = await inquirerMenu();

        switch ( opt ) {

            case 1:
                //mostrar mensaje:
                const termino =  await leerInput('Cuidad: ');

                // Buscar lugares
                const lugares =  await busquedas.cuidad( termino );

                // Seleccionar el lugar
                const id = await listarLugares( lugares );
                if ( id === '0' ) continue;
                const lugarSelec = lugares.find( lugar => lugar.id === id );

                // Guardar Db
                busquedas.agregarHistorial( lugarSelec.nombre );
                

                // Clima
                const clima = await busquedas.climaLugar( lugarSelec.lat, lugarSelec.lng );

                console.clear();
                console.log('\nInformacion de la ciudad\n'.green);
                console.log('Cuidad:', lugarSelec.nombre );
                console.log('lat:',    lugarSelec.lat );
                console.log('Lng:',    lugarSelec.lng );
                console.log('Temperatura:', clima.temp);
                console.log('Minima:',      clima.temp_min);
                console.log('Maxima:',      clima.temp_max );
                console.log('Descripcion:', clima.descrip );
            break;

            case 2:

                busquedas.historialCapitalizado.forEach( ( lugar, i ) => {

                    const idx = `${ i + 1 }`.green;
                    console.log(`${ idx } ${ lugar }`);
                    
                });


            break;

        }


        if (opt !== 0) await btnEnter();

    } while ( opt !== 0 );

}

main();