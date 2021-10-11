import requests

URL = 'https://api.tomorrow.io/v4/timelines'
API_KEY = 'WUff1U58phXdmCD6bkGvjRXgGZR4LpnD'

def get_weather(geo_info, timesteps):
    querystring = {"location":geo_info[0],
                    "fields":[],
                    "units":"imperial",
                    "timesteps":timesteps,
                    "timezone":"America/Los_Angeles",
                    "apikey":API_KEY}
    headers = {"Accept": "application/json"}
    if timesteps == '1d':
        querystring['fields'] = ["temperature","temperatureApparent","temperatureMin","temperatureMax","windSpeed","windDirection","humidity","pressureSeaLevel","uvIndex","weatherCode","precipitationProbability","precipitationType","sunriseTime","sunsetTime","visibility","moonPhase","cloudCover"]
        response = requests.request("GET", URL, headers=headers, params=querystring).json()
        response = extract_response_1d(response)
    elif timesteps == '1h':
        querystring['fields'] = ["temperature","windSpeed","windDirection","humidity","pressureSeaLevel"]
        response = requests.request("GET", URL, headers=headers, params=querystring).json()
        response = extract_response_1h(response)
    elif timesteps == 'current':
        querystring['fields'] = ["weatherCode","temperature","humidity","pressureSeaLevel","windSpeed","visibility","cloudCover", "uvIndex"],
        response = requests.request("GET", URL, headers=headers, params=querystring).json()
        # print(response)
        response = extract_response_current(response, geo_info[1])
        # print(type(response))
    return response

def extract_response_1h(response):
    print('extract_resonse_1h starting...')
    print(response)
    clean_response = {}
    hours = []
    i = 0
    clean_response['hourInfo'] = {}
    for hourData in response['data']['timelines'][0]['intervals']:
        # for hour in response['data']['timelines'][0]['intervals'][i]:
        #     print(hour)
        # print(hourData)
        # print(hourData["startTime"])
        # print(hourData["values"])
        values = hourData["values"]
        hours.append(hourData["startTime"])
        clean_response['hourInfo'][hourData['startTime']] = {'startTimeIndex' : i,
                                                'temperature': values['temperature'],
                                                'windSpeed': values['windSpeed'],
                                                'windDirection': values['windDirection'],
                                                'humidity': values['humidity'],
                                                'pressureSeaLevel': values['pressureSeaLevel']
                                                }
        i += 1
    clean_response['hours'] = hours
    # print(clean_response)
    return clean_response

def extract_response_1d(response):
    # print(response['data']['timelines'])
    print(response)
    clean_response = {}
    for i in range(len(response['data']['timelines'][0]['intervals'])):
        # print('day ', i, ' ', response['data']['timelines'][0]['intervals'][i])
        # key = 'day' + str(i)
        values = response['data']['timelines'][0]['intervals'][i]['values']
        key = values['sunriseTime']
        clean_response[key] = {'temperature': values['temperature'],
                                'temperatureApparent': values['temperatureApparent'], 
                                'temperatureMin': values['temperatureMin'], 
                                'temperatureMax': values['temperatureMax'], 
                                'windSpeed': values['windSpeed'], 
                                # 'windDirection': values['windDirection'], 
                                'humidity': values['humidity'], 
                                # 'pressureSeaLevel': values['pressureSeaLevel'],
                                'weatherCode': values['weatherCode'], 
                                'precipitationProbability': values['precipitationProbability'], 
                                'precipitationType': values['precipitationType'], 
                                'sunriseTime': values['sunriseTime'], 
                                'sunsetTime': values['sunsetTime'], 
                                'visibility': values['visibility'], 
                                'moonPhase': values['moonPhase'], 
                                # 'cloudCover': values['cloudCover']
                            }
    # print(clean_response)
    return clean_response

def extract_response_current(response, formatted_address):
    print(response)
    values = response['data']['timelines'][0]['intervals'][0]['values']
    # print(response['data']['timelines'][0]['intervals'][0]['values']['temperature'])
    return {'weatherCode': values['weatherCode'],
            'temperature': values['temperature'],
            'humidity': values['humidity'],
            'pressureSeaLevel': values['pressureSeaLevel'],
            'windSpeed': values['windSpeed'],
            'visibility': values['visibility'],
            'cloudCover': values['cloudCover'],
            'uvIndex': values['uvIndex'],
            'formatted_address': formatted_address
            }