#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from torrents.kickass import Kickass
from torrents.limetorrents import Limetorrents
from torrents.pirate_bay import PirateBay

def test_site(site_class, site_name):
    print(f"\n=== Testing {site_name} ===")
    try:
        site = site_class()
        print(f"Base URL: {site.BASE_URL}")
        
        # Test search with a simple query
        results = site.search("avatar", 1, 5)
        
        if results is None:
            print(f"❌ {site_name}: Search returned None (site may be down)")
            return False
        elif "error" in results:
            print(f"❌ {site_name}: Error - {results['error']}")
            return False
        elif len(results.get("data", [])) == 0:
            print(f"⚠️  {site_name}: No results found")
            return False
        else:
            print(f"✅ {site_name}: Found {len(results['data'])} results")
            for i, torrent in enumerate(results["data"][:2]):  # Show first 2 results
                print(f"  {i+1}. {torrent['name']} (S:{torrent['seeders']} L:{torrent['leechers']})")
            return True
            
    except Exception as e:
        print(f"❌ {site_name}: Exception - {str(e)}")
        return False

def main():
    print("Testing torrent site connectivity...")
    
    sites = [
        (PirateBay, "Pirate Bay"),
        (Kickass, "KickAss"),
        (Limetorrents, "LimeTorrents")
    ]
    
    working_sites = []
    
    for site_class, site_name in sites:
        if test_site(site_class, site_name):
            working_sites.append(site_name)
    
    print(f"\n=== Summary ===")
    print(f"Working sites: {', '.join(working_sites) if working_sites else 'None'}")
    print(f"Total working: {len(working_sites)}/3")

if __name__ == "__main__":
    main()
