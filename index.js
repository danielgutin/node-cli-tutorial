#!/usr/bin/env node

const program = require('commander');
const citiesData = require('all-the-cities');
const { printHeader, printWeatherResults, generateExcel } = require('./utils/utils');
const { API_KEY, API_URL } = require('./constants/constants');
const axios = require('axios');

program
    .command('list')
    .alias('l') 
    .description('list of supported cities') 
    .option('-c, --country [IL]', 'Get Cities by country code')
    .action(function (args) {
        // --- if country flag is used
        if(args.country) {
            // show table of cities for specific country
            const cities = citiesData
                .filter(city => city.country.match(args.country))
                .map(({ cityId, name, country, population, loc }) => ({
                    id: cityId,
                    name,
                    country,
                    population,
                    coordinates: loc.coordinates
                }));
            if(cities.length) {
                printHeader(`List of Cities found for ${args.country}:`);
                console.table(cities);
            }else {
                console.log(`No Cities were found for "${args.country}" country name`);
            }
            return;
        }
        console.log("Please Provide a country flag for optimized search");
    });



program
    .command('weather')
    .alias('w') 
    .description('Show weather for specific city') 
    .option('-n, --name [Netanya]', 'Get weather for city by name')
    .option('-c, --coordinates [40.7831,-73.9712]', 'Get weather for city by coordinates')
    .option('-o, --output [filename]', 'Export data to excel file')
    .option('-p, --path [absolute path]', 'The absolute path for the generated Excel')

    .action(function (args) {
        if(args.name || args.coordinates) {
            const queryParam = args.name || args.coordinates;
            let data = 
            axios.get(`${API_URL}?access_key=${API_KEY}&query=${queryParam}`)
                .then((res) => {
                    const { observation_time, temperature, weather_descriptions, wind_speed } = res.data.current;
                    const { name, country, timezone_id } = res.data.location;
                    printWeatherResults(res)

                    // if in addition excel option is provided
                    if(args.output) {
                        generateExcel({
                            worksheetName: 'Weather',
                            headers: [
                                { header: 'name', key: 'name' },
                                { header: 'country', key: 'country' },
                                { header: 'timzone', key: 'timezone_id' },
                                { header: 'time', key: 'observation_time' },
                                { header: 'temperature', key: 'temperature' },
                                { header: 'description', key: 'weather_descriptions' },
                                { header: 'wind_speed', key: 'wind_speed' },
                            ],
                            rows: [{
                                name,
                                country,
                                timezone_id,
                                observation_time,
                                temperature,
                                weather_descriptions,
                                wind_speed
                            }],
                            generatedExcelName: typeof args.output === 'boolean' ? undefined : `${args.output}`,
                            outputPath: args.path || undefined
                        })
                    }
                })
                .catch(() => `Weather information is not available for ${queryParam}`)
            return;
        }
        console.log('Flag option is required, either search by name, coordinates or id');
    });


// allow commander to parse `process.argv`
program.parse(process.argv);
