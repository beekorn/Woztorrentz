from fastapi import APIRouter, status, Query
from fastapi.concurrency import run_in_threadpool
from typing import Optional
from helper.error_messages import error_handler
from helper.is_site_available import check_if_site_available
from torrents.pirate_bay import PirateBay

router = APIRouter(tags=["Top 100"])

@router.get("/movies")
async def get_top100_movies(page: int = 1, limit: int = 100):
    """
    Get top 100 movies from Pirate Bay based on seeders.
    """
    try:
        pb = PirateBay()
        
        # Run the synchronous top100_movies function in a thread pool
        data = await run_in_threadpool(pb.top100_movies, page, limit)

        if data is None:
            return error_handler(
                status_code=status.HTTP_403_FORBIDDEN,
                message={"error": "Website Blocked. Change IP or Website Domain."},
            )
        elif data.get("data"):
            return error_handler(
                status_code=status.HTTP_200_OK,
                message={
                    "data": data.get("data", []),
                    "total": data.get("total", 0),
                    "page": page,
                    "limit": limit,
                    "source": "Pirate Bay",
                    "time": data.get("time", 0)
                },
            )
        else:
            return error_handler(
                status_code=status.HTTP_404_NOT_FOUND,
                message={"error": "No top movies found."},
            )

    except Exception as e:
        return error_handler(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message={"error": f"An unexpected error occurred: {str(e)}"},
        )

@router.get("/categories")
async def get_top100_categories():
    """
    Get available top 100 categories.
    """
    try:
        all_sites = check_if_site_available("piratebay")
        if all_sites and "piratebay" in all_sites:
            categories = all_sites["piratebay"].get("top_100_categories", {})
            # Format categories for frontend dropdown
            formatted_categories = [
                {"value": key, "label": key.replace("_", " ").title(), "id": value}
                for key, value in categories.items()
            ]
            # Put HD Movies first as the default
            hd_movies_item = next((item for item in formatted_categories if item["value"] == "hd_movies"), None)
            if hd_movies_item:
                formatted_categories.remove(hd_movies_item)
                formatted_categories.insert(0, hd_movies_item)
            return error_handler(
                status_code=status.HTTP_200_OK,
                message={
                    "categories": formatted_categories,
                    "source": "Pirate Bay"
                },
            )
        else:
            return error_handler(
                status_code=status.HTTP_404_NOT_FOUND,
                message={"error": "Categories not available."},
            )
    except Exception as e:
        return error_handler(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message={"error": f"An unexpected error occurred: {str(e)}"},
        )

@router.get("/category/{category}")
async def get_top100_by_category(
    category: str,
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=100)
):
    """
    Get top 100 torrents by category from Pirate Bay.
    """
    try:
        all_sites = check_if_site_available("piratebay")
        if not all_sites or "piratebay" not in all_sites:
            return error_handler(
                status_code=status.HTTP_404_NOT_FOUND,
                message={"error": "Site not available."},
            )
        
        categories = all_sites["piratebay"].get("top_100_categories", {})
        if category not in categories:
            return error_handler(
                status_code=status.HTTP_404_NOT_FOUND,
                message={
                    "error": f"Category '{category}' not available.",
                    "available_categories": list(categories.keys())
                },
            )
        
        pb = PirateBay()
        category_id = categories[category]
        
        # Run the synchronous top100_category function in a thread pool
        data = await run_in_threadpool(pb.top100_category, category_id, page, limit)

        if data is None:
            return error_handler(
                status_code=status.HTTP_403_FORBIDDEN,
                message={"error": "Website Blocked. Change IP or Website Domain."},
            )
        elif data.get("data"):
            return error_handler(
                status_code=status.HTTP_200_OK,
                message={
                    "data": data.get("data", []),
                    "total": data.get("total", 0),
                    "page": page,
                    "limit": limit,
                    "category": category,
                    "category_id": category_id,
                    "source": "Pirate Bay",
                    "time": data.get("time", 0)
                },
            )
        else:
            return error_handler(
                status_code=status.HTTP_404_NOT_FOUND,
                message={"error": f"No top {category.replace('_', ' ')} found."},
            )

    except Exception as e:
        return error_handler(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message={"error": f"An unexpected error occurred: {str(e)}"},
        )
