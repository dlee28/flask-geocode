import requests

API_URL_MAPS = 'https://maps.googleapis.com/maps/api/geocode/json?'
API_KEY_MAPS = 'AIzaSyAy8qWd_VJ4EuU7pq0wRg0XlXKEiwNhgmU'

API_URL_IP = 'https://ipinfo.io/?token='
API_KEY_IP = '386bcc0045cd00'

def get_geocode_ip():
    request_url = API_URL_IP + API_KEY_IP
    response = requests.get(request_url).json()
    city_state = response['city'] + ', ' + response['region']
    lat_lng = response['loc']
    return [lat_lng, city_state]

def get_geocode_formaddr(address):
    request_url = API_URL_MAPS + address_url(address) + '&key=' + API_KEY_MAPS
    try:
        response = requests.get(request_url).json()
        # print('formattted addr ', response['results'][0]['formatted_address'])
        results = response['results'][0]
        lat = results['geometry']['location']['lat']
        lng = results['geometry']['location']['lng']
        return [str(lat) + ', ' + str(lng), response['results'][0]['formatted_address']]
    except err:
        return None

def address_url(address):
    return 'address=' + address.replace(' ', '+')

# if __name__ == '__main__':
#     print('Main starting...')
#     print(get_geocode('1600 Amphitheatre Parkway Mountain View CA'))