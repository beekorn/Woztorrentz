import requests
from bs4 import BeautifulSoup
import time

class HTMLScraper:
    def __init__(self, headers=None):
        self.session = requests.Session()
        if headers:
            self.session.headers.update(headers)
        else:
            self.session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36'
            })
    
    def get_soup(self, url, timeout=10):
        """Get BeautifulSoup object from URL"""
        try:
            response = self.session.get(url, timeout=timeout)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None
    
    def get_text(self, url, timeout=10):
        """Get raw text from URL"""
        try:
            response = self.session.get(url, timeout=timeout)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error getting text from {url}: {e}")
            return None
