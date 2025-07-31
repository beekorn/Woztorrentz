
from torrents.limetorrents import Limetorrents
from torrents.pirate_bay import PirateBay
from torrents.kickass import Kickass

all_sites = {
    "piratebay": {
        "website": PirateBay,
        "trending_available": True,
        "trending_category": False,
        "recent_available": True,
        "recent_category_available": True,
        "top_100_available": True,
        "top_100_category_available": True,
        "top_100_categories": {
            "audio": 100,
            "music": 101,
            "audio_books": 102,
            "sound_clips": 103,
            "flac": 104,
            "video": 200,
            "movies": 201,
            "movies_dvdr": 202,
            "music_videos": 203,
            "movie_clips": 204,
            "tv_shows": 205,
            "handheld": 206,
            "hd_movies": 207,
            "hd_tv_shows": 208,
            "3d": 209,
            "applications": 300,
            "windows": 301,
            "mac": 302,
            "unix": 303,
            "handheld_apps": 304,
            "ios_apps": 305,
            "android_apps": 306,
            "games": 400,
            "pc_games": 401,
            "mac_games": 402,
            "psx_games": 403,
            "xbox360_games": 404,
            "wii_games": 405,
            "handheld_games": 406,
            "ios_games": 407,
            "android_games": 408,
            "other": 600,
            "ebooks": 601,
            "comics": 602,
            "pictures": 603,
            "covers": 604,
            "physibles": 605,
        },
        "categories": ["tv"],
        "limit": 50,
    },
    "kickass": {
        "website": Kickass,
        "trending_available": False,
        "trending_category": False,
        "recent_available": False,
        "recent_category_available": False,
        "categories": [],
        "limit": 50,
    },
    "limetorrents": {
        "website": Limetorrents,
        "trending_available": False,
        "trending_category": False,
        "recent_available": False,
        "recent_category_available": False,
        "categories": [],
        "limit": 50,
    },
}

sites_config = {
    key: {
        **site_info,
        "website": site_info["website"] # Store the class, not an instance
    } for key, site_info in all_sites.items()
}

def check_if_site_available(site):
    if site in all_sites.keys():
        return all_sites
    return False
