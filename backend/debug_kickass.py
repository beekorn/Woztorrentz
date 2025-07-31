from torrents.kickass import Kickass
import json

def test_kickass_search():
    print("Testing Kickass scraper...")
    scraper = Kickass()
    query = "ubuntu"
    page = 1
    limit = 10

    results = scraper.search(query, page, limit)

    if results and results.get('data'):
        print(f"Successfully fetched {results.get('total', 0)} results.")
        print(f"Time taken: {results.get('time'):.2f} seconds")
        if results['data']:
            print("First result:")
            print(json.dumps(results['data'][0], indent=2))
            print("\nAll results sorted by seeders:")
            for item in results['data']:
                print(f"- {item['name']} (Seeders: {item['seeders']})")
        else:
            print("No results found for the query.")
    else:
        print("Failed to fetch results from Kickass.")

if __name__ == "__main__":
    test_kickass_search()
