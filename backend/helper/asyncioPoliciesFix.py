import asyncio
import sys

def fix_asyncio_policy():
    """Fix asyncio policy for Windows"""
    if sys.platform.startswith('win') and hasattr(asyncio, 'WindowsProactorEventLoopPolicy'):
        # Use WindowsProactorEventLoopPolicy for better Windows compatibility
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    elif sys.platform.startswith('win') and hasattr(asyncio, 'WindowsSelectorEventLoopPolicy'):
        # Fallback to WindowsSelectorEventLoopPolicy if ProactorEventLoopPolicy is not available
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Apply the fix when module is imported
fix_asyncio_policy()
