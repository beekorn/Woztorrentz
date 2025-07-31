from fastapi.responses import JSONResponse

def error_handler(status_code: int, message: dict):
    return JSONResponse(status_code=status_code, content=message)
