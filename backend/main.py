from fastapi import FastAPI, Request, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import traceback
from mangum import Mangum
from math import ceil
import time
import os

from routers.v1 import search_router
from routers.v1 import catergory_router as category_router
from routers.v1.combo_routers import router as combo_router
from routers.v1.sites_list_router import router as site_list_router
from routers.home_router import router as home_router
from routers.v1.search_url_router import router as search_url_router
from routers.v1.top100_router import router as top100_router
from helper.uptime import getUptime
from helper.dependencies import authenticate_request

startTime = time.time()

app = FastAPI(
    title="Torrent-Api-Py",
    version="1.0.1",
    description="Unofficial Torrent-Api",
    docs_url="/docs",
    contact={
        "name": "Neeraj Kumar",
        "url": "https://github.com/ryuk-me",
        "email": "neerajkr1210@gmail.com",
    },
)

origins = [
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
    "https://woztorrentz.netlify.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.exception_handler(Exception)
async def validation_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": f"An unexpected error occurred. {exc}"},
    )

@app.get("/")
async def root():
    return {"message": "Welcome to Torrentz-IMDB API"}

@app.get("/health")
async def health_route(req: Request):
    """
    Health Route : Returns App details.

    """
    return JSONResponse(
        {
            "app": "Torrent-Api-Py",
            "version": "v" + "1.0.1",
            "ip": req.client.host,
            "uptime": ceil(getUptime(startTime)),
        }
    )


@app.get("/test-cors")
async def test_cors():
    """
    Test endpoint to verify CORS configuration.
    """
    return JSONResponse({"message": "CORS is working!"})


app.include_router(search_router.router, prefix="/api/v1/search")
app.include_router(category_router.router, prefix="/api/v1/category", dependencies=[Depends(authenticate_request)])
app.include_router(combo_router, prefix="/api/v1/all", dependencies=[Depends(authenticate_request)])
app.include_router(site_list_router, prefix="/api/v1/sites")
app.include_router(search_url_router, prefix="/api/v1/search_url", dependencies=[Depends(authenticate_request)])
app.include_router(top100_router, prefix="/api/v1/top100")
app.include_router(home_router, prefix="")

handler = Mangum(app)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8011))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
