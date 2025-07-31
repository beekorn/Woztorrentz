from torrents.limetorrents import Limetorrents
import json

def test_limetorrents_search():
    print("Testing restored Limetorrents scraper...")
    scraper = Limetorrents()
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
        print("Failed to fetch results from Limetorrents.")

if __name__ == "__main__":
    test_limetorrents_search()
