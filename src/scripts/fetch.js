const BASEURL = 'http://api.weatherapi.com/v1'
const APIKEY = '7b7ba9234b984c6eba9115539251906'

function request() {
    const requestData = {
        type: 'forecast',
    }    
    return function getData() {
        return `${BASEURL}/${requestData.type}.json?key=${APIKEY}&q=Ekaterinburg&days=1&aqi=no&alerts=no`
    }
}

const requestConfig = request()


// fetch(requestConfig())
//     .then((res) => {
//         if (!res.ok) throw new Error('Ошбика загрузки')
//         return res.json()
//     })
//     .then((data) => {
//         console.log(data)
//     })
//     .catch((err) => {
//         console.log(err)
//     })