"""gunicorn server configuration."""
import os

threads = 8
workers = 2
timeout = 0
host = "0.0.0.0"
bind = f":{os.environ.get('PORT', '10000')}"
worker_class = "uvicorn.workers.UvicornWorker"
