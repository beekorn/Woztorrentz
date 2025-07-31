import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import quote
from helper.get_language import get_language
from helper.name_condenser import condense_torrent_name, clean_concatenated_content
import re

class PirateBay:
    _name = "Pirate Bay"
    
    def __init__(self):
        self.BASE_URL = "https://thehiddenbay.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36'
        }

    def search(self, query, page, limit):
        start_time = time.time()
        # Traditional Pirate Bay search URL format
        search_url = f"{self.BASE_URL}/search/{quote(query)}/{page}/99/0"
        try:
            response = requests.get(search_url, headers=self.headers, timeout=15)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {search_url}: {e}")
            return None

        soup = BeautifulSoup(response.text, 'html.parser')
        results = {"data": []}
        
        # Find all table rows in the search results table
        torrent_rows = soup.select('table#searchResult tr')
        
        for row in torrent_rows:
            # Skip header rows
            if row.find('th'):
                continue
                
            # Extract data from font elements
            desc_font = row.find('font', class_='detDesc')
            if not desc_font:
                continue
                
            desc_text = desc_font.text
            # Parse description text (e.g., "Uploaded 04-07 2023, Size 1.23 GiB, ULed by username")
            desc_parts = desc_text.replace('Uploaded', '').replace('ULed', 'Uploaded').split(',')
            if len(desc_parts) < 3:
                continue
                
            date_str = desc_parts[0].strip()
            size_str = desc_parts[1].replace('Size', '').strip()
            uploader = desc_parts[2].replace('by', '').strip()
            
            # Extract magnet link
            magnet_link = row.select_one('td div.detName + a')
            if not magnet_link:
                continue
            magnet_href = magnet_link.get('href')
            
            # Extract hash from magnet link
            hash_match = magnet_href.split('btih:')
            if len(hash_match) < 2:
                continue
            torrent_hash = hash_match[1].split('&')[0]
            
            # Extract name
            name_link = row.select_one('a.detLink')
            if not name_link:
                continue
            # Clean name but don't condense (keep full name)
            name = name_link.text.strip()
            name = clean_concatenated_content(name)
            # name = condense_torrent_name(name)  # Disabled to show full names
            
            # Filter for English language
            lang = get_language(name)
            if lang != "English":
                continue
            
            # Extract seeders and leechers
            seeders_elem = row.select('td')[-2] if len(row.select('td')) >= 2 else None
            leechers_elem = row.select('td')[-1] if len(row.select('td')) >= 1 else None
            
            if not seeders_elem or not leechers_elem:
                continue
                
            # Handle seeders conversion with error handling
            try:
                seeders = int(seeders_elem.text.strip().replace(',', '').replace(' ', ''))
            except (ValueError, IndexError):
                seeders = 0
                
            # Handle leechers conversion with error handling
            try:
                leechers = int(leechers_elem.text.strip().replace(',', '').replace(' ', ''))
            except (ValueError, IndexError):
                leechers = 0
            
            # Filter out torrents with 0 seeders
            if seeders < 1:
                continue
            
            # Extract URL
            url = name_link.get('href')
            if url:
                if url.startswith('/'):
                    url = self.BASE_URL + url
                elif not url.startswith('http'):
                    url = self.BASE_URL + '/' + url
            
            results["data"].append({
                "name": name,
                "size": size_str,
                "seeders": seeders,
                "leechers": leechers,
                "uploader": uploader,
                "url": url,
                "date": date_str,
                "language": lang,
                "hash": torrent_hash,
                "magnet": magnet_href,
            })

        results["data"].sort(key=lambda x: x.get("seeders", 0), reverse=True)
        if limit and len(results["data"]) > limit:
            results["data"] = results["data"][:limit]

        results["time"] = time.time() - start_time
        results["total"] = len(results["data"])
        return results

    def trending(self, category, page, limit):
        # The website does not support trending queries.
        return None

    def recent(self, category, page, limit):
        # The website does not support recent queries.
        return None
    
    def top100_movies(self, page=1, limit=100):
        """Get top 100 movies from Pirate Bay browse page by fetching multiple pages"""
        start_time = time.time()
        all_results = []
        
        # Calculate how many pages we need to fetch to get the desired limit
        # Assuming ~30 results per page, we need at least 4 pages to get 100+ results
        pages_needed = max(1, (limit + 29) // 30)  # Round up division
        
        for current_page in range(page, page + pages_needed):
            # Browse URL format: /browse/207/PAGE/7/0 (207 = Video/Movies category, 7 = sort by seeders)
            browse_url = f"{self.BASE_URL}/browse/207/{current_page}/7/0"
            
            try:
                response = requests.get(browse_url, headers=self.headers, timeout=15)
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                print(f"Error fetching {browse_url}: {e}")
                if current_page == page:  # If first page fails, return None
                    return None
                else:  # If subsequent pages fail, continue with what we have
                    break

            soup = BeautifulSoup(response.text, 'html.parser')
            page_results = []
            
            # Find all table rows in the browse results table
            torrent_rows = soup.select('table#searchResult tr')
            
            for row in torrent_rows:
                # Skip header rows
                if row.find('th'):
                    continue
                    
                # Extract data from font elements
                desc_font = row.find('font', class_='detDesc')
                if not desc_font:
                    continue
                    
                desc_text = desc_font.text
                # Parse description text (e.g., "Uploaded 04-07 2023, Size 1.23 GiB, ULed by username")
                desc_parts = desc_text.replace('Uploaded', '').replace('ULed', 'Uploaded').split(',')
                if len(desc_parts) < 3:
                    continue
                    
                date_str = desc_parts[0].strip()
                size_str = desc_parts[1].replace('Size', '').strip()
                uploader = desc_parts[2].replace('by', '').strip()
                
                # Extract magnet link
                magnet_link = row.select_one('td div.detName + a')
                if not magnet_link:
                    continue
                magnet_href = magnet_link.get('href')
                
                # Extract hash from magnet link
                hash_match = magnet_href.split('btih:')
                if len(hash_match) < 2:
                    continue
                torrent_hash = hash_match[1].split('&')[0]
                
                # Extract name
                name_link = row.select_one('a.detLink')
                if not name_link:
                    continue
                # Clean name but don't condense (keep full name)
                name = name_link.text.strip()
                name = clean_concatenated_content(name)
                # name = condense_torrent_name(name)  # Disabled to show full names
                
                # Filter for English language
                lang = get_language(name)
                if lang != "English":
                    continue
                
                # Extract seeders and leechers
                seeders_elem = row.select('td')[-2] if len(row.select('td')) >= 2 else None
                leechers_elem = row.select('td')[-1] if len(row.select('td')) >= 1 else None
                
                if not seeders_elem or not leechers_elem:
                    continue
                    
                # Handle seeders conversion with error handling
                try:
                    seeders = int(seeders_elem.text.strip().replace(',', '').replace(' ', ''))
                except (ValueError, IndexError):
                    seeders = 0
                    
                # Handle leechers conversion with error handling
                try:
                    leechers = int(leechers_elem.text.strip().replace(',', '').replace(' ', ''))
                except (ValueError, IndexError):
                    leechers = 0
                
                # Filter out torrents with 0 seeders
                if seeders < 1:
                    continue
                
                # Extract URL
                url = name_link.get('href')
                if url:
                    if url.startswith('/'):
                        url = self.BASE_URL + url
                    elif not url.startswith('http'):
                        url = self.BASE_URL + '/' + url
                
                page_results.append({
                    "name": name,
                    "size": size_str,
                    "seeders": seeders,
                    "leechers": leechers,
                    "uploader": uploader,
                    "url": url,
                    "date": date_str,
                    "language": lang,
                    "hash": torrent_hash,
                    "magnet": magnet_href,
                })
            
            all_results.extend(page_results)
            
            # If we have enough results or this page returned no results, stop fetching
            if len(all_results) >= limit or len(page_results) == 0:
                break
        
        # Sort all results by seeders (descending) and limit to requested amount
        all_results.sort(key=lambda x: x.get("seeders", 0), reverse=True)
        if limit and len(all_results) > limit:
            all_results = all_results[:limit]
        
        results = {
            "data": all_results,
            "time": time.time() - start_time,
            "total": len(all_results)
        }
        
        return results
    
    def top100_category(self, category_id, page=1, limit=100):
        """Get top 100 torrents from a specific category from Pirate Bay browse page"""
        start_time = time.time()
        all_results = []
        
        # Calculate how many pages we need to fetch to get the desired limit
        # Assuming ~30 results per page, we need at least 4 pages to get 100+ results
        pages_needed = max(1, (limit + 29) // 30)  # Round up division
        
        for current_page in range(page, page + pages_needed):
            # Browse URL format: /browse/CATEGORY_ID/PAGE/7/0 (7 = sort by seeders)
            browse_url = f"{self.BASE_URL}/browse/{category_id}/{current_page}/7/0"
            
            try:
                response = requests.get(browse_url, headers=self.headers, timeout=15)
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                print(f"Error fetching {browse_url}: {e}")
                if current_page == page:  # If first page fails, return None
                    return None
                else:  # If subsequent pages fail, continue with what we have
                    break

            soup = BeautifulSoup(response.text, 'html.parser')
            page_results = []
            
            # Find all table rows in the browse results table
            torrent_rows = soup.select('table#searchResult tr')
            
            for row in torrent_rows:
                # Skip header rows
                if row.find('th'):
                    continue
                    
                # Extract data from font elements
                desc_font = row.find('font', class_='detDesc')
                if not desc_font:
                    continue
                    
                desc_text = desc_font.text
                # Parse description text (e.g., "Uploaded 04-07 2023, Size 1.23 GiB, ULed by username")
                desc_parts = desc_text.replace('Uploaded', '').replace('ULed', 'Uploaded').split(',')
                if len(desc_parts) < 3:
                    continue
                    
                date_str = desc_parts[0].strip()
                size_str = desc_parts[1].replace('Size', '').strip()
                uploader = desc_parts[2].replace('by', '').strip()
                
                # Extract magnet link
                magnet_link = row.select_one('td div.detName + a')
                if not magnet_link:
                    continue
                magnet_href = magnet_link.get('href')
                
                # Extract hash from magnet link
                hash_match = magnet_href.split('btih:')
                if len(hash_match) < 2:
                    continue
                torrent_hash = hash_match[1].split('&')[0]
                
                # Extract name
                name_link = row.select_one('a.detLink')
                if not name_link:
                    continue
                # Clean name but don't condense (keep full name)
                name = name_link.text.strip()
                name = clean_concatenated_content(name)
                # name = condense_torrent_name(name)  # Disabled to show full names
                
                # Filter for English language
                lang = get_language(name)
                if lang != "English":
                    continue
                
                # Extract seeders and leechers
                seeders_elem = row.select('td')[-2] if len(row.select('td')) >= 2 else None
                leechers_elem = row.select('td')[-1] if len(row.select('td')) >= 1 else None
                
                if not seeders_elem or not leechers_elem:
                    continue
                    
                # Handle seeders conversion with error handling
                try:
                    seeders = int(seeders_elem.text.strip().replace(',', '').replace(' ', ''))
                except (ValueError, IndexError):
                    seeders = 0
                    
                # Handle leechers conversion with error handling
                try:
                    leechers = int(leechers_elem.text.strip().replace(',', '').replace(' ', ''))
                except (ValueError, IndexError):
                    leechers = 0
                
                # Filter out torrents with 0 seeders
                if seeders < 1:
                    continue
                
                # Extract URL
                url = name_link.get('href')
                if url:
                    if url.startswith('/'):
                        url = self.BASE_URL + url
                    elif not url.startswith('http'):
                        url = self.BASE_URL + '/' + url
                
                page_results.append({
                    "name": name,
                    "size": size_str,
                    "seeders": seeders,
                    "leechers": leechers,
                    "uploader": uploader,
                    "url": url,
                    "date": date_str,
                    "language": lang,
                    "hash": torrent_hash,
                    "magnet": magnet_href,
                })
            
            all_results.extend(page_results)
            
            # If we have enough results or this page returned no results, stop fetching
            if len(all_results) >= limit or len(page_results) == 0:
                break
        
        # Sort all results by seeders (descending) and limit to requested amount
        all_results.sort(key=lambda x: x.get("seeders", 0), reverse=True)
        if limit and len(all_results) > limit:
            all_results = all_results[:limit]
        
        results = {
            "data": all_results,
            "time": time.time() - start_time,
            "total": len(all_results)
        }
        
        return results
