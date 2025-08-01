import re
import time
import html
import cloudscraper
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup
from helper.get_language import get_language
from helper.name_condenser import condense_torrent_name, clean_concatenated_content
class Kickass:
    _name = "Kickass"

    def __init__(self):
        self.BASE_URL = "https://katcr.to"
        self.LIMIT = None
        self.scraper = cloudscraper.create_scraper()

    def _get_magnet_link(self, page_url):
        try:
            response = self.scraper.get(page_url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            magnet_link = soup.find('a', class_='kaGiantButton').get('href')
            return magnet_link
        except Exception as e:
            return None

    def search(self, query, page, limit):
        self.LIMIT = limit
        start_time = time.time()
        
        url = f"{self.BASE_URL}/usearch/{query}/{page}/"
        try:
            response = self.scraper.get(url, timeout=10)
            response.raise_for_status()
        except Exception as e:
            print(f"Kickass search error: {e}")
            return None

        soup = BeautifulSoup(response.text, "html.parser")
        results = {"data": []}
        
        # Use more specific selectors to avoid hanging
        torrent_list = soup.select("tr.odd, tr.even")
        if not torrent_list:
            torrent_list = soup.select("table.data > tbody > tr")

        print(f"Kickass: Found {len(torrent_list)} potential torrent rows.")
        
        torrent_data = []
        for torrent in torrent_list:
            if torrent.find('th'):
                continue

            name_cell = torrent.select_one('a.cellMainLink')
            if not name_cell:
                continue

            cells = torrent.find_all("td")
            if len(cells) < 5:
                continue

            try:
                seeders = int(cells[4].text.strip().replace(',', ''))
                if seeders == 0:
                    continue
                name = name_cell.text.strip()
                # Decode HTML entities and fix common UTF-8 encoding issues
                name = html.unescape(name)

                # Fix common UTF-8 encoding corruption patterns
                name = name.replace('â€"', '—')  # em-dash
                name = name.replace('â€œ', '"')  # left double quotation mark
                name = name.replace('â€', '"')   # right double quotation mark
                name = name.replace('â€™', "'")  # right single quotation mark
                name = name.replace('â€˜', "'")  # left single quotation mark
                name = name.replace('â€¦', '…')  # horizontal ellipsis
                name = name.replace('Â', ' ')    # non-breaking space corruption
                name = name.replace('Ã©', 'é')   # e with acute accent
                name = name.replace('Ã¡', 'á')   # a with acute accent
                name = name.replace('Ã­', 'í')   # i with acute accent
                name = name.replace('Ã³', 'ó')   # o with acute accent
                name = name.replace('Ãº', 'ú')   # u with acute accent
                name = name.replace('Ã±', 'ñ')   # n with tilde
                lang = get_language(name)
                if lang != "English":
                    continue

                torrent_data.append({
                    'name': name,
                    'page_url': self.BASE_URL + name_cell.get('href'),
                    'size': cells[1].text.strip(),
                    'date': cells[3].text.strip(),
                    'seeders': seeders,
                    'leechers': int(cells[5].text.strip().replace(',', '')),
                    'language': lang
                })
            except (ValueError, IndexError):
                continue

        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_torrent = {executor.submit(self._get_magnet_link, data['page_url']): data for data in torrent_data}
            for future in as_completed(future_to_torrent):
                torrent_info = future_to_torrent[future]
                try:
                    magnet_link = future.result()
                    if magnet_link:
                        hash_match = re.search(r"btih:([a-fA-F0-9]{40})", magnet_link)
                        results['data'].append({
                            'name': torrent_info['name'],
                            'size': torrent_info['size'],
                            'seeders': torrent_info['seeders'],
                            'leechers': torrent_info['leechers'],
                            'url': torrent_info['page_url'],
                            'date': torrent_info['date'],
                            'language': torrent_info['language'],
                            'magnet': magnet_link,
                            'hash': hash_match.group(1) if hash_match else None
                        })
                except Exception as e:
                    print(f"Error processing torrent {torrent_info['name']}: {e}")

                if self.LIMIT and len(results['data']) >= self.LIMIT:
                    # This doesn't immediately stop other futures, but prevents adding more results
                    break
        
        results["data"].sort(key=lambda x: x.get("seeders", 0), reverse=True)
        results["time"] = time.time() - start_time
        results["total"] = len(results["data"])
        return results

    def trending(self, category, page, limit):
        return {"error": "Not available"}

    def recent(self, category, page, limit):
        return {"error": "Not available"}
