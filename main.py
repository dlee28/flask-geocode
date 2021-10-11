import json
from flask import Flask, render_template, jsonify
from geocode import *
from weather import *

app = Flask(__name__)

@app.route('/')
@app.route('/index')
def index():
    return app.send_static_file('index.html')

@app.route('/api/search/address/<string:address>/<string:timesteps>', methods=['GET'])
def get_weather_address(address, timesteps):
    geo_info = get_geocode_formaddr(address)
    print(address)
    print(geo_info[0])
    print(geo_info[1])
    response = get_weather(geo_info, timesteps)
    return jsonify(response)

@app.route('/api/search/ip/<string:timesteps>', methods=['GET'])
def get_weather_ip(timesteps):
    geo_info = get_geocode_ip()
    print(geo_info[0])
    # get_weather(lat_lng, '1d')
    # get_weather(lat_lng, '1h')
    current_response = get_weather(geo_info, timesteps)

    return jsonify(current_response)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
 