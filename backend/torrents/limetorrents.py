import re
import time
import requests
import html
from bs4 import BeautifulSoup
from helper.get_language import get_language
from helper.name_condenser import condense_torrent_name, clean_concatenated_content

def fix_encoding_issues(text):
    """Comprehensive function to fix common encoding issues"""
    if not text:
        return text
        
    # Debug: Print the original text with character codes
    print(f"Original text: {repr(text)}")
    
    # First, try HTML entity decoding
    text = html.unescape(text)
    
    # Fix Windows-1252 to UTF-8 mojibake patterns
    replacements = {
        'â€"': '—',      # em-dash
        'â€œ': '"',      # left double quotation mark
        'â€': '"',       # right double quotation mark  
        'â€™': "'",      # right single quotation mark
        'â€˜': "'",      # left single quotation mark
        'â€¦': '…',      # horizontal ellipsis
        'Â': ' ',        # non-breaking space corruption
        'Ã©': 'é',       # e with acute accent
        'Ã¡': 'á',       # a with acute accent
        'Ã­': 'í',       # i with acute accent
        'Ã³': 'ó',       # o with acute accent
        'Ãº': 'ú',       # u with acute accent
        'Ã±': 'ñ',       # n with tilde
        'Ã¼': 'ü',       # u with diaeresis
        'Ã¶': 'ö',       # o with diaeresis
        'Ã¤': 'ä',       # a with diaeresis
        'Ã§': 'ç',       # c with cedilla
        'â€¢': '•',      # bullet
        'â€¹': '‹',      # single left angle quotation mark
        'â€º': '›',      # single right angle quotation mark
        'Â«': '«',       # left guillemet
        'Â»': '»',       # right guillemet
        'â€¦': '...',    # ellipsis as three dots
    }
    
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    
    # Clean up multiple spaces
    text = ' '.join(text.split())
    
    print(f"Fixed text: {repr(text)}")
    return text

class Limetorrents:
    _name = "Limetorrents"

    def __init__(self):
        self.BASE_URL = "https://www.limetorrents.pro"
        self.LIMIT = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67',
            'Cookie': 'fencekey=0e31613a539b90e445bbcecafaa5a273'
        }

    def search(self, query, page, limit):
        self.LIMIT = limit
        start_time = time.time()
        
        url = f"{self.BASE_URL}/search/all/{query.strip()}/seeds/{page}/"
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            # Try multiple encoding approaches
            if response.encoding:
                original_encoding = response.encoding
            else:
                original_encoding = 'utf-8'
                
            # Force UTF-8 encoding
            response.encoding = 'utf-8'
            content = response.text
            
            # If that fails, try with the detected encoding
            if 'â€' in content and response.apparent_encoding:
                response.encoding = response.apparent_encoding
                content = response.text
                
        except requests.exceptions.RequestException as e:
            print(f"Limetorrents search error: {e}")
            return None

        soup = BeautifulSoup(content, "html.parser")
        torrent_rows = soup.select("table.table2 tr")
        
        results = {"data": []}
        for row in torrent_rows:
            if row.find("th") or not row.find("td"):
                continue

            cells = row.find_all("td")
            if len(cells) < 6:
                continue

            # Look for the torrent name link (usually the first link in the cell)
            name_links = cells[0].find_all("a")
            name_cell = None
            detail_page_url = None
            
            # Find the link that goes to the torrent detail page (not download)
            for link in name_links:
                href = link.get("href", "")
                # Skip direct download links
                if not (".torrent" in href or "download" in href.lower() or "magnet:" in href):
                    name_cell = link
                    detail_page_url = href
                    break
            
            # If no detail page link found, use the first link for name extraction
            if not name_cell and name_links:
                name_cell = name_links[0]
            
            if not name_cell:
                continue

            href = name_cell.get("href", "")
            name = ""
            
            if "title=" in href:
                import urllib.parse
                parsed_url = urllib.parse.urlparse(href)
                query_params = urllib.parse.parse_qs(parsed_url.query)
                if "title" in query_params:
                    name = query_params["title"][0]
                    name = name.replace("-", " ").replace("_", " ")
                    name = " ".join(name.split())
            
            if not name:
                name = name_cell.get_text().strip()
                
            if not name:
                continue
                
            # Use comprehensive encoding fix function
            name = fix_encoding_issues(name)

            name = clean_concatenated_content(name)
            # Clean name but don't condense (keep full name)
            # name = condense_torrent_name(name) # Disabled to show full names

            lang = get_language(name)
            if lang != "English":
                continue

            if detail_page_url:
                if detail_page_url.startswith("/"):
                    page_url = self.BASE_URL + detail_page_url
                elif detail_page_url.startswith("http"):
                    page_url = detail_page_url
                else:
                    page_url = self.BASE_URL + "/" + detail_page_url
            else:
                # Fallback to the first available href if no detail page URL is found
                torrent_href = name_cell.get("href")
                if torrent_href:
                    if torrent_href.startswith("/"):
                        page_url = self.BASE_URL + torrent_href
                    else:
                        page_url = torrent_href
                else:
                    # If no URL is available at all, set to empty to avoid crashing
                    page_url = ""

            try:
                date_text = cells[1].get_text().strip()
                size = cells[2].get_text().strip()
                
                try:
                    seeders = int(cells[3].get_text().strip().replace(',', '').replace(' ', ''))
                except (ValueError, IndexError):
                    seeders = 0
                    
                try:
                    leechers = int(cells[4].get_text().strip().replace(',', '').replace(' ', ''))
                except (ValueError, IndexError):
                    leechers = 0

                if seeders < 1:
                    continue

                torrent_hash = ""
                magnet_link = ""
                
                for link in row.find_all("a"):
                    href = link.get("href", "")
                    if "magnet:" in href:
                        magnet_link = href
                        hash_match = re.search(r'btih:([a-fA-F0-9]{40})', href)
                        if hash_match:
                            torrent_hash = hash_match.group(1)
                            break
                    elif "itorrents.org" in href or ".torrent" in href:
                        hash_match = re.search(r'([a-fA-F0-9]{40})', href)
                        if hash_match:
                            torrent_hash = hash_match.group(1)
                            magnet_link = f"magnet:?xt=urn:btih:{torrent_hash}&dn={name}"
                            break
                
                if not torrent_hash and not magnet_link:
                    torrent_hash = "0" * 40
                    magnet_link = f"magnet:?xt=urn:btih:{torrent_hash}&dn={name}"
                
                results["data"].append({
                    "name": name,
                    "size": size,
                    "seeders": seeders,
                    "leechers": leechers,
                    "uploader": "N/A",
                    "url": page_url,
                    "date": date_text,
                    "language": lang,
                    "hash": torrent_hash,
                    "magnet": magnet_link,
                })

                if self.LIMIT and len(results["data"]) >= self.LIMIT:
                    break
                    
            except (IndexError, AttributeError) as e:
                continue
        
        results["data"].sort(key=lambda x: x.get("seeders", 0), reverse=True)
        results["time"] = time.time() - start_time
        results["total"] = len(results["data"])
        return results

    def trending(self, category, page, limit):
        return {"error": "Not available"}

    def recent(self, category, page, limit):
        return {"error": "Not available"}

    def trending(self, category, page, limit):
        return None

    def recent(self, category, page, limit):
        return None
