# backend/celery_worker.py
from celery import Celery

celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",  # Redis broker
    backend="redis://localhost:6379/0",  # Redis backend
)

celery_app.conf.task_track_started = True  # to track ongoing tasks

import backend.tasks
