import subprocess
import json
import sys
import traceback
import asyncio
from fastapi import APIRouter, status, Request
from fastapi.concurrency import run_in_threadpool
from helper.error_messages import error_handler
from helper.is_site_available import check_if_site_available

router = APIRouter(tags=["Search Torrents"])


@router.get("")
async def search_torrents(
    request: Request, query: str, site: str, limit: int = 50, page: int = 1
):
    """
    Get Links for torrent search.
    """
    if not query:
        return error_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            message={"error": "Query is required"},
        )

    site = site.lower()
    all_sites = check_if_site_available(site)
    if not all_sites:
        return error_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            message={"error": f"{site} not supported"},
        )

    try:
        scraper_class = all_sites[site]["website"]
        scraper_instance = scraper_class()
        
        # Check if the search function is asynchronous
        if asyncio.iscoroutinefunction(scraper_instance.search):
            # If it's async, await it directly
            data = await scraper_instance.search(query, page, limit)
        else:
            # If it's synchronous, run it in a thread pool to avoid blocking
            data = await run_in_threadpool(scraper_instance.search, query, page, limit)

        if data is None:
            return error_handler(
                status_code=status.HTTP_403_FORBIDDEN,
                message={"error": "Website Blocked. Change IP or Website Domain."},
            )
        else:
            return error_handler(
                status_code=status.HTTP_200_OK,
                message={
                    "data": data.get("data", []),
                    "total": data.get("total", 0),
                    "query": query,
                    "site": site,
                    "limit": limit,
                    "page": page,
                },
            )

    except Exception as e:
        traceback.print_exc()
        return error_handler(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message={"error": f"An unexpected error occurred: {str(e)}"},
        )
