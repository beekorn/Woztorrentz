from torrents.pirate_bay import PirateBay
import json

def test_pirate_bay_search():
    print("Testing restored Pirate Bay scraper...")
    scraper = PirateBay()
    query = "python"
    page = 1
    limit = 10

    results = scraper.search(query, page, limit)

    if results and results.get('data'):
        print(f"Successfully fetched {results.get('total', 0)} results.")
        if results['data']:
            print("First result:")
            print(json.dumps(results['data'][0], indent=2))
        else:
            print("No results found for the query.")
    else:
        print("Failed to fetch results from Pirate Bay.")

if __name__ == "__main__":
    test_pirate_bay_search()
