import requests
from constants.base_url import KICKASS
from constants.headers import HEADER_AIO

url = f"{KICKASS}/usearch/tenet/1/"

print(f"Testing Kickass scraper with URL: {url}")

try:
    response = requests.get(url, headers=HEADER_AIO, timeout=20)
    response.raise_for_status()
    print("Successfully fetched Kickass URL.")
    print(f"Response status code: {response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"Error fetching Kickass URL: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
