const GETRequest = (url, cb) => {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.addEventListener('load', response => {
        const data = JSON.parse(response.currentTarget.response);
        cb(data)  
    });
    request.send();
}

const getBackgroundImage = (search, cb) => {  

    const URL = `https://api.pexels.com/v1/search?query=${search}&per_page=15&page=1;`

    GETRequest(URL, data => {
        Authorization: '563492ad6f917000010000015e2098243e5e446f8644b847db3c36f8';
        console.log(data    );
    })
}

getBackgroundImage('clouds', data =>{
    console.log(data);
} );


const getLocation = (city='casablanca', cb) => {

    
    const api_key = 'a0e1b23c99064c95b03fab098ef00ad5';
    const URL = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${api_key}`

    GETRequest(URL, data => {
        
        // console.log(data.results[0].geometry.lat)
        // console.log(data.results[0].geometry.lng);
        cb(data);
    })

}



const getGifs = (search, cb) => {
    if (search === "" || search.trim() === "") {
        return;
    }

    const api_key = 'siIyo4w5mg0REENX76Sr57QTgkt3BWvY';
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${search}`;

    GETRequest(url, data => {
        const gifArray = [];
        data.data.forEach(currentGif => {
            const url = currentGif.images.original.url;
            gifArray.push(url);
        });

        cb(gifArray);
    });
}

const getWeather = (lat, lng, cb) => {
    // TODO; apply some validation to lat, lng

    const URL_BASE = 'https://wt-taqqui_karim-gmail_com-0.sandbox.auth0-extend.com/darksky'
    const api_key = `393af19b538495405c437a8127fd3ef5`;
    const url = `${URL_BASE}?api_key=${api_key}&lat=${lat}&lng=${lng}`

    GETRequest(url, data => {
        // console.log(data);
        const forecast = JSON.parse(data.res.text);
        cb(forecast);
    });
}


const state = {
    locations:[], 
    gifs: {
        // 'partly-cloudy-day': 'https://media2.giphy.com/media/1uLQUtPLbJMQ0/giphy.gif',
        // 'not-loaded': 'https://media1.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif',
    },
}

// const cardInHtml = (gif, cityLat, cityLng, day, high, low, desc) => {
//     return `<div class="ui five column grid">
//     <div class="column">
//       <div class="ui fluid card">
//         <div class="image">
//           <img src="${gif}">
//         </div>
//         <div class="content">
//           <a class="header">${day} <br> ${cityLat} / ${cityLng}</a>
//               <a class="header">${desc}</a>
//               <span class="date"> ${high} / ${low}</span>
//         </div>
//       </div>
//     </div>
//   </div>`

// }

// const cardInHtml = (gif, cityLat, cityLng, day, high, low, desc) => {
// return `<div class="ui cards column">
//     <div class="card">
//       <div class="image">
//         <img src="${gif}">
//       </div>
//       <div class="content">
//         <div class="header"> ${cityLat}, ${cityLng} </div>
//         <div class="day">
//           <a>${day}</a>
//         </div>
//         <div class="description">
//         <span class="high"> High: ${high} </span> <br>
//         <span class="low"> Low: ${low} </span>
//         </div>
//       </div>
//       <div class="extra content">
//         <span class="right floated">
//           ${desc}
//         </span>
//       </div>
//     </div>
//     </div>`
// }

const cardInHtml = (gif, cityLat, cityLng, day, high, low, desc) => {
return `
            <div class="card col col-2"> 
                <div class="image">
                    <img class="img-js" src="${gif}">
                </div>    
                <div class="content" >
                    <div class="dayName"> ${cityLat}, ${cityLng}, ${day} </div>
                    <div class="temp"> ${high} F <br> ${low} F </div>
                    <div class="description"> ${desc} </div>
                </div>
            </div>`
        }

let columnHtml = document.querySelector(".js-column");

const render = state => {
    let cardhtml = '';

    // console.log('gifs in STate: ', state.gifs)
    
    for (let i=0; i<state.locations.length; i++){
        const cityLat = state.locations[i].lat;
        const cityLng = state.locations[i].lng;
        for (let j=0; j<state.locations[i].forecast.length; j++){
            const day = state.locations[i].forecast[j].day;
            const high = state.locations[i].forecast[j].hi;
            const low = state.locations[i].forecast[j].lo;
            const desc = state.locations[i].forecast[j].desc;
            const theDay = new Date((state.locations[i].forecast[j].datetime) * 1000);
            const newDay = theDay.toString().split(' ').slice(0,1).join();
            const icon = state.locations[i].forecast[j].icon;
            const gif = state.gifs[icon];

            // console.log('icon in the loop is: ', icon);
            // console.log('gif in the Loop: ', gif);

            cardhtml += cardInHtml(gif, cityLat, cityLng, newDay, high, low, desc);
        } 
    }
    columnHtml.innerHTML = cardhtml;        
}



const searchBtn = document.querySelector('.js-search');
const searchInput = document.querySelector('.js-input');


const filterInput = (val, cb) => {

    if (typeof val[0] === 'number') {
        cb(val);
    }
    
    else {
        getLocation(val, data=> {
            const lat = data.results[0].geometry.lat;
            const lng = data.results[0].geometry.lng;
            const latLng = `${lat},${lng}`;                   
            
            cb(latLng);
        })
    }    
}


searchBtn.addEventListener('click', e => {
    
    const val = searchInput.value;

    filterInput(val, convertedVal=>{
    
    const newVal = convertedVal.split(',');
    const lat = newVal[0].trim();
    const lng = newVal[1].trim();
        console.log('lat is: ', lat);
        console.log('lng is: ', lng);
    

        getWeather(lat, lng, data =>{
            const forecastData = data.daily.data;

            const forecast = [];

            for (let i=0; i<5; i++) {

                const icon = forecastData[i].icon;
                getGifs(icon, data => {
                    if (typeof state.gifs[icon] === 'undefined'){
                        // console.log('data from Gify is here => ', data[3]);
                        state.gifs[icon] = data[2];
                        }
                        render(state);
                    })

                const hi = forecastData[i].temperatureHigh;
                const lo = forecastData[i].temperatureLow;
                const time = forecastData[i].time;
                const desc = forecastData[i].summary;
                const locationObj = {};

                locationObj.datetime = time;
                locationObj.hi = hi;
                locationObj.lo = lo;
                locationObj.desc = desc;
                locationObj.icon = icon;

                forecast.push(locationObj);

            }
            const location = {};
            
            location.forecast = forecast;
            location.lat = lat;
            location.lng = lng;

            state.locations.push(location);
            // console.log(location);
            render(state);
    })
    
});

})